"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import bs58 from "bs58";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ChevronLeft,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TransactionMeta {
  fee: number;
  preBalances: number[];
  postBalances: number[];
  logMessages?: string[];
  err?: any;
}

interface TransactionMessage {
  recentBlockhash: string;
  accountKeys: string[];
  instructions: any[];
}

interface TransactionDetails {
  status: string;
  meta: TransactionMeta;
  transaction: { message: TransactionMessage };
  blockTime: number;
  slot?: number;
}

export default function TransactionPage() {
  const params = useParams();
  const signature = params.signature as string;

  const query = useSearchParams();
  const cluster = query.get("cluster") || "mainnet-beta";
  const customRpc = query.get("customRpc") || "";

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  useEffect(() => {
    if (signature) {
      fetchTransactionDetails();
    }
  }, [signature]);

  function getRpcUrl(): string {
    switch (cluster) {
      case "mainnet-beta":
        return "https://api.mainnet-beta.solana.com";
      case "devnet":
        return "https://api.devnet.solana.com";
      case "testnet":
        return "https://api.testnet.solana.com";
      case "custom":
        return customRpc;
      default:
        return "https://api.mainnet-beta.solana.com";
    }
  }

  async function fetchTransactionDetails() {
    setLoading(true);
    setError(null);

    try {
      // Validate signature
      try {
        const decoded = bs58.decode(signature);
        if (decoded.length !== 64) {
          throw new Error("Invalid signature length");
        }
      } catch (err) {
        throw new Error("Invalid signature format");
      }

      const rpc = getRpcUrl();
      const response = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [signature, { encoding: "json", commitment: "finalized" }]
        })
      });

      const data = await response.json();

      if (!data.result) {
        throw new Error("Transaction not found");
      }

      const txn: TransactionDetails = {
        status: data.result.meta.err ? "Failed" : "Success",
        meta: data.result.meta,
        transaction: data.result.transaction,
        blockTime: data.result.blockTime,
        slot: data.result.slot
      };

      setTransaction(txn);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transaction details");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full"
        >
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="bg-red-50 text-red-800">
              <CardTitle className="flex items-center text-lg">
                <XCircle className="w-5 h-5 mr-2" />
                Error Loading Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700">{error}</p>
              <div className="mt-6 flex flex-col xs:flex-row gap-3 xs:gap-0 xs:justify-between">
                <Link href="/">
                  <Button variant="outline" className="flex items-center w-full xs:w-auto">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Home
                  </Button>
                </Link>
                <Button onClick={fetchTransactionDetails} className="flex items-center w-full xs:w-auto">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  // Calculate balance changes
  const balanceChanges = transaction.meta.postBalances.map((post, index) => {
    const pre = transaction.meta.preBalances[index];
    return post - pre;
  });

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      {loading && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
            <p className="mt-4 text-lg text-muted">Loading transaction details...</p>
          </motion.div>
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-0">
            <Link href="/">
              <Button variant="ghost" className="flex items-center w-full xs:w-auto justify-center xs:justify-start">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={fetchTransactionDetails}
              className="flex items-center w-full xs:w-auto justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-2 border-opacity-50 shadow-lg overflow-hidden">
            <CardHeader className="border-b p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-sm">Transaction Signature</p>
                  <div className="flex items-center">
                    <h1 className="text-sm sm:text-lg font-mono tracking-tight truncate max-w-[200px] xs:max-w-[280px] sm:max-w-[400px]">
                      {signature}
                    </h1>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyToClipboard}
                      className="ml-2"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Badge
                  className={`${transaction.status === "Success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    } flex items-center px-3 py-1 text-sm self-start sm:self-auto`}
                >
                  {transaction.status === "Success" ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {transaction.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex border-b overflow-x-auto">
                <Button
                  variant="ghost"
                  className={`py-2 sm:py-3 px-3 sm:px-4 rounded-none cursor-pointer ${selectedTab === "overview" && "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"}`}
                  onClick={() => setSelectedTab("overview")}
                >
                  Overview
                </Button>
                <Button
                  variant="ghost"
                  className={`py-2 sm:py-3 px-3 sm:px-4 rounded-none cursor-pointer ${selectedTab === "logs" && "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"}`}
                  onClick={() => setSelectedTab("logs")}
                >
                  Logs
                </Button>
                <Button
                  variant="ghost"
                  className={`py-2 sm:py-3 px-3 sm:px-4 rounded-none cursor-pointer ${selectedTab === "accounts" && "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"}`}
                  onClick={() => setSelectedTab("accounts")}
                >
                  Accounts
                </Button>
              </div>

              <div className="p-4 sm:p-6">
                {selectedTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                      <div className="border-2 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium">Block Time</p>
                        <p className="mt-1 text-sm sm:text-base break-words">
                          {new Date(transaction.blockTime * 1000).toLocaleString()}
                        </p>
                      </div>

                      <div className="border-2 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium">Transaction Fee</p>
                        <p className="mt-1 text-sm sm:text-base">
                          {transaction.meta.fee / 1000000000} SOL ({transaction.meta.fee} lamports)
                        </p>
                      </div>

                      {transaction.slot && (
                        <div className="border-2 p-3 sm:p-4 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium">Slot</p>
                          <p className="mt-1 text-sm sm:text-base">{transaction.slot}</p>
                        </div>
                      )}

                      <div className="border-2 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium">Recent Blockhash</p>
                        <p className="mt-1 text-xs sm:text-sm font-mono break-all">
                          {transaction.transaction.message.recentBlockhash}
                        </p>
                      </div>
                    </div>

                    <div className="border-2 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium">Detailed Status</p>
                      <div className="mt-2">
                        {transaction.meta.err ? (
                          <div className="text-red-600 dark:text-red-400">
                            <p className="font-medium text-sm">Error:</p>
                            <pre className="mt-1 text-xs overflow-x-auto p-2 bg-red-50 dark:bg-red-900/30 rounded">
                              {JSON.stringify(transaction.meta.err, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-green-600 dark:text-green-400 text-sm">Transaction completed successfully</p>
                        )}
                      </div>
                    </div>

                    <div className="border-2 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium">Instructions</p>
                      <div className="mt-2 space-y-3">
                        {transaction.transaction.message.instructions.map((instruction, idx) => (
                          <div key={idx} className="p-2 sm:p-3 border bg-muted rounded-md">
                            <p className="font-medium text-xs sm:text-sm">Instruction {idx + 1}</p>
                            <div className="mt-2 overflow-x-auto">
                              <pre className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(instruction, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedTab === "logs" && (
                  <motion.div
                    key="logs"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                  >
                    <div className="border-2 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium mb-3">Log Messages</p>
                      {transaction.meta.logMessages && transaction.meta.logMessages.length > 0 ? (
                        <div className="bg-black text-green-400 p-3 sm:p-4 rounded-md font-mono text-xs overflow-x-auto max-h-64 sm:max-h-96 overflow-y-auto">
                          {transaction.meta.logMessages.map((log, index) => (
                            <div key={index} className="py-1 break-words whitespace-pre-wrap">
                              {log}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted italic text-sm">No log messages available</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Accounts Tab */}
                {selectedTab === "accounts" && (
                  <motion.div
                    key="accounts"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                  >
                    <div className="border-2 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium mb-3">Account Balance Changes</p>
                      <div className="overflow-x-auto -mx-3 sm:-mx-4">
                        <table className="w-full min-w-[640px]">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 sm:px-4 text-left text-xs font-medium">Account</th>
                              <th className="py-2 px-3 sm:px-4 text-left text-xs font-medium">Pre-Balance (SOL)</th>
                              <th className="py-2 px-3 sm:px-4 text-left text-xs font-medium">Post-Balance (SOL)</th>
                              <th className="py-2 px-3 sm:px-4 text-left text-xs font-medium">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transaction.transaction.message.accountKeys.map((account, index) => (
                              <tr key={index} className="border-b border-border">
                                <td className="py-2 sm:py-3 px-3 sm:px-4">
                                  <div className="font-mono text-xs truncate max-w-[140px] sm:max-w-[180px] md:max-w-[220px]">
                                    {account}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-3 px-3 sm:px-4 font-mono text-xs">
                                  {transaction.meta.preBalances[index] / 1000000000}
                                </td>
                                <td className="py-2 sm:py-3 px-3 sm:px-4 font-mono text-xs">
                                  {transaction.meta.postBalances[index] / 1000000000}
                                </td>
                                <td className={`py-2 sm:py-3 px-3 sm:px-4 font-mono text-xs ${balanceChanges[index] > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : balanceChanges[index] < 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-muted'
                                  }`}>
                                  {balanceChanges[index] > 0 ? '+' : ''}
                                  {balanceChanges[index] / 1000000000}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 sm:mt-6 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0">
          <p className="text-xs sm:text-sm">
            TxnShare • Solana Transaction Details
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://explorer.solana.com/tx/${signature}`, '_blank')}
            className="flex items-center w-full xs:w-auto justify-center"
          >
            View in Explorer
            <ExternalLink className="ml-1 w-3 h-3" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}