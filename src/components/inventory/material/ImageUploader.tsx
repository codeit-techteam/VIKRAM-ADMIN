"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, ImagePlus, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MaterialImage } from "@/types/material.types";

interface ImageUploaderProps {
  label: string;
  helperText?: string;
  images: MaterialImage[];
  onChange: (images: MaterialImage[]) => void;
  multiple?: boolean;
  maxImages?: number;
  className?: string;
}

function createImageFromFile(file: File): MaterialImage {
  return {
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    name: file.name,
    isMain: false,
  };
}

export function ImageUploader({
  label,
  helperText = "PNG, JPG or WEBP up to 5MB",
  images,
  onChange,
  multiple = false,
  maxImages = multiple ? 6 : 1,
  className,
}: ImageUploaderProps) {
  const canAddMore = images.length < maxImages;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      const newImages = acceptedFiles
        .slice(0, maxImages - images.length)
        .map(createImageFromFile);

      if (multiple) {
        onChange([...images, ...newImages]);
        return;
      }

      onChange(
        newImages.slice(0, 1).map((image) => ({ ...image, isMain: true })),
      );
    },
    [images, maxImages, multiple, onChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple,
    disabled: !canAddMore,
    noClick: images.length > 0 && !multiple,
  });

  const removeImage = (id: string) => {
    onChange(images.filter((image) => image.id !== id));
  };

  const setMainImage = (id: string) => {
    onChange(
      images.map((image) => ({
        ...image,
        isMain: image.id === id,
      })),
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </p>

      {images.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            multiple ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "max-w-xs",
          )}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
            >
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
                unoptimized
              />
              {multiple && image.isMain && (
                <span className="bg-primary absolute top-2 left-2 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                  Main
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {multiple && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs"
                    onClick={() => setMainImage(image.id)}
                  >
                    Set Main
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => removeImage(image.id)}
                  aria-label={`Remove ${image.name}`}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors",
            isDragActive
              ? "border-primary bg-orange-50/60"
              : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50",
            !multiple && images.length === 0 ? "aspect-square max-w-xs" : "",
          )}
        >
          <input {...getInputProps()} />
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
            {multiple ? (
              <Camera className="text-primary size-5" />
            ) : (
              <ImagePlus className="text-primary size-5" />
            )}
          </div>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {isDragActive
              ? "Drop images here"
              : "Drag & drop or click to upload"}
          </p>
          <p className="mt-1 text-xs text-gray-400">{helperText}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary text-primary mt-3 hover:bg-orange-50"
            onClick={open}
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
