"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DashboardDateFilterControl } from "@/features/dashboard/components/DashboardDateFilterControl";
import { OperationsDashboard } from "@/features/dashboard/components/OperationsDashboard";
import { exportExecutiveDashboardReport } from "@/features/dashboard/utils/export-executive-report";
import type { DashboardDateFilter } from "@/mock/executive-dashboard";
import { notify } from "@/utils/notify";

export function ExecutiveDashboardPage() {
  const [dateFilter, setDateFilter] = useState<DashboardDateFilter>({
    range: "quarter",
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      exportExecutiveDashboardReport(dateFilter);
      notify.success(
        "Report downloaded",
        "Executive dashboard data exported to Excel.",
      );
    } catch {
      notify.error(
        "Export failed",
        "Unable to generate the report. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

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
            <Button
              className="h-10 gap-2 bg-[#1A1A1A] px-4 text-white hover:bg-[#1A1A1A]/90"
              disabled={isExporting}
              onClick={handleExportReport}
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </>
        }
      />

      <OperationsDashboard dateFilter={dateFilter} />
    </div>
  );
}
