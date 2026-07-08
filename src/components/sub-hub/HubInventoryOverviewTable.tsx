"use client";

import Link from "next/link";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HubStockStatus } from "@/types/erp.types";
import type { HubInventoryRow } from "@/utils/hub-profile-metrics";
import { getHubInventoryHref } from "@/utils/hub-profile-metrics";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface HubInventoryOverviewTableProps {
  hubId: string;
  rows: HubInventoryRow[];
}

const STATUS_STYLES: Record<HubStockStatus, string> = {
  healthy: "bg-green-100 text-green-700",
  "low-stock": "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
  reserved: "bg-blue-100 text-blue-700",
  "out-of-stock": "bg-gray-200 text-gray-700",
  overstock: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<HubStockStatus, string> = {
  healthy: "Healthy",
  "low-stock": "Low Stock",
  critical: "Critical",
  reserved: "Reserved",
  "out-of-stock": "Out Of Stock",
  overstock: "Overstock",
};

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HubInventoryOverviewTable({
  hubId,
  rows,
}: HubInventoryOverviewTableProps) {
  return (
    <DashboardCard
      title="Inventory Overview"
      action={
        <Link
          href={getHubInventoryHref(hubId)}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All Inventory
        </Link>
      }
      contentClassName="mt-4"
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No inventory records"
          description="Inventory for this hub will appear after the first warehouse receipt."
          icon={<Package className="size-8" />}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Material</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Free</TableHead>
                <TableHead className="text-right">Incoming</TableHead>
                <TableHead className="text-right">Outgoing</TableHead>
                <TableHead className="text-right">Reorder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.materialId}
                  className="transition-colors hover:bg-orange-50/40"
                >
                  <TableCell className="font-medium text-[#1A1A1A]">
                    {row.materialName}
                  </TableCell>
                  <TableCell className="text-[#64748B]">{row.sku}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.availableQty.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.reservedQty.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {row.freeQty.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-blue-600 tabular-nums">
                    {row.incomingQty.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-orange-600 tabular-nums">
                    {row.outgoingQty.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.reorderLevel.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        STATUS_STYLES[row.status],
                      )}
                    >
                      {STATUS_LABELS[row.status]}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-[#64748B]">
                    {formatUpdated(row.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardCard>
  );
}
