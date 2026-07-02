"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, ImagePlus } from "lucide-react";

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
  onFileSelect?: (file: MockUploadFile) => void;
  onFileChange?: (file: File | null) => void;
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
  onFileSelect,
  onFileChange,
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

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          isCompact
            ? "aspect-[2/1] cursor-pointer border-gray-200 bg-gray-50/50 px-4 py-6 hover:border-gray-300 hover:bg-gray-50"
            : "border-orange-300 bg-orange-50/40 px-6 py-10",
          isDragActive &&
            (isCompact
              ? "border-primary bg-orange-50/60"
              : "border-primary bg-orange-50"),
        )}
      >
        <input {...getInputProps()} />
        {isCompact ? (
          <ImagePlus className="mb-2 size-8 text-gray-300" />
        ) : (
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
            <DropIcon className="text-primary size-6" />
          </div>
        )}
        <p
          className={cn(
            "text-center font-medium text-[#1A1A1A]",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {displayLabel}
        </p>
        <p
          className={cn(
            "mt-1 text-center text-gray-400",
            isCompact ? "text-[10px]" : "text-xs",
          )}
        >
          {resolvedHelperText}
        </p>
        {!isCompact && (
          <Button
            type="button"
            variant="outline"
            className="border-primary text-primary mt-4 hover:bg-orange-50"
            onClick={open}
          >
            Select Files
          </Button>
        )}
      </div>

      {selectedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <p className="truncate text-sm font-medium text-[#1A1A1A]">
              {selectedFile.name}
            </p>
          </div>
          <ProgressBar value={selectedFile.progress} />
        </div>
      )}
    </div>
  );
}
