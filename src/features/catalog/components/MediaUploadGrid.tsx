"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Film,
  Loader2,
  Replace,
  Star,
  Trash2,
  Video,
} from "lucide-react";

import { SafeRemoteImage } from "@/components/shared/SafeRemoteImage";
import type {
  ProductImage,
  ProductVideo,
} from "@/features/catalog/schema/product-form.schema";
import { cn } from "@/lib/utils";
import { uploadMediaFile } from "@/services/media.service";
import { notify } from "@/utils/notify";

export const MAX_PRODUCT_IMAGES = 6;
export const MAX_PRODUCT_VIDEOS = 1;

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/webm";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

interface MediaUploadGridProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  video: ProductVideo | null;
  onVideoChange: (video: ProductVideo | null) => void;
  /** @deprecated Placeholder URLs are no longer used — uploads go to R2. */
  placeholderUrls?: readonly string[];
  className?: string;
}

function assertImageFile(file: File) {
  const okMime =
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    file.type === "image/png" ||
    file.type === "image/webp";
  if (!okMime) {
    throw new Error("Use JPG, PNG, or WEBP images only.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 15 MB or smaller.");
  }
}

function assertVideoFile(file: File) {
  const okMime = file.type === "video/mp4" || file.type === "video/webm";
  if (!okMime) {
    throw new Error("Use MP4 or WEBM video only.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video must be 200 MB or smaller.");
  }
}

export function MediaUploadGrid({
  images,
  onChange,
  video,
  onVideoChange,
  className,
}: MediaUploadGridProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const canAddImage = images.length < MAX_PRODUCT_IMAGES;
  const canAddVideo = !video;

  const handlePickImage = () => {
    if (uploading || !canAddImage) return;
    imageInputRef.current?.click();
  };

  const handlePickReplace = (index: number) => {
    if (uploading) return;
    setReplaceIndex(index);
    replaceInputRef.current?.click();
  };

  const handlePickVideo = (replace = false) => {
    if (uploadingVideo) return;
    if (!replace && !canAddVideo) return;
    videoInputRef.current?.click();
  };

  const handleAddImage = async (file: File | null) => {
    if (!file) return;
    if (!canAddImage) {
      notify.error("Limit reached", `Maximum ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      assertImageFile(file);
      const uploaded = await uploadMediaFile(file, "products/gallery", {
        onProgress: setProgress,
      });
      onChange([
        ...images,
        {
          url: uploaded.publicUrl,
          isMain: images.length === 0,
          storageKey: uploaded.storageKey,
          mimeType: uploaded.mimeType,
          fileSize: uploaded.size,
        },
      ]);
      notify.success("Image uploaded", "Stored on Cloudflare R2.");
    } catch (error) {
      notify.error(
        "Upload failed",
        error instanceof Error ? error.message : "Could not upload image",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleReplaceImage = async (file: File | null) => {
    if (!file || replaceIndex == null) return;
    const index = replaceIndex;
    setUploading(true);
    setProgress(0);
    try {
      assertImageFile(file);
      const previous = images[index];
      const uploaded = await uploadMediaFile(file, "products/gallery", {
        onProgress: setProgress,
        replaceKey: previous?.storageKey || previous?.url,
      });
      onChange(
        images.map((image, imageIndex) =>
          imageIndex === index
            ? {
                ...image,
                url: uploaded.publicUrl,
                storageKey: uploaded.storageKey,
                mimeType: uploaded.mimeType,
                fileSize: uploaded.size,
              }
            : image,
        ),
      );
      notify.success("Image replaced", "Stored on Cloudflare R2.");
    } catch (error) {
      notify.error(
        "Replace failed",
        error instanceof Error ? error.message : "Could not replace image",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      setReplaceIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleUploadVideo = async (file: File | null) => {
    if (!file) return;
    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      assertVideoFile(file);
      // Use deployed R2 folder allowlist (`products/video` is not on DO yet).
      const uploaded = await uploadMediaFile(file, "videos/home", {
        onProgress: setVideoProgress,
        replaceKey: video?.storageKey || video?.url,
      });
      onVideoChange({
        url: uploaded.publicUrl,
        storageKey: uploaded.storageKey,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.size,
      });
      notify.success(
        video ? "Video replaced" : "Video uploaded",
        "Stored on Cloudflare R2.",
      );
    } catch (error) {
      notify.error(
        "Video upload failed",
        error instanceof Error ? error.message : "Could not upload video",
      );
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleSetMain = (index: number) => {
    onChange(
      images.map((image, imageIndex) => ({
        ...image,
        isMain: imageIndex === index,
      })),
    );
  };

  const handleRemove = (index: number) => {
    const next = images.filter((_, imageIndex) => imageIndex !== index);
    if (next.length > 0 && !next.some((image) => image.isMain)) {
      next[0] = { ...next[0], isMain: true };
    }
    onChange(next);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => void handleAddImage(event.target.files?.[0] ?? null)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) =>
          void handleReplaceImage(event.target.files?.[0] ?? null)
        }
      />
      <input
        ref={videoInputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="hidden"
        onChange={(event) =>
          void handleUploadVideo(event.target.files?.[0] ?? null)
        }
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Product Images</p>
            <p className="text-muted-foreground text-xs">
              Images: {images.length}/{MAX_PRODUCT_IMAGES} · Upload to Cloudflare
              R2
            </p>
          </div>
          <button
            type="button"
            onClick={handlePickImage}
            disabled={uploading || !canAddImage}
            className="border-primary text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Uploading {progress}%
              </>
            ) : (
              <>
                <Camera className="size-3.5" />
                Add Image
              </>
            )}
          </button>
        </div>

        {!canAddImage && (
          <p className="text-xs font-medium text-amber-700">
            Maximum {MAX_PRODUCT_IMAGES} images reached.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className={cn(
                "group relative overflow-hidden rounded-lg border-2 bg-white transition-all",
                image.isMain
                  ? "border-primary ring-primary ring-2"
                  : "border-gray-200",
              )}
            >
              <div className="relative aspect-square">
                <SafeRemoteImage
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
                <span className="absolute top-2 left-2 z-10 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Image {index + 1}
                </span>
                {image.isMain && (
                  <span className="bg-primary absolute top-2 right-2 z-10 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                    Primary
                  </span>
                )}
              </div>
              <div className="space-y-2 border-t border-gray-100 p-2">
                <div className="flex flex-wrap gap-1">
                  {!image.isMain && (
                    <button
                      type="button"
                      onClick={() => handleSetMain(index)}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      <Star className="size-3" />
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePickReplace(index)}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Replace className="size-3" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-1 text-[10px] font-medium disabled:opacity-40"
                    aria-label="Move image left"
                  >
                    <ArrowLeft className="size-3" />
                    Move
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === images.length - 1}
                    className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-1 text-[10px] font-medium disabled:opacity-40"
                    aria-label="Move image right"
                  >
                    Move
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {canAddImage && (
            <button
              type="button"
              onClick={handlePickImage}
              disabled={uploading}
              className="hover:border-primary/40 flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 transition-colors hover:bg-orange-50/30 disabled:opacity-60"
              aria-label="Upload gallery image to R2"
            >
              {uploading ? (
                <>
                  <Loader2 className="text-primary size-5 animate-spin" />
                  <span className="text-xs font-medium text-gray-500">
                    {progress}%
                  </span>
                </>
              ) : (
                <>
                  <Camera className="size-5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400">
                    + Add Image
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Product Video</p>
            <p className="text-muted-foreground text-xs">
              Video: {video ? 1 : 0}/{MAX_PRODUCT_VIDEOS} · Optional · MP4/WEBM
            </p>
          </div>
          {canAddVideo && (
            <button
              type="button"
              onClick={() => handlePickVideo(false)}
              disabled={uploadingVideo}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {uploadingVideo ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Uploading {videoProgress}%
                </>
              ) : (
                <>
                  <Film className="size-3.5" />
                  Upload Product Video
                </>
              )}
            </button>
          )}
        </div>

        {video ? (
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center">
            <div className="bg-muted flex h-28 w-full items-center justify-center rounded-md sm:w-48">
              <Video className="size-8 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="truncate text-xs font-medium text-gray-800">
                {video.url}
              </p>
              <p className="text-muted-foreground text-[11px]">
                Uploaded ✓ · Stored on Cloudflare R2
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePickVideo(true)}
                  disabled={uploadingVideo}
                  className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-[11px] font-semibold"
                >
                  <Replace className="size-3" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onVideoChange(null)}
                  className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-600"
                >
                  <Trash2 className="size-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handlePickVideo(false)}
            disabled={uploadingVideo}
            className="hover:border-primary/40 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 transition-colors hover:bg-orange-50/30 disabled:opacity-60"
          >
            {uploadingVideo ? (
              <>
                <Loader2 className="text-primary size-5 animate-spin" />
                <span className="text-xs font-medium text-gray-500">
                  Uploading video {videoProgress}%
                </span>
              </>
            ) : (
              <>
                <Film className="size-5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  + Upload Product Video
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
