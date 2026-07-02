"use client";

import { cn } from "@/lib/utils";

export interface PillRadioOption<T extends string> {
  value: T;
  label: string;
}

interface PillRadioGroupProps<T extends string> {
  options: PillRadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  name?: string;
}

export function PillRadioGroup<T extends string>({
  options,
  value,
  onChange,
  className,
  name = "pill-radio",
}: PillRadioGroupProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            name={name}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isSelected
                ? "border-primary text-primary bg-orange-50"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
