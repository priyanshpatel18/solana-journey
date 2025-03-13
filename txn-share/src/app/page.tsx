"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import bs58 from "bs58";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type Cluster = "mainnet-beta" | "devnet" | "testnet" | "custom";

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

export default function Page() {
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cluster, setCluster] = useState<Cluster>("mainnet-beta");
  const [customRpc, setCustomRpc] = useState("");
  const [showCustomRpc, setShowCustomRpc] = useState(false);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [shareableLink, setShareableLink] = useState("");

  function handleSignatureChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setSignature(value);
    setError(null);
    setTransaction(null);

    if (!value.trim()) {
      setError("Please enter a signature");
      return;
    }

    if (cluster === "custom" && !customRpc.trim()) {
      setError("Please enter a custom RPC URL");
      return;
    }

    try {
      const decoded = bs58.decode(value);
      if (decoded.length !== 64) {
        setError("Invalid signature: Incorrect length. Expected 64 bytes.");
      }
    } catch {
      setError("Invalid signature: Must be base58 encoded.");
    }
  }

  function handleClusterChange(value: Cluster) {
    setCluster(value);
    setShowCustomRpc(value === "custom");
    setError(null);
  }

  async function createShareableLink() {
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
      setError("Transaction not found or invalid signature.");
      return;
    }

    setTransaction({
      status: data.result.meta.err ? "Failed" : "Success",
      meta: data.result.meta,
      transaction: data.result.transaction,
      blockTime: data.result.blockTime
    });
    setShareableLink(`${window.location.origin}/tx/${signature}?cluster=${cluster}`);
    toast.success("Shareable link created!");
  }

  function getRpcUrl(): string {
    return cluster === "custom" ? customRpc : `https://api.${cluster}.solana.com`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">TxnShare</CardTitle>
            <p className="text-center text-sm opacity-70">Share Transaction Details</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createShareableLink(); }}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="cluster">Network</Label>
                  <Select value={cluster} onValueChange={(value) => handleClusterChange(value as Cluster)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mainnet-beta">Mainnet Beta</SelectItem>
                      <SelectItem value="devnet">Devnet</SelectItem>
                      <SelectItem value="testnet">Testnet</SelectItem>
                      <SelectItem value="custom">Custom RPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {showCustomRpc && (
                  <div>
                    <Label htmlFor="customRpc">Custom RPC URL</Label>
                    <Input id="customRpc" placeholder="Enter custom RPC URL" value={customRpc} onChange={(e) => setCustomRpc(e.target.value)} />
                  </div>
                )}
                <div>
                  <Label htmlFor="signature">Transaction Signature</Label>
                  <Input id="signature" placeholder="Enter transaction signature" value={signature} onChange={handleSignatureChange} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!!error}>Get Shareable Link</Button>
            </form>
            <AnimatePresence>{error && <ErrorMessage error={error} />}</AnimatePresence>
            {shareableLink && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert>
                  <Copy className="w-4 h-4 cursor-pointer" onClick={() => {
                    navigator.clipboard.writeText(shareableLink)
                    toast.success("Link copied to clipboard!");
                  }} />
                  <AlertDescription>
                    <Link href={shareableLink} className="text-blue-500 hover:underline truncate block w-full">{shareableLink}</Link>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </motion.div>
  );
}
