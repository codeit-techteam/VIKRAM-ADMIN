"use client";

import type { ReactNode } from "react";

import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/shared/Breadcrumbs";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

interface CePageShellProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CePageShell({
  breadcrumbs,
  title,
  subtitle,
  actions,
  children,
  className,
}: CePageShellProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Breadcrumbs items={breadcrumbs} />
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </div>
  );
}
