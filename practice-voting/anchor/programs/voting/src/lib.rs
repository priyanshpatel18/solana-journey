#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("FEyfrbvL7uAQmLbpo1YytZtPB2DJL9Zstu7KYNEq4w2n");

#[program]
pub mod voting {
    use super::*;

    pub fn inititalize_poll(
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
        poll_account.candidate_count = 0;
        poll_account.total_votes = 0;
        Ok(())
    }

    pub fn add_candidate(
        ctx: Context<AddCandidate>,
        poll_id: u64,
        candidate_id: u64,
        name: String,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        let poll_account = &mut ctx.accounts.poll_account;

        candidate.candidate_id = candidate_id;
        candidate.name = name;
        candidate.votes = 0;
        candidate.poll_id = poll_id;

        poll_account.candidate_count += 1;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_id: u64, _candidate_id: u64) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll;
        let candidate_account = &mut ctx.accounts.candidate;
        let vote_record = &mut ctx.accounts.vote_record;

        // Check for correct candidate
        require!(
            candidate_account.poll_id == poll_account.poll_id,
            PollError::InvalidCandidate
        );

        // Check for poll time
        let current_time = Clock::get()?.unix_timestamp as u64;
        require!(
            current_time >= poll_account.poll_start && current_time <= poll_account.poll_end,
            PollError::VotingClosed
        );

        // Check for unique votes
        require!(!vote_record.has_voted, PollError::AlreadyVoted);

        poll_account.total_votes += 1;
        candidate_account.votes += 1;
        vote_record.has_voted = true;

        Ok(())
    }
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
        bump
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
        seeds = [poll_id.to_le_bytes().as_ref(), voter.key.as_ref()],
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
    pub votes: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(200)]
    pub question: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_count: u64,
    pub total_votes: u64,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub has_voted: bool,
}

#[error_code]
pub enum PollError {
    #[msg("Poll end time must be after start time")]
    InvalidPollTime,
    #[msg("Poll cannot end in the past")]
    InvalidPollEnd,
    #[msg("Voter has already voted")]
    AlreadyVoted,
    #[msg("Voting is closed")]
    VotingClosed,
    #[msg("Candidate does not belong to this poll")]
    InvalidCandidate,
}
