"use client";

import PollComponent from "@/components/PollComponent";
import { WalletButton } from "@/components/WalletButton";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useVoting from "@/hooks/useVoting";
import { useStore } from "@/store";
import { useWallet } from "@solana/wallet-adapter-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, ImageOff, PlusCircle } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  // On-chain queries and mutations
  const { initializePoll, totalPollAccounts } = useVoting();
  const { publicKey } = useWallet();
  const polls = useMemo(() => totalPollAccounts.data?.polls, [totalPollAccounts.data]);
  const userPolls = useMemo(() => polls?.filter((poll) => poll.authority.toBase58() === publicKey?.toBase58()), [totalPollAccounts.data]);

  // Page States
  const [question, setQuestion] = useState("");
  const [pollEnd, setPollEnd] = useState(0);
  const [pollStart, setPollStart] = useState(0);
  const [activeTab, setActiveTab] = useState("browse");
  const [isCreating, setIsCreating] = useState(false);
  const { isLoading, setLoading } = useStore();

  // Get today's date and 7 days from now for default values
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value).getTime();
    setPollStart(selectedDate);

    // Ensure end date is at least one day after start date
    if (selectedDate >= pollEnd) {
      setPollEnd(selectedDate + 86400000);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value).getTime();

    // Prevent selecting an end date before the start date
    if (selectedDate > pollStart) {
      setPollEnd(selectedDate);
    }
  };

  // Format for date picker
  const formatForInput = (date: Date) => format(date, "yyyy-MM-dd");

  // Handler for creating a new poll
  const handleCreatePoll = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!publicKey) return toast.error("Please connect your wallet to create a poll.");

    if (!question.trim()) return toast.error("Poll question cannot be empty.");

    const startTime = new Date(pollStart || today).getTime() / 1000;
    const endTime = new Date(pollEnd || nextWeek).getTime() / 1000;

    if (startTime === 0 || endTime === 0) {
      return toast.error("Please select a start and end date for the poll.");
    }
    if (startTime >= endTime) {
      return toast.error("Poll start time must be before the end time.");
    }

    setLoading(true);

    initializePoll.mutate({ question, pollStart: startTime, pollEnd: endTime });

    setQuestion("");
    setIsCreating(false);
    setActiveTab("myPolls");
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <motion.h1
          className="text-3xl font-bold tracking-tight"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Decentralized Voting
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <WalletButton />
        </motion.div>
      </div>

      <motion.div
        className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-center justify-between"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h2 className="font-medium">Active Polls</h2>
          <p className="text-sm text-muted-foreground">Total polls on platform: {polls?.length || 0}</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="gap-2"
          variant="outline"
          disabled={isLoading}
        >
          <PlusCircle className="h-4 w-4" />
          Create Poll
        </Button>
      </motion.div>

      {isCreating && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Create New Poll</CardTitle>
              <CardDescription>Enter the details for your new voting poll</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Poll Question</Label>
                  <Input
                    id="question"
                    placeholder="What would you like to ask?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <div className="flex items-center">
                      <Input
                        id="start-date"
                        type="date"
                        defaultValue={formatForInput(today)}
                        onChange={handleStartDateChange}
                        min={formatForInput(today)}
                        className="cursor-pointer w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <div className="flex items-center">
                      <Input
                        id="end-date"
                        type="date"
                        defaultValue={formatForInput(nextWeek)}
                        onChange={handleEndDateChange}
                        min={formatForInput(today)}
                        className="cursor-pointer w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <div
                    className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    Create Poll
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div >
      )
      }

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Polls</TabsTrigger>
          <TabsTrigger value="myPolls">My Polls</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4">
          {polls && polls.length > 0 ? (
            <motion.div
              className="grid gap-4 md:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {polls.map((poll) => {
                if (poll.pollCandidates.length < 2) return null;

                return (
                  <motion.div variants={itemVariants} key={poll.pollId.toString()}>
                    <PollComponent
                      pollId={poll.pollId}
                      pollQuestion={poll.pollQuestion}
                      pollStart={poll.pollStart}
                      pollEnd={poll.pollEnd}
                      pollCandidates={poll.pollCandidates}
                      isUserPoll={false}
                      polls={polls}
                      pollVotes={poll.pollVotes}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center w-full p-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center justify-center w-full text-center"
              >
                <ImageOff className="w-20 h-20 text-muted-foreground" />
                <span className="mt-4 text-lg text-muted-foreground">
                  No polls available. Create one to get started!
                </span>
              </motion.div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="myPolls" className="mt-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 "
          >
            {userPolls && userPolls.length > 0 ? (
              userPolls.map((userPoll) => (
                <motion.div key={userPoll.pollId.toString()} variants={itemVariants}>
                  <PollComponent
                    pollId={userPoll.pollId}
                    pollQuestion={userPoll.pollQuestion}
                    pollStart={userPoll.pollStart}
                    pollEnd={userPoll.pollEnd}
                    isUserPoll={true}
                    pollCandidates={userPoll.pollCandidates}
                    polls={userPolls}
                    pollVotes={userPoll.pollVotes}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="text-center p-12 border rounded-lg"
              >
                <p className="text-muted-foreground mb-2">You haven't created any polls yet</p>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Your First Poll
                </Button>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div >
  );
}