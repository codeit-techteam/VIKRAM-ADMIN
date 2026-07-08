"use client";

import { Box } from "lucide-react";
import Link from "next/link";

import { AllocationPage } from "@/components/allocation/AllocationPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function AllocationPageContent() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Material Allocation Center"
        subtitle="Allocate warehouse inventory to approved requisitions before dispatch."
        actions={
          <Button
            className="h-10 gap-2 px-4"
            nativeButton={false}
            render={
              <Link href={`${ROUTES.CENTRAL_WAREHOUSE}/allocate/workflow`} />
            }
          >
            <Box className="size-4" />
            Allocate Material
          </Button>
        }
      />

      <AllocationPage />
    </div>
  );
}
