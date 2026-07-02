"use client";

import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface PrioritySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function PrioritySlider({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
}: PrioritySliderProps) {
  return (
    <div className={cn("relative space-y-3", className)}>
      <div className="flex justify-end">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
          Level {value}
        </Badge>
      </div>

      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(values) => {
          const next = Array.isArray(values) ? values[0] : values;
          if (next !== undefined) {
            onChange(next);
          }
        }}
      />

      <div className="flex justify-between text-xs text-gray-400">
        <span>Low</span>
        <span>Medium</span>
        <span>Critical</span>
      </div>
    </div>
  );
}
