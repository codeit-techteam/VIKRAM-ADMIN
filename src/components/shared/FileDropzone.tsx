"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";

import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MockUploadFile {
  name: string;
  progress: number;
}

interface FileDropzoneProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  supportedFormatsText?: string;
  selectedFile?: MockUploadFile | null;
  onFileSelect?: (file: MockUploadFile) => void;
  className?: string;
}

export function FileDropzone({
  accept = {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
  },
  maxSize = 500 * 1024 * 1024,
  supportedFormatsText = "Supported formats: MP4, MOV (Max 500MB)",
  selectedFile,
  onFileSelect,
  className,
}: FileDropzoneProps) {
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
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-300 bg-orange-50/40 px-6 py-10 transition-colors",
          isDragActive && "border-primary bg-orange-50",
        )}
      >
        <input {...getInputProps()} />
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
          <CloudUpload className="text-primary size-6" />
        </div>
        <p className="text-sm font-medium text-[#1A1A1A]">
          {isDragActive ? "Drop video files here" : "Drag and drop video files"}
        </p>
        <p className="mt-1 text-xs text-gray-400">{supportedFormatsText}</p>
        <Button
          type="button"
          variant="outline"
          className="border-primary text-primary mt-4 hover:bg-orange-50"
          onClick={open}
        >
          Select Files
        </Button>
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
