"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <AlertCircle className="w-16 h-16 text-destructive" />
      <h1 className="mt-4 text-2xl font-semibold">Page Not Found</h1>
      <p className="mt-2 text-muted-foreground">The page you are looking for doesn’t exist or has been moved.</p>
      <Button onClick={() => router.push("/")} className="mt-6">
        Go Home
      </Button>
    </div>
  );
}
