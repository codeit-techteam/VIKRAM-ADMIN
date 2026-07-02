"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-destructive text-8xl font-bold">500</h1>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>
          <RefreshCw />
          Try again
        </Button>
        <Button variant="outline" render={<Link href={ROUTES.DASHBOARD} />}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
