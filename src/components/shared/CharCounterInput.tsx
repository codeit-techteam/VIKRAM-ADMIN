"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CharCounterBaseProps {
  value: string;
  maxLength: number;
  className?: string;
}

interface CharCounterInputProps extends CharCounterBaseProps {
  placeholder?: string;
  id?: string;
  onChange: (value: string) => void;
}

interface CharCounterTextareaProps extends CharCounterBaseProps {
  placeholder?: string;
  id?: string;
  rows?: number;
  onChange: (value: string) => void;
}

function CharCounter({ value, maxLength }: CharCounterBaseProps) {
  const remaining = maxLength - value.length;
  const isNearLimit = remaining <= 5;

  return (
    <span
      className={cn("text-xs", isNearLimit ? "text-red-500" : "text-gray-400")}
    >
      {value.length}/{maxLength}
    </span>
  );
}

export function CharCounterInput({
  value,
  maxLength,
  placeholder,
  id,
  onChange,
  className,
}: CharCounterInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="pr-14"
      />
      <div className="pointer-events-none absolute right-2.5 bottom-2">
        <CharCounter value={value} maxLength={maxLength} />
      </div>
    </div>
  );
}

export function CharCounterTextarea({
  value,
  maxLength,
  placeholder,
  id,
  rows = 4,
  onChange,
  className,
}: CharCounterTextareaProps) {
  return (
    <div className={cn("relative", className)}>
      <Textarea
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 resize-none pb-7"
      />
      <div className="pointer-events-none absolute right-2.5 bottom-2">
        <CharCounter value={value} maxLength={maxLength} />
      </div>
    </div>
  );
}
