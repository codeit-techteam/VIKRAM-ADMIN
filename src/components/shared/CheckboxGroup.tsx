"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CheckboxOption {
  id: string;
  label: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

export function CheckboxGroup({
  options,
  selectedIds,
  onChange,
  className,
}: CheckboxGroupProps) {
  const toggleOption = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, id]);
      return;
    }

    onChange(selectedIds.filter((selectedId) => selectedId !== id));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((option) => {
        const isChecked = selectedIds.includes(option.id);

        return (
          <div key={option.id} className="flex items-center gap-2.5">
            <Checkbox
              id={option.id}
              checked={isChecked}
              onCheckedChange={(checked) =>
                toggleOption(option.id, checked === true)
              }
            />
            <Label
              htmlFor={option.id}
              className="cursor-pointer text-sm font-normal text-[#1A1A1A]"
            >
              {option.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
