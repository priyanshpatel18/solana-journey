import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Voting } from "anchor/target/types/voting";
const IDL = require("../../target/idl/voting.json");

const votingAddress = new PublicKey("CCqSC4D4fJDj9KeKgibvyW2xd1FYuSEi8i7hjHovgDkK");

describe("Voting Program", () => {
  let context;
  let provider: BankrunProvider;
  let program: anchor.Program<Voting>;
  let pollId = new anchor.BN(1);
  let candidateId = new anchor.BN(1);

  beforeAll(async () => {
    context = await startAnchor("", [{ name: "voting", programId: votingAddress }], []);
    provider = new BankrunProvider(context);
    program = new anchor.Program<Voting>(IDL, provider);
  });

  it("Initializes a poll successfully", async () => {
    await program.methods
      .initializePoll(
        pollId,
        "Who should be the next president?",
        new anchor.BN(Date.now() / 1000),
        new anchor.BN(Date.now() / 1000 + 86400)
      )
      .rpc();


    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );
    const poll = await program.account.poll.fetch(pollAddress);

    expect(poll.pollId.toString()).toEqual(pollId.toString());
  });

  it("Fails to initialize a poll with an invalid time", async () => {
    try {
      await program.methods
        .initializePoll(pollId, "Test Poll", new anchor.BN(Date.now() / 1000 + 100), new anchor.BN(Date.now() / 1000 + 10))
        .rpc();
      throw new Error("Should have failed");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toContain("Poll start time must be before the end time.");
    }
  });

  it("Fails to create a poll with the same ID", async () => {
    try {
      await program.methods
        .initializePoll(pollId, "Duplicate Poll", new anchor.BN(Date.now() / 1000 + 10), new anchor.BN(Date.now() / 1000 + 100))
        .rpc();
      throw new Error("Should have failed");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toContain("Poll already exists.");
    }
  });

  it("Adds candidates successfully", async () => {
    const candidate1 = "John Doe";
    const candidate2 = "Alice Smith";

    await program.methods
      .addCandidate(pollId, candidateId, candidate1)
      .rpc();

    await program.methods
      .addCandidate(pollId, new anchor.BN(2), candidate2)
      .rpc();

    const [candidateAddress1] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );
    const [candidateAddress2] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8), new anchor.BN(2).toArrayLike(Buffer, "le", 8)],
      votingAddress
    )

    const candidate1Account = await program.account.candidate.fetch(candidateAddress1);
    const candidate2Account = await program.account.candidate.fetch(candidateAddress2);

    expect(candidate1Account.candidateId.toNumber()).toEqual(1);
    expect(candidate2Account.candidateId.toNumber()).toEqual(2);
  });

  it("Fails to add a candidate to a non-existent poll", async () => {
    try {
      await program.methods
        .addCandidate(new anchor.BN(999), candidateId, "Jane Doe")
        .rpc();
      throw new Error("Should have failed");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toEqual("Invalid poll reference.");
    }
  });

  it("Allows voting successfully", async () => {
    const publicKey = provider.wallet.publicKey;

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );
    const poll = await program.account.poll.fetch(pollAddress);

    console.log("Poll Start Time:", poll.pollStart.toNumber());
    console.log("Poll End Time:", poll.pollEnd.toNumber());
    console.log("Current Time:", Math.floor(Date.now() / 1000));


    await program.methods.vote(pollId, candidateId).rpc();

    const [voteRecordAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vote"),
        pollId.toArrayLike(Buffer, "le", 8),
        publicKey.toBuffer(),
      ],
      votingAddress
    );

    const vote = await program.account.voteRecord.fetch(voteRecordAccount);
    expect(vote.hasVoted).toBeTruthy();

  });

  it("Fails if a voter tries to vote twice", async () => {
    try {
      await program.methods
        .vote(pollId, candidateId)
        .rpc();
      throw new Error("Should have failed");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toContain("You have already voted in this poll.");
    }
  });

  it("Fails if voting for a non-existent candidate", async () => {
    try {
      await program.methods.vote(pollId, new anchor.BN(999)).rpc();
      throw new Error("Should have failed");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toContain("Candidate not found.");
    }
  });

  it("Fails if voting outside the poll timeframe", async () => {
    const expiredPollId = new anchor.BN(2);
    await program.methods
      .initializePoll(expiredPollId, "Expired Poll", new anchor.BN(Date.now() / 1000 - 100), new anchor.BN(Date.now() / 1000 - 10))
      .rpc();

    try {
      await program.methods.vote(expiredPollId, candidateId).rpc();
      throw new Error("Should have failed");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toContain("Poll has ended.");
    }
  });

  it("Deletes a candidate successfully", async () => {

    const tx = await program.methods.deleteCandidate(pollId, candidateId).rpc();
    await program.methods.deleteCandidate(pollId, new anchor.BN(2)).rpc();

    expect(tx).toBeTruthy();
  });

  it("Fails to delete a non-existent candidate", async () => {
    try {
      await program.methods.deleteCandidate(pollId, new anchor.BN(999)).rpc();
      throw new Error("Should have failed");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toContain("Candidate not found.");
    }
  });

  it("Deletes a poll successfully", async () => {
    await program.methods.deletePoll(pollId).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    try {
      await program.account.poll.fetch(pollAddress);
      throw new Error("Poll still exists after deletion!");
    } catch (err) {
      if (err instanceof Error)
        expect(err.message).toContain(`Could not find ${pollAddress}`);
    }

  });
});
