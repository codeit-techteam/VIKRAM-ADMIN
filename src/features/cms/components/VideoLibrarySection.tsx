"use client";

import { useState } from "react";

import { ViewToggle } from "@/components/shared/ViewToggle";
import { VideoCard } from "@/features/cms/components/VideoCard";
import type { Video, ViewMode } from "@/features/cms/types/video.types";
import { cn } from "@/lib/utils";

interface VideoLibrarySectionProps {
  videos: Video[];
}

export function VideoLibrarySection({ videos }: VideoLibrarySectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Video Library
        </h2>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-4",
        )}
      >
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} layout={viewMode} />
        ))}
      </div>
    </section>
  );
}
