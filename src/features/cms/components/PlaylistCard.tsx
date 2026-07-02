import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Playlist } from "@/features/cms/types/video.types";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const Icon = playlist.icon;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-white p-4 shadow-sm">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg",
          playlist.iconBg,
        )}
      >
        <Icon className={cn("size-5", playlist.iconColor)} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#1A1A1A]">
          {playlist.title}
        </p>
        <p className="mt-0.5 text-sm text-[#64748B]">
          {playlist.videoCount} Videos • Last update {playlist.lastUpdateLabel}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-gray-400 hover:text-gray-600"
        aria-label={`Manage ${playlist.title}`}
      >
        <GripVertical className="size-4" />
      </Button>
    </div>
  );
}
