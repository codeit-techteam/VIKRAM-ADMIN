"use client";

import { useMemo } from "react";

import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTransferDateTime } from "@/mock/transfers";
import { useTransferListStore } from "@/store/transfer-list-store";
import { DISPATCH_QUEUE_STATUSES } from "@/utils/transfer-actions";

interface DispatchQueueProps {
  isLoading?: boolean;
}

export function DispatchQueue({ isLoading = false }: DispatchQueueProps) {
  const transfers = useTransferListStore((state) => state.transfers);

  const pendingTransfers = useMemo(
    () =>
      transfers.filter((transfer) =>
        DISPATCH_QUEUE_STATUSES.includes(transfer.status),
      ),
    [transfers],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <DataTableSkeleton columns={5} rows={5} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-bold text-[#1A1A1A]">Dispatch Queue</h2>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Transfers awaiting dispatch confirmation. Inventory remains reserved
          until dispatch is confirmed.
        </p>
      </div>

      {pendingTransfers.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-[#64748B]">
          No transfers pending dispatch.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead>Transfer ID</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingTransfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-semibold">
                  {transfer.transferId}
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {transfer.sourceWarehouse}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    → {transfer.destinationHub}
                  </p>
                </TableCell>
                <TableCell>{transfer.vehicleNumber ?? "—"}</TableCell>
                <TableCell>{transfer.assignedDriver?.name ?? "—"}</TableCell>
                <TableCell>
                  <TransferStatusBadge transfer={transfer} />
                </TableCell>
                <TableCell className="text-[#64748B]">
                  {formatTransferDateTime(transfer.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
