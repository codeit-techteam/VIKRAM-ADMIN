"use client";

import { Clapperboard } from "lucide-react";

import { cn } from "@/lib/utils";

interface VideoMediaPreviewProps {
  src?: string | null;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

export function VideoMediaPreview({
  src,
  title,
  className,
  autoPlay = false,
}: VideoMediaPreviewProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center bg-slate-900 text-white/70",
          className,
        )}
      >
        <Clapperboard className="size-8" />
      </div>
    );
  }

  return (
    <video
      src={src}
      title={title}
      muted
      playsInline
      loop={autoPlay}
      autoPlay={autoPlay}
      preload="metadata"
      controls={false}
      className={cn("size-full object-cover", className)}
    />
  );
}
