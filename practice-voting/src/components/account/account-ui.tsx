"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ellipsify } from "@/lib/ellipsify";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { CopyIcon, RefreshCwIcon, SquareArrowOutUpRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useGetBalance, useGetSignatures, useRequestAirdrop, useTransferSol } from "./account-data-access";

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address });

  return (
    <div>
      <h1 className=" text-center text-5xl font-bold cursor-pointer" onClick={() => query.refetch()}>
        {query.data ? <BalanceSol balance={query.data} /> : '0'} SOL
      </h1>
    </div>
  )
}

export function AccountButtons({ address }: { address: PublicKey }) {
  const [openDialog, setOpenDialog] = useState<"airdrop" | "send" | "receive" | null>(null);
  const { connected } = useWallet()
  const [buttonDisabled, setButtonDisabled] = useState(false)

  useEffect(() => {
    if (!connected) {
      setButtonDisabled(true)
    } else {
      setButtonDisabled(false)
    }
  }, [connected])

  return (
    <Dialog
      modal
      open={!!openDialog}
      onOpenChange={() => setOpenDialog(null)}
    >
      {openDialog === "airdrop" && (
        <AirdropDialog
          address={address}
          setOpenDialog={setOpenDialog}
        />
      )}
      {openDialog === "send" && (
        <SendDialog
          address={address}
          setOpenDialog={setOpenDialog}
        />
      )}
      {
        openDialog === "receive" && (
          <ReceiveDialog
            address={address}
          />
        )
      }

      <div className="flex space-x-4">
        <Button disabled={buttonDisabled} onClick={() => setOpenDialog("airdrop")}>
          Airdrop
        </Button>
        <Button disabled={buttonDisabled} onClick={() => setOpenDialog("send")}>
          Send
        </Button>
        <Button onClick={() => setOpenDialog("receive")}>
          Receive
        </Button>
      </div>
    </Dialog>
  )
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <div className="w-full">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <div className="flex gap-2 items-center">
          {query.isSuccess && query.data.length > 5 && (
            <Button onClick={() => setShowAll(!showAll)}>{showAll ? "Show Less" : "Show All"}</Button>
          )}
          <Button variant={"default"} onClick={() => {
            query.refetch();
            toast.success("Transactions refreshed")
          }}>
            <RefreshCwIcon />
          </Button>
        </div>
      </div>
      {query.isError && <pre className="alert alert-error">Error: {query.error?.message.toString()}</pre>}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No transactions found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signature</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Block Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.signature}>
                    <TableCell>
                      <Link
                        href={`https://explorer.solana.com/tx/${item.signature}?cluster=devnet`}
                        className="underline-offset-4 underline flex gap-1 items-center"
                        target="_blank"
                      >
                        {ellipsify(item.signature, 8)}
                        <SquareArrowOutUpRightIcon className="w-3.5 h-3.5" />
                      </Link>
                    </TableCell>
                    <TableCell>{item.slot}</TableCell>
                    <TableCell>{new Date((item.blockTime ?? 0) * 1000).toISOString()}</TableCell>
                    <TableCell>
                      <Badge>
                        {item.err ? "Failed" : "Success"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )
      }
    </div >
  )
}
function BalanceSol({ balance }: { balance: number }) {
  return <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
}

function AirdropDialog({ address, setOpenDialog }: { address: PublicKey, setOpenDialog: any }) {
  const mutation = useRequestAirdrop({ address });
  const [amount, setAmount] = useState('')

  return (
    <DialogContent>
      <DialogTitle>Airdrop</DialogTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutateAsync(parseFloat(amount))
          setOpenDialog(null)
        }}
        className="flex flex-col gap-4"
      >
        <Input
          type="number"
          step="any"
          min={0.1}
          max={2}
          placeholder="Amount (Max: 2 SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          disabled={!amount || mutation.isPending || Number(amount) > 2 || Number(amount) < 0.1}
          type="submit"
        >
          {mutation.isPending ? 'Airdropping...' : 'Airdrop'}
        </Button>
      </form>
    </DialogContent >
  )
}

function SendDialog({ address, setOpenDialog }: { address: PublicKey, setOpenDialog: any }) {
  const mutation = useTransferSol({ address });
  const [destinationAddress, setDestinationAddress] = useState('')
  const [amount, setAmount] = useState('')

  return (
    <DialogContent>
      <DialogTitle>Send</DialogTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutateAsync({
            destination: new PublicKey(destinationAddress),
            amount: parseFloat(amount),
          })
          setOpenDialog(null)
        }}
        className="flex flex-col gap-4"
      >
        <Input
          type="text"
          placeholder={`Destination`}
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />
        <Input
          type="number"
          step="any"
          min={0.1}
          max={2}
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          disabled={!amount || mutation.isPending || Number(amount) > 2 || Number(amount) < 0.1}
          type="submit"
        >
          {mutation.isPending ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </DialogContent>
  )
}

function ReceiveDialog({ address }: { address: PublicKey }) {
  function handleCopy() {
    navigator.clipboard.writeText(address.toBase58())

    toast.success("Copied to clipboard");
  }

  return (
    <DialogContent>
      <DialogTitle>Receive</DialogTitle>

      <p className="">
        Receive assets by sending them to {address.toBase58()}{" "}
        <CopyIcon
          className="w-4 h-4 inline-flex cursor-pointer"
          onClick={handleCopy}
        />
      </p>
    </DialogContent >
  )
}