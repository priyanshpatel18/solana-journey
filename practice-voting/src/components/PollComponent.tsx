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
import useVoting, { Poll } from "@/hooks/useVoting";
import { useWallet } from "@solana/wallet-adapter-react";
import { CalendarIcon, Clock, PlusCircle, VoteIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PollProps {
  pollId: number;
  pollQuestion: string;
  pollStart: number;
  pollEnd: number;
  pollVotes: number;
  pollCandidates: { candidateId: number; name: string }[];
  onEdit?: () => void;
  isUserPoll?: boolean;
  polls?: Poll[];
}

export default function PollComponent({
  pollId,
  pollQuestion,
  pollStart,
  pollEnd,
  pollVotes,
  pollCandidates,
  isUserPoll,
  polls
}: PollProps) {
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const { addCandidates, vote, deletePoll } = useVoting();
  const { publicKey } = useWallet();

  const handleAddCandidate = (pollId: number, candidateName: string) => {
    if (!publicKey) return toast.error("Please connect your wallet to create a poll.");

    if (!candidateName.trim()) return toast.error("Candidate name cannot be empty.");

    const candidateCount = polls?.find((poll) => poll.pollId === pollId)?.pollCandidates.length || 0;

    const candidateId = candidateCount + 1;

    addCandidates.mutate({ pollId, candidateId, name: candidateName });

    setCandidateName("");
    setIsAddingCandidate(false);
  }

  const handleDeletePoll = async (pollId: number) => {
    if (!publicKey) return toast.error("Please connect your wallet to create a poll.");

    const poll = polls?.find((poll) => poll.pollId === pollId);

    if (!poll) return;

    const pollCandidates = poll.pollCandidates.map((candidate) => {
      return {
        candidateId: candidate.candidateId,
        name: candidate.name
      }
    });

    await deletePoll.mutateAsync({ pollId, candidates: pollCandidates });

    toast.success("Poll deleted successfully.");
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{pollQuestion}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Started: {new Date(pollStart * 1000).toLocaleString().split(",")[0]}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            Ends: {new Date(pollEnd * 1000).toLocaleString().split(",")[0]}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-1">
            <VoteIcon className="h-3 w-3" />
            Votes: {pollVotes.toString()}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {pollCandidates.map((candidate) => (
            <Button
              key={candidate.candidateId}
              variant="default"
              className="truncate"
              onClick={() => vote.mutate({ pollId, candidateId: candidate.candidateId })}
            >
              {candidate.name}
            </Button>
          ))}
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
            <Button type="submit">Add</Button>
          </div>
        </form>
      )}

      {isUserPoll && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAddingCandidate(!isAddingCandidate)}
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
          {/* <Button variant="outline" onClick={onEdit}>
            Edit Poll
          </Button> */}
          <Button variant="destructive" onClick={() => handleDeletePoll(pollId)}>
            Delete Poll
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}