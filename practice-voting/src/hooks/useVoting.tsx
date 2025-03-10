import { useAnchorProvider } from "@/components/Providers";
import { useTransactionToast } from "@/components/useTransactionToast";
import { useStore } from "@/store";
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
  pollCandidates: { candidateId: number; name: string }[];
  pollVotes: number;
  authority: PublicKey;
}

export interface Candidate {
  candidateId: number;
  name: string;
  votes?: number;
}

export default function useVoting() {
  const provider = useAnchorProvider();
  const votingProgramId = useMemo(() => getVotingProgramID(), [])
  const votingProgram = useMemo(() => getVotingProgram(provider), [provider])
  const { setLoading } = useStore();
  const { publicKey } = useWallet();

  const totalPollAccounts = useQuery({
    queryKey: ['poll', 'total'],
    queryFn: async () => {
      const pollAccounts = await votingProgram.account.poll.all();

      const candidates = await votingProgram.account.candidate.all();

      const votes = await votingProgram.account.voteRecord.all();

      const polls: Poll[] = await Promise.all(pollAccounts.map(async (poll) => {
        const pollId = poll.account.pollId.toNumber();
        const pollQuestion = poll.account.question.toString();
        const pollStart = poll.account.pollStart.toNumber();
        const pollEnd = poll.account.pollEnd.toNumber();
        const pollCandidates = candidates.filter((candidate) => candidate.account.pollId.toNumber() === pollId);
        const pollVotes = votes.filter((vote) => vote.account.pollId.toNumber() === pollId).length;
        const authority = poll.account.authority;

        return {
          pollId,
          pollQuestion,
          pollStart,
          pollEnd,
          pollCandidates: pollCandidates.map((candidate) => ({
            candidateId: candidate.account.candidateId.toNumber(),
            name: candidate.account.name.toString(),
            votes: votes.filter((vote) => vote.account.candidateId.toNumber() === candidate.account.candidateId.toNumber() && vote.account.pollId.toNumber() === pollId).length
          })),
          pollVotes,
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

      const poll = await votingProgram.methods.initializePoll(
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
      setLoading(false);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      console.error(error);
      setLoading(false);
    },
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
      setLoading(false);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      console.error(error);
      setLoading(false);
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
      setLoading(false);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      console.error(error);
      setLoading(false);
    }
  })

  return {
    totalPollAccounts,
    initializePoll,
    addCandidates,
    vote,
    votingProgram
  }
}
