"use client";

import { WalletButton } from "@/components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { redirect } from "next/navigation";

export default function AccountPage() {
  const { publicKey } = useWallet();

  if (publicKey) {
    redirect(`/account/${publicKey.toBase58()}`);
  }

  return (
    <div className="max-w-3xl m-auto py-5 flex flex-col gap-4">
      <h1 className={`text-3xl text-center font-semibold`}>Connect your wallet</h1>
      <div className="flex justify-center">
        <WalletButton />
      </div>
    </div>
  )
}
