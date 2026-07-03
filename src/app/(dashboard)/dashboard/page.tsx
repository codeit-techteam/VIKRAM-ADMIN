import { Calendar, Download } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { OperationsDashboard } from "@/features/dashboard/components/OperationsDashboard";

export const metadata: Metadata = {
  title: "Executive Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Procurement & logistics intelligence across India."
        actions={
          <>
            <Button variant="outline" className="h-10 gap-2 px-4">
              <Calendar className="size-4" />
              This Quarter
            </Button>
            <Button className="h-10 gap-2 bg-[#1A1A1A] px-4 text-white hover:bg-[#1A1A1A]/90">
              <Download className="size-4" />
              Export Report
            </Button>
          </>
        }
      />

      <OperationsDashboard />
    </div>
  );
}
