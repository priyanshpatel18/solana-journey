"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { montserrat } from "@/lib/fonts";

export default function page() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 max-w-3xl m-auto py-5">
      <h1 className={`text-3xl text-center ${montserrat.className} font-semibold`}>Welcome</h1>
      <Button
        onClick={() => router.push("/account")}
        className="self-center"
      >
        Manage your account
      </Button>
    </div>
  )
}