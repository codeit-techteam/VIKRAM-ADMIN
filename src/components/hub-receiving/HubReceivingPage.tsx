"use client";

import { CheckCircle2, Eye, Package } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import { formatTransferDateTime } from "@/mock/transfers";
import { useTransferListStore } from "@/store/transfer-list-store";
import type { TransferListItem } from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

const CONDITION_OPTIONS = [
  { value: "good", label: "Good — No damage" },
  { value: "minor", label: "Minor issues noted" },
  { value: "damaged", label: "Damaged — requires review" },
] as const;

export function HubReceivingPage() {
  const transfers = useTransferListStore((state) => state.transfers);
  const receiveAtHub = useTransferListStore((state) => state.receiveAtHub);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferListItem | null>(null);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [condition, setCondition] = useState("good");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const hubQueue = useMemo(
    () =>
      transfers
        .filter(
          (t) => t.status === "REACHED_HUB" || t.status === "HUB_RECEIVED",
        )
        .sort(
          (a, b) =>
            new Date(b.reachedHubAt ?? b.createdAt).getTime() -
            new Date(a.reachedHubAt ?? a.createdAt).getTime(),
        ),
    [transfers],
  );

  const openReceiveDialog = useCallback((transfer: TransferListItem) => {
    setSelectedTransfer(transfer);
    setCondition("good");
    setRemarks("");
    setReceiveDialogOpen(true);
  }, []);

  const handleReceive = () => {
    if (!selectedTransfer) return;
    try {
      const conditionLabel =
        CONDITION_OPTIONS.find((c) => c.value === condition)?.label ??
        condition;
      receiveAtHub(selectedTransfer.transferId, {
        condition: conditionLabel,
        remarks: remarks || undefined,
      });
      notify.success(
        "Material received",
        `Inventory updated at ${selectedTransfer.destinationHub}. Transfer completed.`,
      );
      setReceiveDialogOpen(false);
      setSelectedTransfer(null);
    } catch (error) {
      notify.error(
        "Receipt failed",
        error instanceof Error ? error.message : "Unable to receive material.",
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Awaiting Receipt
          </p>
          <p className="text-primary mt-2 text-3xl font-bold">
            {String(hubQueue.length).padStart(2, "0")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:col-span-2">
          <p className="text-sm text-[#64748B]">
            Verify material, quantity, and condition before confirming hub
            receipt. Completing receipt increases hub inventory and closes the
            transfer.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            Hub Receiving Queue
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Transfers that have reached the destination hub and await
            verification.
          </p>
        </div>

        {isLoading ? (
          <div className="p-5">
            <DataTableSkeleton columns={7} rows={5} />
          </div>
        ) : hubQueue.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[#64748B]">
            No transfers awaiting hub receipt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination Hub</TableHead>
                  <TableHead>Arrived</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hubQueue.map((transfer) => {
                  const material =
                    transfer.material ??
                    transfer.materials[0]?.split(" x")[0] ??
                    "—";
                  const qty = transfer.quantity
                    ? `${transfer.quantity} ${transfer.quantityUnit ?? ""}`
                    : "—";

                  return (
                    <TableRow key={transfer.id}>
                      <TableCell className="text-primary font-semibold">
                        {transfer.transferId}
                      </TableCell>
                      <TableCell>{material}</TableCell>
                      <TableCell>{qty}</TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {transfer.sourceWarehouse}
                      </TableCell>
                      <TableCell>{transfer.destinationHub}</TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {transfer.reachedHubAt
                          ? formatTransferDateTime(transfer.reachedHubAt)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <TransferStatusBadge transfer={transfer} />
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
                                href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${transfer.transferId}`}
                              />
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-semibold"
                            onClick={() => openReceiveDialog(transfer)}
                          >
                            <Package className="size-3.5" />
                            Receive Material
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receive Material</DialogTitle>
            <DialogDescription>
              Verify material details and confirm hub receipt for{" "}
              {selectedTransfer?.transferId}.
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Material</p>
                    <p className="font-semibold">
                      {selectedTransfer.material ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="font-semibold">
                      {selectedTransfer.quantity}{" "}
                      {selectedTransfer.quantityUnit}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={condition}
                  onValueChange={(v) => v && setCondition(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Remarks (optional)</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Verification notes..."
                  rows={3}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="gap-2" onClick={handleReceive}>
              <CheckCircle2 className="size-4" />
              Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
