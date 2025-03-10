#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("CCqSC4D4fJDj9KeKgibvyW2xd1FYuSEi8i7hjHovgDkK");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_id: u64,
        question: String,
        poll_start: u64,
        poll_end: u64,
    ) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll;

        // Ensure Poll Start is before Poll End
        require!(poll_start < poll_end, PollError::InvalidPollTime);

        // Ensure Poll End is not past
        let current_time = Clock::get()?.unix_timestamp as u64;
        require!(poll_end > current_time, PollError::InvalidPollEnd);

        poll_account.poll_id = poll_id;
        poll_account.question = question;
        poll_account.poll_start = poll_start;
        poll_account.poll_end = poll_end;
        poll_account.authority = *ctx.accounts.signer.key;
        poll_account.total_candidates = 0;

        Ok(())
    }

    pub fn add_candidate(
        ctx: Context<AddCandidate>,
        poll_id: u64,
        candidate_id: u64,
        candidate_name: String,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        let poll_account = &mut ctx.accounts.poll_account;

        candidate.candidate_id = candidate_id;
        candidate.name = candidate_name;
        candidate.poll_id = poll_id;

        poll_account.total_candidates += 1;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, poll_id: u64, candidate_id: u64) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll;
        let vote_record = &mut ctx.accounts.vote_record;

        // Check for poll time
        let current_time = Clock::get()?.unix_timestamp as u64;
        require!(
            current_time >= poll_account.poll_start && current_time <= poll_account.poll_end,
            PollError::VotingClosed
        );

        // Check for unique votes
        require!(!vote_record.has_voted, PollError::AlreadyVoted);

        vote_record.has_voted = true;
        vote_record.candidate_id = candidate_id;
        vote_record.poll_id = poll_id;

        Ok(())
    }

    pub fn delete_poll(ctx: Context<DeletePoll>, _poll_id: u64) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll_account;

        // Check for authority
        require!(
            *ctx.accounts.signer.key == poll_account.authority,
            PollError::Unauthorized
        );

        if poll_account.total_candidates > 0 {
            return Err(PollError::CandidatesExist.into());
        }

        Ok(())
    }

    pub fn delete_candidate(
        ctx: Context<DeleteCandidate>,
        _poll_id: u64,
        _candidate_id: u64,
    ) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll_account;

        // Check for authority
        require!(
            *ctx.accounts.signer.key == poll_account.authority,
            PollError::Unauthorized
        );

        poll_account.total_candidates -= 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_id: u64)]
pub struct DeleteCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll_account: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_id.to_le_bytes().as_ref()],
        bump,
        close = signer
    )]
    pub candidate_account: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct DeletePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump,
        constraint = poll_account.authority == *signer.key @ PollError::Unauthorized,
        close = signer
    )]
    pub poll_account: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_id: u64)]
pub struct AddCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump,
        constraint = poll_account.authority == *signer.key @ PollError::Unauthorized
    )]
    pub poll_account: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_id.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_id: u64)]
pub struct Vote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_id.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote" ,poll_id.to_le_bytes().as_ref(), voter.key.as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub candidate_id: u64,
    pub poll_id: u64,
    #[max_len(100)]
    pub name: String,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(200)]
    pub question: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub authority: Pubkey,
    pub total_candidates: u64,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub has_voted: bool,
    pub candidate_id: u64,
    pub poll_id: u64,
}

#[error_code]
pub enum PollError {
    #[msg("Poll start time must be before the end time.")]
    InvalidPollTime,
    #[msg("Poll end time cannot be in the past.")]
    InvalidPollEnd,
    #[msg("You have already voted in this poll.")]
    AlreadyVoted,
    #[msg("Voting for this poll is closed.")]
    VotingClosed,
    #[msg("Selected candidate does not belong to this poll.")]
    InvalidCandidate,
    #[msg("Invalid poll reference.")]
    InvalidPoll,
    #[msg("Only the poll creator can modify this poll")]
    Unauthorized,
    #[msg("Candidates still exist for this poll. Remove them before deleting the poll.")]
    CandidatesExist,
}
