import type { Metadata } from "next";

import { InventoryPage } from "@/components/inventory/InventoryPage";

export const metadata: Metadata = {
  title: "Inventory Management",
};

export default function InventoryManagementPage() {
  return <InventoryPage />;
}
