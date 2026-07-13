"use client";

import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, ImagePlus, X } from "lucide-react";

import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MockUploadFile {
  name: string;
  progress: number;
}

interface FileDropzoneProps {
  variant?: "banner" | "compact";
  label?: string;
  helperText?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  supportedFormatsText?: string;
  selectedFile?: MockUploadFile | null;
  previewUrl?: string | null;
  onFileSelect?: (file: MockUploadFile | null) => void;
  onFileChange?: (file: File | null) => void;
  onClear?: () => void;
  className?: string;
}

const BANNER_DEFAULTS = {
  label: "Drag and drop video files",
  dragActiveLabel: "Drop video files here",
  helperText: "Supported formats: MP4, MOV (Max 500MB)",
  accept: {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
  },
  maxSize: 500 * 1024 * 1024,
} as const;

export function FileDropzone({
  variant = "banner",
  label,
  helperText,
  accept,
  maxSize,
  supportedFormatsText,
  selectedFile,
  previewUrl,
  onFileSelect,
  onFileChange,
  onClear,
  className,
}: FileDropzoneProps) {
  const isCompact = variant === "compact";
  const resolvedAccept = accept ?? BANNER_DEFAULTS.accept;
  const resolvedMaxSize = maxSize ?? BANNER_DEFAULTS.maxSize;
  const resolvedLabel = label ?? BANNER_DEFAULTS.label;
  const resolvedHelperText =
    helperText ?? supportedFormatsText ?? BANNER_DEFAULTS.helperText;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      onFileSelect?.({
        name: file.name,
        progress: 0,
      });
      onFileChange?.(file);
    },
    [onFileChange, onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: resolvedAccept,
    maxSize: resolvedMaxSize,
    maxFiles: 1,
    noClick: !isCompact,
    noKeyboard: !isCompact,
  });

  const DropIcon = isCompact ? ImagePlus : CloudUpload;
  const displayLabel = isDragActive
    ? isCompact
      ? "Drop file here"
      : BANNER_DEFAULTS.dragActiveLabel
    : resolvedLabel;
  const hasCompactSelection = isCompact && (selectedFile || previewUrl);

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onFileSelect?.(null);
    onFileChange?.(null);
    onClear?.();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "rounded-lg border-2 border-dashed transition-colors",
          isCompact
            ? "cursor-pointer border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
            : "flex flex-col items-center justify-center border-orange-300 bg-orange-50/40 px-6 py-10",
          isDragActive &&
            (isCompact
              ? "border-primary bg-orange-50/60"
              : "border-primary bg-orange-50"),
        )}
      >
        <input {...getInputProps()} />
        {isCompact ? (
          hasCompactSelection ? (
            <div className="flex items-center gap-3 px-3 py-2.5">
              {previewUrl ? (
                <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                  <Image
                    src={previewUrl}
                    alt="Selected file preview"
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={previewUrl.startsWith("blob:")}
                  />
                </div>
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white">
                  <ImagePlus className="size-4 text-gray-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#1A1A1A]">
                  {selectedFile?.name ?? "Image selected"}
                </p>
                <p className="text-[10px] text-gray-400">
                  Click or drop to replace
                </p>
                {selectedFile ? (
                  <div className="mt-1.5">
                    <ProgressBar value={selectedFile.progress} />
                  </div>
                ) : null}
              </div>
              {hasCompactSelection ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-gray-400 hover:text-gray-600"
                  onClick={handleClear}
                  aria-label="Remove file"
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white">
                <ImagePlus className="size-5 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-medium text-[#1A1A1A]">
                  {displayLabel}
                </p>
                <p className="text-[10px] text-gray-400">
                  {resolvedHelperText}
                </p>
              </div>
              <span className="text-primary shrink-0 text-xs font-semibold">
                Browse
              </span>
            </div>
          )
        ) : (
          <>
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
              <DropIcon className="text-primary size-6" />
            </div>
            <p className="text-center text-sm font-medium text-[#1A1A1A]">
              {displayLabel}
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              {resolvedHelperText}
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary mt-4 hover:bg-orange-50"
              onClick={open}
            >
              Select Files
            </Button>
          </>
        )}
      </div>

      {selectedFile && !isCompact ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <p className="truncate text-sm font-medium text-[#1A1A1A]">
              {selectedFile.name}
            </p>
          </div>
          <ProgressBar value={selectedFile.progress} />
        </div>
      ) : null}
    </div>
  );
}
