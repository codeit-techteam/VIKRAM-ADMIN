import type { Metadata } from "next";

import { MaterialWizard } from "@/components/inventory/material/MaterialWizard";

export const metadata: Metadata = {
  title: "Add New Material",
};

export default function AddMaterialPage() {
  return <MaterialWizard />;
}
