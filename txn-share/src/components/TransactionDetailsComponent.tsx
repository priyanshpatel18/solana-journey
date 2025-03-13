import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Copy, ExternalLink, XCircle } from "lucide-react";
import { useState } from "react";
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

export function TransactionDetailsComponent({
  transaction,
  shareableLink
}: {
  transaction: TransactionDetails | null;
  shareableLink: string
}) {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const balanceChanges = transaction.meta.postBalances.map((post, index) => {
    const pre = transaction.meta.preBalances[index];
    return post - pre;
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-6"
    >
      <Card className="overflow-hidden border-2 border-opacity-50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
          <CardTitle className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              Transaction Details
              <Badge
                className={`ml-2 ${transaction.status === "Success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
              >
                {transaction.status === "Success" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {transaction.status}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              className="mt-2 md:mt-0 transition-all hover:bg-blue-100 dark:hover:bg-blue-800"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <motion.div variants={itemVariants} className="group">
              <div className="flex flex-col md:flex-row justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Shareable Link</div>
                <div className="flex items-center mt-2 md:mt-0">
                  <span className="mr-2 text-sm font-mono truncate max-w-[200px] md:max-w-[300px]">
                    {shareableLink}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={copyToClipboard}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Block Time</div>
                <div className="mt-1 text-sm">
                  {new Date(transaction.blockTime * 1000).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Fee</div>
                <div className="mt-1 text-sm">
                  {transaction.meta.fee / 1000000000} SOL ({transaction.meta.fee} lamports)
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Blockhash</div>
              <div className="mt-1 text-sm font-mono break-all">
                {transaction.transaction.message.recentBlockhash}
              </div>
            </motion.div>

            {transaction.meta.logMessages && transaction.meta.logMessages.length > 0 && (
              <motion.div variants={itemVariants} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Log Messages</div>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {transaction.meta.logMessages.map((log, index) => (
                    <div key={index} className="text-xs font-mono py-1">
                      {log}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Balance Changes
              </div>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {transaction.transaction.message.accountKeys.map((account, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="font-mono truncate max-w-[200px] md:max-w-[300px]">
                      {account}
                    </div>
                    <ArrowRight className="w-3 h-3 mx-2" />
                    <div className={`font-mono ${balanceChanges[index] > 0 ? 'text-green-600' : balanceChanges[index] < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {balanceChanges[index] / 1000000000} SOL
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center"
                onClick={() => window.open(`https://explorer.solana.com/tx/${transaction.transaction.message.recentBlockhash}`, '_blank')}
              >
                View in Explorer
                <ExternalLink className="ml-1 w-3 h-3" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}