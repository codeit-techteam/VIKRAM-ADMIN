"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CMS_VIDEOS_QUERY_KEY,
  toUiVideo,
  videosService,
} from "@/services/videos.service";
import type { Video } from "@/features/cms/types/video.types";
import { notify } from "@/utils/notify";

export { CMS_VIDEOS_QUERY_KEY };

async function fetchCmsVideos(placement?: string): Promise<Video[]> {
  const rows = await videosService.list(
    placement && placement !== "ALL" ? placement : undefined,
  );
  return rows.map(toUiVideo);
}

export function useCmsVideos(placement: string = "ALL") {
  return useQuery({
    queryKey: [CMS_VIDEOS_QUERY_KEY, placement],
    queryFn: () => fetchCmsVideos(placement),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useInvalidateCmsVideos() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: [CMS_VIDEOS_QUERY_KEY] });
}

export function useDeleteVideo() {
  const invalidate = useInvalidateCmsVideos();
  return useMutation({
    mutationFn: (id: string) => videosService.remove(id),
    onSuccess: async () => {
      await invalidate();
      notify.success("Video deleted");
    },
    onError: (error) => {
      notify.error(
        error instanceof Error ? error.message : "Failed to delete video",
      );
    },
  });
}

export function usePublishVideo() {
  const invalidate = useInvalidateCmsVideos();
  return useMutation({
    mutationFn: (id: string) => videosService.publish(id),
    onSuccess: async () => {
      await invalidate();
      notify.success("Video published to Customer App");
    },
    onError: (error) => {
      notify.error(
        error instanceof Error ? error.message : "Failed to publish video",
      );
    },
  });
}

export function useUnpublishVideo() {
  const invalidate = useInvalidateCmsVideos();
  return useMutation({
    mutationFn: (id: string) => videosService.unpublish(id),
    onSuccess: async () => {
      await invalidate();
      notify.success("Video unpublished — removed from Customer App");
    },
    onError: (error) => {
      notify.error(
        error instanceof Error ? error.message : "Failed to unpublish video",
      );
    },
  });
}
