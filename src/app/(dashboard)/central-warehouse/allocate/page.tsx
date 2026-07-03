import type { Metadata } from "next";

import { AllocationPageContent } from "@/components/allocation/AllocationPageContent";

export const metadata: Metadata = {
  title: "Material Allocation Center",
};

export default function AllocationCenterPage() {
  return <AllocationPageContent />;
}
