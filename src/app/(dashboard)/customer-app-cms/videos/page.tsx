import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Mail,
  MousePointerClick,
  Play,
  Plus,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { VideoCtaTable } from "@/features/cms/components/VideoCtaTable";
import { VideoLibrarySection } from "@/features/cms/components/VideoLibrarySection";
import { VIDEOS } from "@/features/cms/constants/video.mock";

export const metadata: Metadata = {
  title: "Video Management",
};

const videosWithCta = VIDEOS.filter((video) => video.cta.enabled);

export default function VideoManagementPage() {
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
          label="Active CTAs"
          value={String(videosWithCta.length)}
          icon={MousePointerClick}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
        />
      </div>

      <VideoLibrarySection videos={VIDEOS} />

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

        <VideoCtaTable videos={VIDEOS} />
      </div>
    </div>
  );
}
