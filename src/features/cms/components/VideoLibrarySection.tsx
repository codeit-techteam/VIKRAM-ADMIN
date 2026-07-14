"use client";

import { useState } from "react";

import { ViewToggle } from "@/components/shared/ViewToggle";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/features/cms/components/VideoCard";
import { VideoDetailDrawer } from "@/features/cms/components/VideoDetailDrawer";
import type { Video, ViewMode } from "@/features/cms/types/video.types";
import { cn } from "@/lib/utils";

type VideoStatFilter = "all" | "published" | "active-ctas";

const FILTER_LABELS: Record<Exclude<VideoStatFilter, "all">, string> = {
  published: "published videos",
  "active-ctas": "videos with active CTAs",
};

interface VideoLibrarySectionProps {
  videos: Video[];
  activeFilter?: VideoStatFilter;
  onClearFilter?: () => void;
}

export function VideoLibrarySection({
  videos,
  activeFilter = "all",
  onClearFilter,
}: VideoLibrarySectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setIsDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedVideo(null);
    }
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Video Library
        </h2>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {activeFilter !== "all" ? (
        <p className="mb-4 text-sm text-[#64748B]">
          Showing {FILTER_LABELS[activeFilter]}
          {onClearFilter ? (
            <>
              {" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={onClearFilter}
              >
                Clear filter
              </Button>
            </>
          ) : null}
        </p>
      ) : null}

      {videos.length > 0 ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4",
          )}
        >
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              layout={viewMode}
              onClick={handleVideoSelect}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#1A1A1A]">
            No videos match this filter
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Try selecting a different summary card above.
          </p>
          {onClearFilter ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onClearFilter}
            >
              Show all videos
            </Button>
          ) : null}
        </div>
      )}

      <VideoDetailDrawer
        open={isDetailOpen}
        onOpenChange={handleDetailOpenChange}
        video={selectedVideo}
      />
    </section>
  );
}
