"use client";

import { CheckCircle2, MousePointerClick, Play, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { VideoCtaTable } from "@/features/cms/components/VideoCtaTable";
import { VideoLibrarySection } from "@/features/cms/components/VideoLibrarySection";
import type { Video } from "@/features/cms/types/video.types";
import { useCmsVideos, useDeleteVideo } from "@/hooks/useCmsVideos";
import { notify } from "@/utils/notify";

type VideoStatFilter = "all" | "published" | "active-ctas" | "live-on-app";

const PLACEMENT_FILTERS = [
  { value: "ALL", label: "All placements" },
  { value: "HOME_HERO_VIDEO", label: "HOME_HERO_VIDEO" },
  { value: "HOME", label: "HOME" },
  { value: "PRODUCT", label: "PRODUCT" },
  { value: "CATEGORY", label: "CATEGORY" },
  { value: "TUTORIALS", label: "TUTORIALS" },
] as const;

function filterVideos(videos: Video[], filter: VideoStatFilter): Video[] {
  switch (filter) {
    case "published":
      return videos.filter((video) => video.status === "PUBLISHED");
    case "active-ctas":
      return videos.filter((video) => video.cta.enabled);
    case "live-on-app":
      return videos.filter((video) => video.liveOnApp);
    default:
      return videos;
  }
}

export function VideoManagementPageContent() {
  const [activeFilter, setActiveFilter] = useState<VideoStatFilter>("all");
  const [placement, setPlacement] = useState<string>("ALL");

  const videosQuery = useCmsVideos(placement);
  const deleteMutation = useDeleteVideo();

  const videos = videosQuery.data ?? [];
  const loading = videosQuery.isLoading;

  useEffect(() => {
    if (!videosQuery.isError) return;
    notify.error(
      videosQuery.error instanceof Error
        ? videosQuery.error.message
        : "Failed to load videos",
    );
  }, [videosQuery.isError, videosQuery.error]);

  const activeCtaCount = useMemo(
    () => videos.filter((video) => video.cta.enabled).length,
    [videos],
  );

  const publishedCount = useMemo(
    () => videos.filter((v) => v.status === "PUBLISHED").length,
    [videos],
  );

  const liveOnAppCount = useMemo(
    () => videos.filter((v) => v.liveOnApp).length,
    [videos],
  );

  const filteredVideos = useMemo(
    () => filterVideos(videos, activeFilter),
    [activeFilter, videos],
  );

  const handleStatCardClick = (filter: VideoStatFilter) => {
    setActiveFilter((current) => (current === filter ? "all" : filter));
  };

  const handleDelete = (video: Video) => {
    const confirmed = window.confirm(
      `Delete “${video.title}”? It will be removed from the Customer App if it was live.`,
    );
    if (!confirmed) return;
    deleteMutation.mutate(video.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Management"
        subtitle="Upload videos and configure CTA buttons that appear on the customer application. Library always reflects the database (same source as the Customer App)."
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Source: <code className="text-xs">GET /admin/videos</code> → same{" "}
          <code className="text-xs">videos</code> table as{" "}
          <code className="text-xs">GET /cms/home</code>
        </p>
        <Select
          value={placement}
          onValueChange={(value) => {
            if (value) setPlacement(value);
          }}
        >
          <SelectTrigger className="w-55">
            <SelectValue placeholder="Filter placement" />
          </SelectTrigger>
          <SelectContent>
            {PLACEMENT_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Videos"
          value={String(videos.length)}
          icon={Play}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isActive={activeFilter === "all"}
          onClick={() => handleStatCardClick("all")}
        />
        <StatCard
          label="Published"
          value={String(publishedCount)}
          icon={CheckCircle2}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
          isActive={activeFilter === "published"}
          onClick={() => handleStatCardClick("published")}
        />
        <StatCard
          label="Live on App"
          value={String(liveOnAppCount)}
          icon={CheckCircle2}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isActive={activeFilter === "live-on-app"}
          onClick={() => handleStatCardClick("live-on-app")}
        />
        <StatCard
          label="Active CTAs"
          value={String(activeCtaCount)}
          icon={MousePointerClick}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
          isActive={activeFilter === "active-ctas"}
          onClick={() => handleStatCardClick("active-ctas")}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading videos…</p>
      ) : (
        <>
          <VideoLibrarySection
            videos={filteredVideos}
            activeFilter={activeFilter === "live-on-app" ? "all" : activeFilter}
            onClearFilter={() => setActiveFilter("all")}
            onDelete={handleDelete}
          />
          <VideoCtaTable videos={filteredVideos} />
        </>
      )}
    </div>
  );
}
