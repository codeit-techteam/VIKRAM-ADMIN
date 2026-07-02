"use client";

import { cn } from "@/lib/utils";

interface SegmentedToggleOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedToggleProps<T extends string> {
  options: [SegmentedToggleOption<T>, SegmentedToggleOption<T>];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div className={cn("inline-flex rounded-full bg-gray-100 p-1", className)}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-[#1A1A1A] text-white"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
