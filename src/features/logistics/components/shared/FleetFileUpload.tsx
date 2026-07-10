"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { FileIcon, Upload, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FleetFileUploadProps {
  accept?: Accept;
  maxSize?: number;
  onFileChange?: (file: File | null) => void;
  className?: string;
  compact?: boolean;
  label?: string;
}

export function FleetFileUpload({
  accept,
  maxSize = 5 * 1024 * 1024,
  onFileChange,
  className,
  compact = false,
  label = "Upload",
}: FleetFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const next = acceptedFiles[0] ?? null;
      setFile(next);
      onFileChange?.(next);
      if (next?.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(next));
      } else {
        setPreview(null);
      }
    },
    [onFileChange],
  );

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    onFileChange?.(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize,
  });

  if (file) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-gray-100 bg-[#F8F9FB] p-3",
          className,
        )}
      >
        {preview ? (
          <Image
            src={preview}
            alt={file.name}
            width={40}
            height={40}
            className="size-10 rounded object-cover"
          />
        ) : (
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded">
            <FileIcon className="text-primary size-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-gray-400">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={removeFile}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "hover:border-primary/40 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-200 transition-colors hover:bg-orange-50/30",
        isDragActive && "border-primary bg-orange-50/50",
        compact ? "p-4" : "p-6",
        className,
      )}
    >
      <input {...getInputProps()} />
      <Upload className="text-muted-foreground size-5" />
      <p className="text-center text-xs text-gray-500">
        {isDragActive ? "Drop file here" : label}
      </p>
      <p className="text-[10px] text-gray-400">
        Drag & drop or click to browse
      </p>
    </div>
  );
}
