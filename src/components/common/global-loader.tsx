import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface GlobalLoaderProps {
  className?: string;
  message?: string;
}

export function GlobalLoader({
  className,
  message = "Loading...",
}: GlobalLoaderProps) {
  return (
    <div
      className={cn(
        "bg-background/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 backdrop-blur-sm",
        className,
      )}
    >
      <Loader2 className="text-primary size-8 animate-spin" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
