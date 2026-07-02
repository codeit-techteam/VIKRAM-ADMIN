import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassInfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export function GlassInfoCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: GlassInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-black/45 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:p-7",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="bg-primary flex size-11 shrink-0 items-center justify-center rounded-xl shadow-[0_4px_12px_rgba(255,107,0,0.35)]">
          <Icon className="size-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-white/70">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
