"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { FileIcon, Upload, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  showPreview?: boolean;
}

export function FileUpload({
  accept,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  onFilesChange,
  className,
  showPreview = true,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesChange?.(newFiles);

      if (showPreview) {
        const newPreviews = newFiles.map((file) => {
          if (file.type.startsWith("image/")) {
            return URL.createObjectURL(file);
          }
          return "";
        });
        setPreviews(newPreviews);
      }
    },
    [files, maxFiles, onFilesChange, showPreview],
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-input flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors",
          isDragActive && "border-primary bg-accent",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="text-muted-foreground size-8" />
        <p className="text-muted-foreground text-sm">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop files here, or click to select"}
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="shadow-card flex items-center gap-3 rounded-lg border p-3"
            >
              {previews[index] ? (
                <Image
                  src={previews[index]}
                  alt={file.name}
                  width={40}
                  height={40}
                  className="size-10 rounded object-cover"
                />
              ) : file.type === "application/pdf" ? (
                <div className="bg-destructive/10 flex size-10 items-center justify-center rounded">
                  <FileIcon className="text-destructive size-5" />
                </div>
              ) : (
                <div className="bg-muted flex size-10 items-center justify-center rounded">
                  <FileIcon className="text-muted-foreground size-5" />
                </div>
              )}
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => removeFile(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
