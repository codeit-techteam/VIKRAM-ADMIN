import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormSectionCardProps {
  icon: LucideIcon;
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSectionCard({
  icon: Icon,
  title,
  headerAction,
  children,
  className,
}: FormSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-gray-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50">
            <Icon className="text-primary size-4" />
          </div>
          <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
        </div>
        {headerAction}
      </div>
      {children}
    </section>
  );
}
