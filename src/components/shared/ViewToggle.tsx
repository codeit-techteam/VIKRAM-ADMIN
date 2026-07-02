"use client";

import { LayoutGrid, List } from "lucide-react";

import type { ViewMode } from "@/features/cms/types/video.types";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-gray-100 bg-white p-1",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-colors",
          value === "grid"
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 hover:text-gray-600",
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        type="button"
        aria-label="List view"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "flex size-8 items-center justify-center rounded-md transition-colors",
          value === "list"
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 hover:text-gray-600",
        )}
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
