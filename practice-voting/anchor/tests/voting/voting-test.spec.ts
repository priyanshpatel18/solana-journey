import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { BankrunProvider, startAnchor } from 'anchor-bankrun';
import { Voting } from 'anchor/target/types/voting';
const IDL = require("../../target/idl/voting.json");

const votingAddress = new PublicKey("CCqSC4D4fJDj9KeKgibvyW2xd1FYuSEi8i7hjHovgDkK");

describe('Voting Program', () => {
  let context;
  let provider;
  let votingProgram: anchor.Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor("", [{ name: "voting", programId: votingAddress }], []);
    provider = new BankrunProvider(context);
    votingProgram = new anchor.Program<Voting>(
      IDL,
      provider
    )
  });

  it('initializePoll', async () => {
    const pollId = new anchor.BN(1);
    const pollStart = new anchor.BN(1741372200);
    const days = 7;
    const pollEnd = new anchor.BN(pollStart.toNumber() + (days * 86400));

    await votingProgram.methods.inititalizePoll(
      pollId,
      "Who is the best blockchain?",
      pollStart,
      pollEnd
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.pollId.toNumber()).toEqual(pollId.toNumber());
    expect(poll.question).toEqual("Who is the best blockchain?");
    expect(poll.pollStart.toNumber()).toEqual(pollStart.toNumber());
    expect(poll.pollEnd.toNumber()).toEqual(pollEnd.toNumber());
    expect(poll.totalVotes.toNumber()).toEqual(0);
    expect(poll.candidateCount.toNumber()).toEqual(0);
  });

  it('addCandidate', async () => {
    const pollId = new anchor.BN(1);
    const candidateId = new anchor.BN(1);
    const candidateName = "Solana";

    await votingProgram.methods.addCandidate(pollId, candidateId, candidateName).rpc();

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8), candidateId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const candidate = await votingProgram.account.candidate.fetch(candidateAddress);

    expect(candidate.candidateId.toNumber()).toEqual(candidateId.toNumber());
    expect(candidate.name).toEqual(candidateName);
    expect(candidate.votes.toNumber()).toEqual(0);
  })

  it("vote", async () => {
    const pollId = new anchor.BN(1);
    const candidateId = new anchor.BN(1);

    await votingProgram.methods.vote(pollId, candidateId).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.totalVotes.toNumber()).toEqual(1);
    expect(poll.candidateCount.toNumber()).toEqual(1);
  });

  it("vote_twice", async () => {
    const pollId = new anchor.BN(1);
    const candidateId = new anchor.BN(1);

    await votingProgram.methods.vote(pollId, candidateId).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.totalVotes.toNumber()).toEqual(1);
    expect(poll.candidateCount.toNumber()).toEqual(1);
  });
});