import Image from "next/image";
import type { ReactNode } from "react";

import { AUTH_ASSETS } from "@/constants/auth.constants";
import { cn } from "@/lib/utils";

interface AuthHeroPanelProps {
  statusBadge: ReactNode;
  glassCard: ReactNode;
  className?: string;
}

export function AuthHeroPanel({
  statusBadge,
  glassCard,
  className,
}: AuthHeroPanelProps) {
  return (
    <section
      className={cn(
        "relative min-h-svh overflow-hidden bg-neutral-900",
        className,
      )}
      aria-label="Bajriwala platform overview"
    >
      <Image
        src={AUTH_ASSETS.heroImage}
        alt={AUTH_ASSETS.heroAlt}
        fill
        priority
        className="object-cover object-center"
        sizes="60vw"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="absolute top-8 right-8 z-10">{statusBadge}</div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-8 lg:p-10">
        {glassCard}
      </div>
    </section>
  );
}
