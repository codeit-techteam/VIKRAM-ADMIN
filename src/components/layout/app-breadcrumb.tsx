"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types/common";

interface AppBreadcrumbProps {
  items?: BreadcrumbItemType[];
}

export function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  const pathname = usePathname();

  const breadcrumbItems: BreadcrumbItemType[] =
    items ??
    pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, arr) => ({
        label: segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        href:
          index < arr.length - 1
            ? `/${arr.slice(0, index + 1).join("/")}`
            : undefined,
      }));

  if (breadcrumbItems.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink render={<Link href={item.href} />}>
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
