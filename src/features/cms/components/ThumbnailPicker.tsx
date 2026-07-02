"use client";

import Image from "next/image";
import { Check, RefreshCw } from "lucide-react";

import type { ThumbnailFrame } from "@/features/cms/constants/video-upload.mock";
import { cn } from "@/lib/utils";

interface ThumbnailPickerProps {
  frames: ThumbnailFrame[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRegenerate?: () => void;
  className?: string;
}

export function ThumbnailPicker({
  frames,
  selectedId,
  onSelect,
  onRegenerate,
  className,
}: ThumbnailPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {frames.map((frame) => {
        const isSelected = frame.id === selectedId;

        return (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelect(frame.id)}
            className={cn(
              "relative aspect-video w-[calc(25%-9px)] min-w-[140px] flex-1 overflow-hidden rounded-lg border-2 border-transparent transition-all",
              isSelected && "ring-primary ring-2",
            )}
            aria-pressed={isSelected}
            aria-label={`Select thumbnail at ${frame.duration}`}
          >
            <Image
              src={frame.imageUrl}
              alt={`Video frame at ${frame.duration}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {frame.duration}
            </span>
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="bg-primary flex size-7 items-center justify-center rounded-full text-white shadow-sm">
                  <Check className="size-4" strokeWidth={3} />
                </span>
              </span>
            )}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onRegenerate}
        className="flex aspect-video w-[calc(25%-9px)] min-w-[140px] flex-1 items-center justify-center rounded-lg border border-gray-100 bg-[#EEF4FF] transition-colors hover:bg-blue-100/60"
        aria-label="Regenerate thumbnails"
      >
        <RefreshCw className="size-5 text-blue-500" />
      </button>
    </div>
  );
}
