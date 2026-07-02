import type { Metadata } from "next";
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Mail,
  Play,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  AnalyticsRow,
  AnalyticsTableHeader,
} from "@/features/cms/components/AnalyticsRow";
import { PlaylistCard } from "@/features/cms/components/PlaylistCard";
import { VideoLibrarySection } from "@/features/cms/components/VideoLibrarySection";
import {
  ANALYTICS_CATEGORIES,
  PLAYLISTS,
  VIDEOS,
} from "@/features/cms/constants/video.mock";

export const metadata: Metadata = {
  title: "Video Management",
};

export default function VideoManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Management"
        subtitle="Manage promotional and educational videos displayed in the customer application."
        actions={
          <>
            <Button variant="outline" size="lg" className="h-10 gap-2 px-4">
              <BarChart3 className="size-4" />
              Video Analytics
            </Button>
            <Button size="lg" className="h-10 gap-2 px-4">
              <Plus className="size-4" />
              Upload New Video
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Videos"
          value="48"
          icon={Play}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
        />
        <StatCard
          label="Published"
          value="32"
          icon={CheckCircle2}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
        />
        <StatCard
          label="Drafts"
          value="12"
          icon={Mail}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
        />
      </div>

      <VideoLibrarySection videos={VIDEOS} />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Performance Analytics
          </h2>
          <button
            type="button"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            View Full Report
            <ExternalLink className="size-3.5" />
          </button>
        </div>

        <div>
          <AnalyticsTableHeader />
          {ANALYTICS_CATEGORIES.map((category) => (
            <AnalyticsRow key={category.id} category={category} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Collections & Playlists
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            aria-label="Sort and filter playlists"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PLAYLISTS.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    </div>
  );
}
