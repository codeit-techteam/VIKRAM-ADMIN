"use client";

import { Box } from "lucide-react";
import { useCallback } from "react";

import { AllocationPage } from "@/components/allocation/AllocationPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export function AllocationPageContent() {
  const handleAllocateMaterial = useCallback(() => {
    window.dispatchEvent(new CustomEvent("allocation:open"));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Material Allocation Center"
        subtitle="Allocate warehouse inventory to approved requisitions before dispatch."
        actions={
          <Button className="h-10 gap-2 px-4" onClick={handleAllocateMaterial}>
            <Box className="size-4" />
            Allocate Material
          </Button>
        }
      />

      <AllocationPage />
    </div>
  );
}
