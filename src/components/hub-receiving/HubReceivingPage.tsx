"use client";

import { Eye, ExternalLink, FileText, Package, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import {
  hubReceivingService,
  type HubReceivingItem,
  type HubReceivingSummary,
} from "@/services/hubReceiving";
import { notify } from "@/utils/notify";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusLabel(item: HubReceivingItem): string {
  if (item.queueStatus === "received") return "Received";
  if (item.rawStatus === "IN_TRANSIT") return "In Transit";
  if (item.rawStatus === "DISPATCHED") return "Dispatched";
  return item.rawStatus;
}

function statusClass(item: HubReceivingItem): string {
  if (item.queueStatus === "received") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  return "bg-amber-50 text-amber-700 border-amber-100";
}

export function HubReceivingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<HubReceivingItem[]>([]);
  const [summary, setSummary] = useState<HubReceivingSummary>({
    awaitingReceipt: 0,
    receivedToday: 0,
    pendingVerification: 0,
    completed: 0,
    rejected: 0,
  });
  const [selected, setSelected] = useState<HubReceivingItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await hubReceivingService.list();
      setItems(data.items);
      setSummary(data.summary);
    } catch (error) {
      notify.error(
        "Failed to load hub receiving",
        error instanceof Error ? error.message : "Unable to fetch queue",
      );
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load(true);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const openDetail = useCallback(async (item: HubReceivingItem) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await hubReceivingService.getById(item.id);
      setSelected(detail);
    } catch (error) {
      setSelected(item);
      notify.error(
        "Detail load failed",
        error instanceof Error ? error.message : "Unable to load details",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const queue = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.queueStatus !== b.queueStatus) {
          return a.queueStatus === "awaiting_receipt" ? -1 : 1;
        }
        const aTime = new Date(a.receivedAt ?? a.dispatchDate ?? 0).getTime();
        const bTime = new Date(b.receivedAt ?? b.dispatchDate ?? 0).getTime();
        return bTime - aTime;
      }),
    [items],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Awaiting Receipt
          </p>
          <p className="text-primary mt-2 text-3xl font-bold">
            {String(summary.awaitingReceipt).padStart(2, "0")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Received Today
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {String(summary.receivedToday).padStart(2, "0")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Completed
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A1A]">
            {String(summary.completed).padStart(2, "0")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#64748B]">
            Live hub receipts with delivery photos and GRN from Cloudflare R2.
            Queue refreshes automatically.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => void load()}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            Hub Receiving Queue
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            In-transit transfers and completed hub receipts with proof.
          </p>
        </div>

        {isLoading ? (
          <div className="p-5">
            <DataTableSkeleton columns={8} rows={5} />
          </div>
        ) : queue.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[#64748B]">
            No transfers in hub receiving queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Hub</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Dispatch / Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-primary font-semibold">
                      {item.transferId}
                    </TableCell>
                    <TableCell>{item.hubName}</TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {item.vehicle}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {item.driverName}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm">
                      {item.materialSummary || item.quantitySummary}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {item.queueStatus === "received"
                        ? formatDateTime(item.receivedAt)
                        : formatDateTime(item.dispatchDate)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass(item)}`}
                      >
                        {statusLabel(item)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-8"
                          render={
                            <Link
                              href={`${ROUTES.CENTRAL_WAREHOUSE}/requisitions`}
                            />
                          }
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-semibold"
                          onClick={() => void openDetail(item)}
                        >
                          <Package className="size-3.5" />
                          {item.queueStatus === "received"
                            ? "View Receipt"
                            : "View Transfer"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.queueStatus === "received"
                ? "Hub Receipt Details"
                : "Transfer Awaiting Hub Receipt"}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.transferId} · ${selected.hubName}`
                : "Loading…"}
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !selected ? (
            <div className="py-8 text-center text-sm text-[#64748B]">
              Loading details…
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Warehouse</p>
                  <p className="font-semibold">{selected.warehouseName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Hub</p>
                  <p className="font-semibold">{selected.hubName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Vehicle</p>
                  <p className="font-semibold">{selected.vehicle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Driver</p>
                  <p className="font-semibold">{selected.driverName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Received By</p>
                  <p className="font-semibold">{selected.receivedBy ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Received At</p>
                  <p className="font-semibold">
                    {formatDateTime(selected.receivedAt)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#1A1A1A]">
                  Materials
                </h3>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead>Product</TableHead>
                        <TableHead>Dispatched</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Diff</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.materials.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="font-medium">{m.productName}</div>
                            <div className="text-xs text-gray-400">
                              {m.sku ?? "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {m.dispatchedQty} {m.unit}
                          </TableCell>
                          <TableCell>
                            {m.receivedQty ?? "—"} {m.unit}
                          </TableCell>
                          <TableCell>
                            {m.difference == null
                              ? "—"
                              : m.difference === 0
                                ? "0"
                                : m.difference}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {m.status}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#1A1A1A]">
                  Delivery Photos
                </h3>
                {selected.photos.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No photos uploaded.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {selected.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.name ?? "Delivery photo"}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#1A1A1A]">
                  Documents (GRN / Gate Pass)
                </h3>
                {selected.documents.length === 0 ? (
                  <p className="text-sm text-[#64748B]">
                    No documents uploaded.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selected.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="size-4 text-[#FF6B00]" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-400">
                              {doc.type} · {doc.size}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="size-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
