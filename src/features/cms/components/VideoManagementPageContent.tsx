"use client";

import { CheckCircle2, MousePointerClick, Play, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { VideoCtaTable } from "@/features/cms/components/VideoCtaTable";
import { VideoLibrarySection } from "@/features/cms/components/VideoLibrarySection";
import { VIDEOS, VIDEO_STAT_CARDS } from "@/features/cms/constants/video.mock";
import type { Video } from "@/features/cms/types/video.types";

type VideoStatFilter = "all" | "published" | "active-ctas";

function filterVideos(videos: Video[], filter: VideoStatFilter): Video[] {
  switch (filter) {
    case "published":
      return videos.filter((video) => video.status === "PUBLISHED");
    case "active-ctas":
      return videos.filter((video) => video.cta.enabled);
    default:
      return videos;
  }
}

export function VideoManagementPageContent() {
  const [activeFilter, setActiveFilter] = useState<VideoStatFilter>("all");

  const activeCtaCount = useMemo(
    () => VIDEOS.filter((video) => video.cta.enabled).length,
    [],
  );

  const filteredVideos = useMemo(
    () => filterVideos(VIDEOS, activeFilter),
    [activeFilter],
  );

  const handleStatCardClick = (filter: VideoStatFilter) => {
    setActiveFilter((current) => (current === filter ? "all" : filter));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Management"
        subtitle="Upload videos and configure CTA buttons that appear on the customer application."
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/videos")}
        actions={
          <Button
            size="lg"
            className="h-10 gap-2 px-4"
            render={<Link href="/customer-app-cms/videos/upload" />}
          >
            <Plus className="size-4" />
            Upload New Video
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Videos"
          value={VIDEO_STAT_CARDS[0].value}
          icon={Play}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isActive={activeFilter === "all"}
          onClick={() => handleStatCardClick("all")}
        />
        <StatCard
          label="Published"
          value={VIDEO_STAT_CARDS[1].value}
          icon={CheckCircle2}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
          isActive={activeFilter === "published"}
          onClick={() => handleStatCardClick("published")}
        />
        <StatCard
          label="Active CTAs"
          value={String(activeCtaCount)}
          icon={MousePointerClick}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isActive={activeFilter === "active-ctas"}
          onClick={() => handleStatCardClick("active-ctas")}
        />
      </div>

      <VideoLibrarySection
        videos={filteredVideos}
        activeFilter={activeFilter}
        onClearFilter={() => setActiveFilter("all")}
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">
              Customer App CTA Buttons
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Manage call-to-action buttons shown on videos in the customer app.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 gap-2">
            <MousePointerClick className="size-4" />
            CTA Guidelines
          </Button>
        </div>

        <VideoCtaTable videos={filteredVideos} />
      </div>
    </div>
  );
}
