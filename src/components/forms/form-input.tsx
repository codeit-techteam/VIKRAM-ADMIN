"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  disabled,
  className,
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2">
          <Label htmlFor={name}>{label}</Label>
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            className={cn(className)}
          />
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          {fieldState.error && (
            <p className="text-destructive text-sm">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
