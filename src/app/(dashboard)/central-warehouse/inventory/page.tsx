import Link from "next/link";
import { Calendar, Download, Plus } from "lucide-react";
import type { Metadata } from "next";

import { InventoryPage } from "@/components/inventory/InventoryPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Inventory Management",
};

export default function InventoryManagementPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory Management - Central Warehouse"
        actions={
          <>
            <Button variant="outline" className="h-10 gap-2 px-4">
              <Calendar className="size-4" />
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Button>
            <Button variant="outline" className="h-10 gap-2 px-4">
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button
              className="h-10 gap-2 px-4"
              render={
                <Link
                  href={`${ROUTES.CENTRAL_WAREHOUSE}/inventory/add-material`}
                />
              }
            >
              <Plus className="size-4" />
              Add New Material
            </Button>
          </>
        }
      />

      <InventoryPage />
    </div>
  );
}
