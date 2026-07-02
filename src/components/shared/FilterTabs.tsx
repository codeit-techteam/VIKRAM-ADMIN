"use client";

import { cn } from "@/lib/utils";

export interface FilterTabOption<T extends string> {
  label: string;
  value: T;
}

interface FilterTabsProps<T extends string> {
  options: readonly FilterTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-gray-100 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-white"
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
