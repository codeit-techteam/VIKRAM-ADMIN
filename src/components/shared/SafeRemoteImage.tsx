"use client";

import Image, { type ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function isValidRemoteSrc(src: unknown): src is string {
  if (typeof src !== "string") return false;
  const value = src.trim();
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  );
}

type SafeRemoteImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackClassName?: string;
};

/**
 * Next/Image crashes when `src` is "" or missing. Use this for CMS/catalog media.
 */
export function SafeRemoteImage({
  src,
  alt,
  className,
  fallbackClassName,
  fill,
  ...rest
}: SafeRemoteImageProps) {
  if (!isValidRemoteSrc(src)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          fill ? "absolute inset-0" : undefined,
          fallbackClassName,
          className,
        )}
        aria-label={alt}
      >
        <ImageIcon className="size-4" />
      </div>
    );
  }

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      unoptimized={src.includes("r2.dev") || src.startsWith("blob:")}
    />
  );
}
