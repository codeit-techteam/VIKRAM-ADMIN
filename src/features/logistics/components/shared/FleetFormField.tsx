"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FleetFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FleetFormField({
  label,
  required,
  error,
  className,
  children,
}: FleetFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-[#64748B]">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

interface FleetFormSectionProps {
  title: string;
  id: string;
  children: React.ReactNode;
}

export function FleetFormSection({
  title,
  id,
  children,
}: FleetFormSectionProps) {
  return (
    <section id={id} className="scroll-mt-4 space-y-4">
      <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-[#1A1A1A]">
        {title}
      </h3>
      {children}
    </section>
  );
}
