"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";

import { SafeRemoteImage } from "@/components/shared/SafeRemoteImage";
import type { ProductImage } from "@/features/catalog/schema/product-form.schema";
import { cn } from "@/lib/utils";
import { uploadMediaFile } from "@/services/media.service";
import { notify } from "@/utils/notify";

const MAX_SLOTS = 4;

interface MediaUploadGridProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  /** @deprecated Placeholder URLs are no longer used — uploads go to R2. */
  placeholderUrls?: readonly string[];
  className?: string;
}

export function MediaUploadGrid({
  images,
  onChange,
  className,
}: MediaUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const emptySlotCount = MAX_SLOTS - images.length;

  const handlePick = () => {
    if (uploading || emptySlotCount <= 0) return;
    inputRef.current?.click();
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await uploadMediaFile(file, "products/gallery", {
        onProgress: setProgress,
      });
      const next: ProductImage[] = [
        ...images,
        {
          url: uploaded.publicUrl,
          isMain: images.length === 0,
        },
      ];
      onChange(next);
      notify.success("Image uploaded", "Stored on Cloudflare R2.");
    } catch (error) {
      notify.error(
        "Upload failed",
        error instanceof Error ? error.message : "Could not upload image",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
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

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
              image.isMain
                ? "border-primary ring-primary ring-2"
                : "border-transparent hover:border-gray-200",
            )}
          >
            <button
              type="button"
              onClick={() => handleSetMain(index)}
              className="absolute inset-0 z-0"
              aria-label={
                image.isMain ? "Main product image" : "Set as main image"
              }
            />
            <SafeRemoteImage
              src={image.url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 200px"
            />
            {image.isMain && (
              <span className="bg-primary absolute top-2 left-2 z-10 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                Main Image
              </span>
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {Array.from({ length: emptySlotCount }).map((_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            onClick={handlePick}
            disabled={uploading || emptySlotCount === 0}
            className="hover:border-primary/40 flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 transition-colors hover:bg-orange-50/30 disabled:opacity-60"
            aria-label="Upload gallery image to R2"
          >
            {uploading && index === 0 ? (
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
                  Upload to R2
                </span>
              </>
            )}
          </button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        Images upload directly to Cloudflare R2. Only the public URL is saved
        with the product.
      </p>
    </div>
  );
}
