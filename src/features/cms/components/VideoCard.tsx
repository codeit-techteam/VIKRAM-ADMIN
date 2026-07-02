"use client";

import { Calendar, Copy, Eye, Heart, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Video, VideoStatus } from "@/features/cms/types/video.types";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  layout?: "grid" | "list";
}

const VIDEO_STATUS_OVERLAY: Record<VideoStatus, string> = {
  PUBLISHED: "bg-emerald-600 text-white",
  SCHEDULED: "bg-blue-600 text-white",
  DRAFT: "bg-gray-500 text-white",
};

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return value.toLocaleString();
}

export function VideoCard({ video, layout = "grid" }: VideoCardProps) {
  const isList = layout === "list";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm",
        isList && "flex gap-4 p-4",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-gray-100",
          isList ? "h-24 w-40 shrink-0 rounded-lg" : "aspect-video w-full",
        )}
      >
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
          sizes={isList ? "160px" : "(max-width: 768px) 100vw, 33vw"}
        />
        <StatusBadge
          status={video.status}
          className={cn(
            "absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            VIDEO_STATUS_OVERLAY[video.status],
          )}
        />
        <span className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
          {video.duration}
        </span>
      </div>

      <div className={cn("p-4", isList && "flex min-w-0 flex-1 flex-col p-0")}>
        <h3 className="font-semibold text-[#1A1A1A]">{video.title}</h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-[#64748B]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <VideoMeta video={video} />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-gray-400 hover:text-gray-600"
              aria-label="Edit video"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-gray-400 hover:text-gray-600"
              aria-label="Duplicate video"
            >
              <Copy className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-gray-400 hover:text-red-500"
              aria-label="Delete video"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function VideoMeta({ video }: { video: Video }) {
  if (video.lastEditedLabel) {
    return <p className="text-sm text-[#64748B]">{video.lastEditedLabel}</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748B]">
      {video.views !== undefined && (
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3.5" />
          {formatCount(video.views)}
        </span>
      )}
      {video.likes !== undefined && (
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3.5" />
          {formatCount(video.likes)}
        </span>
      )}
      {video.scheduledDate && (
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5" />
          {video.scheduledDate}
        </span>
      )}
    </div>
  );
}
