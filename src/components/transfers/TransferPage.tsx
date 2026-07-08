"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  TransferStatsCard,
  type TransferStatCardData,
} from "@/components/transfers/TransferStatsCard";
import { TransferTable } from "@/components/transfers/TransferTable";
import {
  EMPTY_TRANSFER_FILTERS,
  fetchTransfers,
  TRANSFER_PAGE_SIZE,
} from "@/mock/transfers";
import { useTransferListStore } from "@/store/transfer-list-store";
import type {
  TransferFilters,
  TransferListItem,
} from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

export function TransferPage() {
  const transfers = useTransferListStore((state) => state.transfers);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TransferFilters>(
    EMPTY_TRANSFER_FILTERS,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const queryResult = useMemo(
    () =>
      fetchTransfers(transfers, {
        page: currentPage,
        limit: TRANSFER_PAGE_SIZE,
        filters,
      }),
    [transfers, currentPage, filters],
  );

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

  const statCards = useMemo<TransferStatCardData[]>(
    () => [
      {
        id: "pending-dispatch",
        label: "Pending Dispatch",
        value: String(queryResult.stats.pendingDispatch).padStart(2, "0"),
        variant: "warning",
      },
      {
        id: "in-transit",
        label: "In Transit",
        value: String(queryResult.stats.inTransit),
        variant: "default",
      },
      {
        id: "delivered-today",
        label: "Delivered Today",
        value: String(queryResult.stats.deliveredToday).padStart(2, "0"),
        variant: "default",
      },
      {
        id: "delayed-transfers",
        label: "Delayed Transfers",
        value: String(queryResult.stats.delayedTransfers).padStart(2, "0"),
        variant: "critical",
      },
    ],
    [queryResult.stats],
  );

  const handleView = useCallback((item: TransferListItem) => {
    notify.info(
      "Transfer Details",
      `Viewing ${item.transferId} — detail drawer coming in the next release.`,
    );
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <TransferStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <TransferTable
        items={queryResult.data}
        isLoading={isLoading}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={TRANSFER_PAGE_SIZE}
        filters={filters}
        onFiltersChange={setFilters}
        onPageChange={setCurrentPage}
        onView={handleView}
      />

      <p className="pt-2 text-center text-xs text-gray-400">
        BuildQuick India | Enterprise Resource Planning v4.2.0 | © 2023
      </p>
    </div>
  );
}
