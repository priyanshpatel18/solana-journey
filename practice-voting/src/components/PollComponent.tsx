"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useVoting, { Candidate, Poll } from "@/hooks/useVoting";
import { useStore } from "@/store";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import { CalendarIcon, Clock, PlusCircle, VoteIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTransactionToast } from "./useTransactionToast";

interface PollProps {
  pollId: number;
  pollQuestion: string;
  pollStart: number;
  pollEnd: number;
  pollCandidates: Candidate[];
  onEdit?: () => void;
  isUserPoll?: boolean;
  polls: Poll[];
  pollVotes: number;
}

export default function PollComponent({
  pollId,
  pollQuestion,
  pollStart,
  pollEnd,
  pollCandidates,
  isUserPoll,
  polls,
  pollVotes,
}: PollProps) {
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const { addCandidates, vote, votingProgram, totalPollAccounts } = useVoting();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { isLoading, setLoading } = useStore();

  const handleAddCandidate = (pollId: number, candidateName: string) => {
    if (!publicKey) return toast.error("Please connect your wallet to create a poll.");

    if (!candidateName.trim()) return toast.error("Candidate name cannot be empty.");
    setLoading(true);

    const candidateCount = polls?.find((poll) => poll.pollId === pollId)?.pollCandidates.length || 0;

    const candidateId = candidateCount + 1;

    addCandidates.mutate({ pollId, candidateId, name: candidateName });

    setCandidateName("");
    setIsAddingCandidate(false);
  }

  const handleDeletePoll = async (pollId: number) => {
    if (!publicKey) return toast.error("Please connect your wallet to delete a poll.");

    const poll = polls?.find((poll) => poll.pollId === pollId);
    if (!poll) return;

    try {
      setLoading(true);
      const txn = new Transaction();

      for (const candidate of poll.pollCandidates) {
        const deleteCandidateIx = await votingProgram.methods
          .deleteCandidate(new BN(pollId), new BN(candidate.candidateId))
          .instruction();
        txn.add(deleteCandidateIx);
      }

      const deletePollIx = await votingProgram.methods
        .deletePoll(new BN(pollId))
        .instruction();
      txn.add(deletePollIx);

      const signature = await sendTransaction(txn, connection);
      const result = await connection.confirmTransaction(signature, "confirmed");

      if (result.value) {
        useTransactionToast("Poll deleted successfully!")(signature);
        totalPollAccounts.refetch();
      }
    } catch (error) {
      console.error("Error deleting poll:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleVote = (pollId: number, candidateId: number) => {
    if (!publicKey) return toast.error("Please connect your wallet to vote.");
    if (isUserPoll || polls.find((poll) => poll.pollId === pollId)?.authority.toBase58() === publicKey.toBase58()) return toast.error("You cannot vote on your own poll.");

    setLoading(true);
    vote.mutate({ pollId, candidateId });

    setIsAddingCandidate(false);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{pollQuestion}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(pollStart * 1000).toLocaleString().split(",")[0]}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {new Date(pollEnd * 1000).toLocaleString().split(",")[0]}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-1">
            <VoteIcon className="h-3 w-3" />
            Votes: {pollVotes}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {pollCandidates.map((candidate) =>
            <Button
              key={candidate.candidateId}
              variant="default"
              className={`truncate ${isUserPoll && "cursor-default hover:bg-primary"}`}
              onClick={() => {
                if (isUserPoll) return;
                handleVote(pollId, candidate.candidateId)
              }}
              disabled={isLoading}
            >
              {candidate.name}{" "}{isUserPoll && `(${candidate.votes})`}
            </Button>
          )}
        </div>
      </CardContent>

      {isUserPoll && isAddingCandidate && (
        <form className="px-6 py-4 space-y-2" onSubmit={(e) => {
          e.preventDefault();
          handleAddCandidate(pollId, candidateName);
        }}>
          <Label htmlFor="candidate-name">Candidate Name</Label>
          <div className="flex gap-2">
            <Input
              autoFocus
              id="candidate-name"
              placeholder="Enter candidate name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
            <Button
              type="submit"
              disabled={isLoading}
            >
              Add
            </Button>
          </div>
        </form>
      )}

      {isUserPoll && (
        <CardFooter className="flex justify-center lg:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAddingCandidate(!isAddingCandidate)}
            disabled={isLoading}
          >
            {isAddingCandidate ? (
              "Cancel"
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Candidate
              </>
            )}
          </Button>
          {/* <Button
            variant="outline"
            onClick={onEdit}
            disabled={isLoading}
          >
            Edit Poll
          </Button> */}
          <Button
            disabled={isLoading}
            variant="destructive"
            onClick={() => handleDeletePoll(pollId)}
          >
            Delete Poll
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}