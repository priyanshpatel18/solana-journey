"use client";

import { AccountBalance, AccountButtons, AccountTransactions } from "@/components/account/account-ui";
import { WalletButton } from "@/components/WalletButton";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Page() {
  const params = useParams()

  const address = useMemo(() => {
    if (!params.address) {
      return
    }
    try {
      return new PublicKey(params.address)
    } catch (e) {
      console.log(`Invalid public key`, e)
    }
  }, [params])
  if (!address) {
    return <div>Error loading account</div>
  }

  return (
    <div className="h-screen max-w-3xl m-auto py-10 flex flex-col items-center gap-4">
      <WalletButton />
      <AccountBalance address={address} />
      <AccountButtons address={address} />
      <AccountTransactions address={address} />
    </div>
  )
};