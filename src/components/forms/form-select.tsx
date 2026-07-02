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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/types/common";

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select an option",
  options,
  disabled,
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel>{label}</FieldLabel>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger aria-invalid={!!fieldState.error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
}
