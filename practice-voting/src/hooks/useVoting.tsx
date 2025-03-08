import { useAnchorProvider } from "@/components/Providers";
import { useTransactionToast } from "@/components/useTransactionToast";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getVotingProgram, getVotingProgramID } from "anchor/src/voting-exports";
import { BN } from "bn.js";
import { useMemo } from "react";
import { toast } from "sonner";

export interface Poll {
  pollId: number;
  pollQuestion: string;
  pollStart: number;
  pollEnd: number;
  pollVotes: number;
  pollCandidates: { candidateId: number; name: string }[];
  authority: PublicKey;
}

export interface Candidate {
  candidateId: number;
  name: string;
}

export default function useVoting() {
  const provider = useAnchorProvider();
  const votingProgramId = useMemo(() => getVotingProgramID(), [])
  const votingProgram = useMemo(() => getVotingProgram(provider), [provider])
  const { publicKey } = useWallet();

  const totalPollAccounts = useQuery({
    queryKey: ['poll', 'total'],
    queryFn: async () => {
      const pollAccounts = await votingProgram.account.poll.all();

      const candidates = await votingProgram.account.candidate.all();

      const polls: Poll[] = await Promise.all(pollAccounts.map(async (poll) => {
        const pollId = poll.account.pollId.toNumber();
        const pollQuestion = poll.account.question.toString();
        const pollStart = poll.account.pollStart.toNumber();
        const pollEnd = poll.account.pollEnd.toNumber();
        const pollVotes = poll.account.totalVotes.toNumber();
        const pollCandidates = candidates.filter((candidate) => candidate.account.pollId.toNumber() === pollId);
        const authority = poll.account.authority;

        return {
          pollId,
          pollQuestion,
          pollStart,
          pollEnd,
          pollVotes,
          pollCandidates: pollCandidates.map((candidate) => ({
            candidateId: candidate.account.candidateId.toNumber(),
            name: candidate.account.name.toString()
          })),
          authority
        }
      }));

      return {
        totalPolls: pollAccounts.length,
        polls
      };
    }
  });

  const initializePoll = useMutation({
    mutationKey: ['poll', 'initialize', { votingProgramId }],
    mutationFn: async ({ question, pollStart, pollEnd }: { question: string; pollStart: number; pollEnd: number }) => {
      if (!votingProgram) throw new Error("Voting program not initialized");

      const totalPolls = await votingProgram.account.poll.all();
      const pollId = totalPolls.length + 1;

      const poll = await votingProgram.methods.inititalizePoll(
        new BN(pollId),
        question,
        new BN(pollStart),
        new BN(pollEnd),
      ).rpc();

      return poll;
    },
    onSuccess: (signature: string) => {
      totalPollAccounts.refetch();
      useTransactionToast()(signature);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      console.error(error);
    }
  })

  const addCandidates = useMutation({
    mutationKey: [],
    mutationFn: async ({ pollId, candidateId, name }: { pollId: number; candidateId: number, name: string }) => {
      if (!votingProgram) throw new Error("Voting program not initialized");

      const candidate = await votingProgram.methods.addCandidate(
        new BN(pollId),
        new BN(candidateId),
        name
      ).rpc();

      return candidate;
    },
    onSuccess: (signature: string) => {
      totalPollAccounts.refetch();
      useTransactionToast()(signature);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      console.error(error);
    }
  })

  const vote = useMutation({
    mutationKey: ["vote", { votingProgramId }],
    mutationFn: async ({ pollId, candidateId }: { pollId: number; candidateId: number }) => {
      if (!votingProgram) throw new Error("Voting program not initialized");

      const vote = await votingProgram.methods.vote(
        new BN(pollId),
        new BN(candidateId),
      ).rpc();

      return vote;
    },
    onSuccess: (signature: string) => {
      totalPollAccounts.refetch();
      useTransactionToast()(signature);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      console.error(error);
    }
  })

  const deletePoll = useMutation({
    mutationKey: ["delete-poll", { votingProgramId }],
    mutationFn: async ({ pollId, candidates }: { pollId: number, candidates: Candidate[] }) => {
      if (!votingProgram) throw new Error("Voting program not initialized");

      for (const candidate of candidates) {
        await votingProgram.methods
          .deleteCandidate(new BN(pollId), new BN(candidate.candidateId))
          .rpc();
      }

      const deletePoll = await votingProgram.methods.deletePoll(
        new BN(pollId),
      ).rpc();

      return deletePoll;
    },
    onSuccess: (signature: string) => {
      totalPollAccounts.refetch();
      useTransactionToast()(signature);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      console.error(error);
    }
  })

  return {
    totalPollAccounts,
    initializePoll,
    addCandidates,
    vote,
    deletePoll
  }
}
