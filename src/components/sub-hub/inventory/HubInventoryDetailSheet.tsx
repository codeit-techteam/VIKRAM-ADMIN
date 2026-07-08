"use client";

import Link from "next/link";
import { Package, Truck } from "lucide-react";

import { HubInventoryStatusBadge } from "@/components/sub-hub/inventory/HubInventoryStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import type { ErpActivityLog, ErpDispatch } from "@/types/erp.types";
import type { TransferListItem } from "@/types/warehouse.types";
import type { HubNetworkInventoryRow } from "@/utils/hub-inventory-overview";
import { cn } from "@/lib/utils";

interface HubInventoryDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: HubNetworkInventoryRow | null;
  incomingTransfers: TransferListItem[];
  outgoingDispatches: ErpDispatch[];
  history: ErpActivityLog[];
  focusHistory?: boolean;
}

function formatQty(value: number, unit: string) {
  return `${value.toLocaleString("en-IN")} ${unit}`;
}

function formatWhen(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "muted";
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-[#FAFAFA] p-3">
      <p className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold",
          tone === "warning" && "text-primary",
          tone === "muted" && "text-[#64748B]",
          !tone || tone === "default" ? "text-[#1A1A1A]" : null,
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function HubInventoryDetailSheet({
  open,
  onOpenChange,
  row,
  incomingTransfers,
  outgoingDispatches,
  history,
  focusHistory,
}: HubInventoryDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-lg"
      >
        {row ? (
          <>
            <SheetHeader className="border-b border-gray-100 p-5">
              <div className="pr-8">
                <SheetTitle className="text-lg text-[#1A1A1A]">
                  {row.materialName}
                </SheetTitle>
                <SheetDescription className="mt-1">
                  {row.hubName} · {row.sku}
                </SheetDescription>
                <div className="mt-3">
                  <HubInventoryStatusBadge status={row.status} />
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 p-5">
              <section>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Material Details
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Metric label="Category" value={row.category} />
                  <Metric label="Supplier" value={row.supplier} />
                  <Metric label="Material Type" value={row.materialType} />
                  <Metric
                    label="Unit Price"
                    value={`₹${row.unitPrice.toLocaleString("en-IN")}`}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Current Stock
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Metric
                    label="Available"
                    value={formatQty(row.availableQty, row.unit)}
                    tone={
                      row.availableQty <= row.reorderLevel
                        ? "warning"
                        : "default"
                    }
                  />
                  <Metric
                    label="Reserved"
                    value={formatQty(row.reservedQty, row.unit)}
                  />
                  <Metric
                    label="Free"
                    value={formatQty(row.freeQty, row.unit)}
                  />
                  <Metric
                    label="Reorder Level"
                    value={formatQty(row.reorderLevel, row.unit)}
                    tone="muted"
                  />
                  <Metric
                    label="Safety Stock"
                    value={formatQty(row.safetyStock, row.unit)}
                    tone="muted"
                  />
                  <Metric
                    label="Max Stock"
                    value={formatQty(row.maxStock, row.unit)}
                    tone="muted"
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">
                    Incoming Transfers
                  </h3>
                  <Link
                    href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers?hub=${row.hubId}`}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    View all
                  </Link>
                </div>
                {incomingTransfers.length === 0 ? (
                  <p className="mt-3 text-sm text-[#64748B]">
                    No inbound transfers for this SKU.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {incomingTransfers.map((transfer) => (
                      <li
                        key={transfer.transferId}
                        className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          <Truck className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#1A1A1A]">
                            {transfer.transferId}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {transfer.quantity?.toLocaleString("en-IN")}{" "}
                            {transfer.quantityUnit} ·{" "}
                            {transfer.status.replaceAll("_", " ")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">
                    Outgoing Dispatches
                  </h3>
                  <Link
                    href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch`}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    Dispatch
                  </Link>
                </div>
                {outgoingDispatches.length === 0 ? (
                  <p className="mt-3 text-sm text-[#64748B]">
                    No active outbound dispatches.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {outgoingDispatches.map((dispatch) => (
                      <li
                        key={dispatch.id}
                        className="rounded-lg border border-gray-100 p-3"
                      >
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {dispatch.dispatchId}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {dispatch.quantity.toLocaleString("en-IN")}{" "}
                          {dispatch.unit} ·{" "}
                          {dispatch.status.replaceAll("_", " ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section id="inventory-history">
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Stock Timeline & History
                </h3>
                {history.length === 0 ? (
                  <div className="mt-3">
                    <EmptyState
                      title="No history yet"
                      description="Adjustments, transfers, and dispatches will appear here."
                      icon={<Package className="size-7" />}
                    />
                  </div>
                ) : (
                  <ol
                    className={cn(
                      "relative mt-3 space-y-0",
                      focusHistory &&
                        "ring-primary/30 rounded-lg ring-2 ring-offset-2",
                    )}
                  >
                    {history.map((event, index) => {
                      const isLast = index === history.length - 1;
                      return (
                        <li key={event.id} className="relative flex gap-3 pb-4">
                          {!isLast ? (
                            <span className="absolute top-3 left-[11px] h-full w-px bg-gray-200" />
                          ) : null}
                          <span className="bg-primary relative z-10 mt-1 size-2.5 shrink-0 rounded-full" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#1A1A1A]">
                              {event.action}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {event.module} · {event.user}
                            </p>
                            {event.remarks ? (
                              <p className="mt-0.5 text-xs text-[#475569]">
                                {event.remarks}
                              </p>
                            ) : null}
                            <p className="mt-1 text-[11px] text-[#94A3B8]">
                              {formatWhen(event.timestamp)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
