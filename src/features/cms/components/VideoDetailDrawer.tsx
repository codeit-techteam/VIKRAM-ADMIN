"use client";

import {
  Calendar,
  Clock,
  Eye,
  ExternalLink,
  Heart,
  MousePointerClick,
  Pencil,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Video } from "@/features/cms/types/video.types";
import { cn } from "@/lib/utils";

interface VideoDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
}

const DESTINATION_LABELS: Record<Video["cta"]["destinationType"], string> = {
  category: "Category",
  product: "Product",
  offer: "Offer",
  external: "External Link",
};

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return value.toLocaleString();
}

function getCtaAppStatus(video: Video): "ACTIVE" | "INACTIVE" {
  return video.cta.enabled && video.status === "PUBLISHED"
    ? "ACTIVE"
    : "INACTIVE";
}

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-[#1A1A1A]">{value}</div>
    </div>
  );
}

export function VideoDetailDrawer({
  open,
  onOpenChange,
  video,
}: VideoDetailDrawerProps) {
  if (!video) {
    return null;
  }

  const ctaAppStatus = getCtaAppStatus(video);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover"
                sizes="128px"
              />
              <span className="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {video.duration}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl font-bold text-[#1A1A1A]">
                {video.title}
              </SheetTitle>
              <SheetDescription className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={video.status} />
                <span className="inline-flex items-center gap-1 text-sm text-[#64748B]">
                  <Clock className="size-3.5" />
                  {video.duration}
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <DetailSection title="Performance">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              {video.views !== undefined ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
                    <Eye className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Views</p>
                    <p className="text-lg font-semibold text-[#1A1A1A]">
                      {formatCount(video.views)}
                    </p>
                  </div>
                </div>
              ) : null}
              {video.likes !== undefined ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50">
                    <Heart className="size-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Likes</p>
                    <p className="text-lg font-semibold text-[#1A1A1A]">
                      {formatCount(video.likes)}
                    </p>
                  </div>
                </div>
              ) : null}
              {video.scheduledDate ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50">
                    <Calendar className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Scheduled For</p>
                    <p className="text-lg font-semibold text-[#1A1A1A]">
                      {video.scheduledDate}
                    </p>
                  </div>
                </div>
              ) : null}
              {video.lastEditedLabel ? (
                <div className="col-span-2">
                  <p className="text-sm text-[#64748B]">
                    {video.lastEditedLabel}
                  </p>
                </div>
              ) : null}
            </div>
          </DetailSection>

          <DetailSection title="App Placement">
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-[#64748B]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="CTA Configuration">
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <DetailField
                  label="CTA Status"
                  value={video.cta.enabled ? "Enabled" : "Disabled"}
                />
                <StatusBadge status={ctaAppStatus} />
              </div>

              {video.cta.enabled ? (
                <>
                  <DetailField
                    label="Button Label"
                    value={
                      <span className="text-primary inline-flex items-center gap-1.5">
                        <MousePointerClick className="size-3.5" />
                        {video.cta.label}
                      </span>
                    }
                  />
                  <DetailField
                    label="Destination Path"
                    value={
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs font-normal text-[#64748B]">
                        {video.cta.path}
                      </code>
                    }
                  />
                  <DetailField
                    label="Destination Type"
                    value={DESTINATION_LABELS[video.cta.destinationType]}
                  />
                </>
              ) : (
                <p className="text-sm text-[#64748B]">
                  No call-to-action button is configured for this video.
                </p>
              )}
            </div>
          </DetailSection>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <Button variant="outline" className="flex-1 gap-2">
            <Play className="size-4" />
            Preview Video
          </Button>
          <Link
            href={`/customer-app-cms/videos/upload?edit=${video.id}`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex-1 gap-2",
            )}
          >
            <Pencil className="size-4" />
            Edit Video
          </Link>
          {video.cta.enabled ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open CTA destination"
            >
              <ExternalLink className="size-4" />
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
