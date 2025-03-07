import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import VotingIDL from "../target/idl/voting.json";
import type { Voting } from "../target/types/voting";

export { Voting, VotingIDL };

export const VOTING_PROGRAM_ID = new PublicKey(VotingIDL.address);

export function getVotingProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...VotingIDL, address: address ? address : VotingIDL.address } as Voting, provider);
}

export function getVotingProgramID() {
  return new PublicKey(VOTING_PROGRAM_ID);
}