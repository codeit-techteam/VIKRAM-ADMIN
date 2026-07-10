"use client";

import { usePathname } from "next/navigation";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";

interface LayoutBreadcrumbProps {
  className?: string;
}

export function LayoutBreadcrumb({ className }: LayoutBreadcrumbProps) {
  const pathname = usePathname();
  const items = getBreadcrumbsFromPath(pathname);

  return <Breadcrumbs items={items} className={cn("mb-4", className)} />;
}
