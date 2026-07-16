"use client";

import Link from "next/link";
import { Calendar, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";

function formatTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WarehouseDashboardHeader() {
  return (
    <PageHeader
      title="Warehouse Dashboard"
      subtitle="Live monitoring of operations at the Noida Central Hub."
      breadcrumbs={getNavBreadcrumbsFromPath("/central-warehouse")}
      actions={
        <>
          <Button variant="outline" className="h-10 gap-2 px-4" disabled>
            <Calendar className="size-4" />
            {formatTodayLabel()}
          </Button>
          <Button
            className="h-10 gap-2 px-4"
            render={
              <Link
                href={`${ROUTES.CENTRAL_WAREHOUSE}/requisitions?status=PENDING`}
              />
            }
          >
            <Plus className="size-4" />
            New Requisition
          </Button>
        </>
      }
    />
  );
}
