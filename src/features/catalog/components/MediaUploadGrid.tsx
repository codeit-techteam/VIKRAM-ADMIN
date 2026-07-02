"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

import type { ProductImage } from "@/features/catalog/schema/product-form.schema";
import { cn } from "@/lib/utils";

const MAX_SLOTS = 4;

interface MediaUploadGridProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  placeholderUrls: readonly string[];
  className?: string;
}

export function MediaUploadGrid({
  images,
  onChange,
  placeholderUrls,
  className,
}: MediaUploadGridProps) {
  const emptySlotCount = MAX_SLOTS - images.length;

  const handleAddImage = () => {
    const usedUrls = new Set(images.map((image) => image.url));
    const nextUrl = placeholderUrls.find((url) => !usedUrls.has(url));

    if (!nextUrl) return;

    onChange([...images, { url: nextUrl, isMain: false }]);
  };

  const handleSetMain = (index: number) => {
    onChange(
      images.map((image, imageIndex) => ({
        ...image,
        isMain: imageIndex === index,
      })),
    );
  };

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", className)}>
      {images.map((image, index) => (
        <button
          key={`${image.url}-${index}`}
          type="button"
          onClick={() => handleSetMain(index)}
          className={cn(
            "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
            image.isMain
              ? "border-primary ring-primary ring-2"
              : "border-transparent hover:border-gray-200",
          )}
          aria-label={image.isMain ? "Main product image" : "Set as main image"}
        >
          <Image
            src={image.url}
            alt={`Product image ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
          />
          {image.isMain && (
            <span className="bg-primary absolute top-2 left-2 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
              Main Image
            </span>
          )}
        </button>
      ))}

      {Array.from({ length: emptySlotCount }).map((_, index) => (
        <button
          key={`empty-${index}`}
          type="button"
          onClick={handleAddImage}
          disabled={emptySlotCount === 0}
          className="hover:border-primary/40 flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 transition-colors hover:bg-orange-50/30"
          aria-label="Add gallery image"
        >
          <Camera className="size-5 text-gray-400" />
          <span className="text-xs font-medium text-gray-400">Add Gallery</span>
        </button>
      ))}
    </div>
  );
}
