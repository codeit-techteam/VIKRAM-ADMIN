"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DashboardDateFilterControl } from "@/features/dashboard/components/DashboardDateFilterControl";
import { OperationsDashboard } from "@/features/dashboard/components/OperationsDashboard";
import type { DashboardDateFilter } from "@/mock/executive-dashboard";

export function ExecutiveDashboardPage() {
  const [dateFilter, setDateFilter] = useState<DashboardDateFilter>({
    range: "quarter",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Procurement & logistics intelligence across India."
        actions={
          <>
            <DashboardDateFilterControl
              value={dateFilter}
              onChange={setDateFilter}
            />
            <Button className="h-10 gap-2 bg-[#1A1A1A] px-4 text-white hover:bg-[#1A1A1A]/90">
              <Download className="size-4" />
              Export Report
            </Button>
          </>
        }
      />

      <OperationsDashboard dateFilter={dateFilter} />
    </div>
  );
}
