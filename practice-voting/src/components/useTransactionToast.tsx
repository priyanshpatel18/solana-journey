import Link from "next/link"
import { toast } from "sonner"
import { SquareArrowOutUpRightIcon } from "lucide-react";

export function useTransactionToast(message?: string) {
  return (signature: string) => {
    toast.success(
      <div className="flex items-center gap-1">
        <span>{message ? message : "Transaction successful!"}</span>
        <Link
          target="_blank"
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          className="flex items-center gap-1"
        >
          View on Explorer
          <SquareArrowOutUpRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }
}
