"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  rows = 4,
  className,
}: FormTextareaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            aria-invalid={!!fieldState.error}
            className={cn(className)}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
}
