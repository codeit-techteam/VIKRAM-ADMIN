"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { TransferDetailPage } from "@/components/transfers/TransferDetailPage";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTransferListStore } from "@/store/transfer-list-store";

export function TransferDetailClient() {
  const params = useParams<{ transferId: string }>();
  const transfers = useTransferListStore((state) => state.transfers);
  const transfer = useMemo(
    () => transfers.find((t) => t.transferId === params.transferId),
    [transfers, params.transferId],
  );

  if (!transfer) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-semibold text-[#1A1A1A]">
          Transfer not found
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          {params.transferId} does not exist in the transfer registry.
        </p>
        <Button
          className="mt-4"
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers`} />}
        >
          Back to Transfer Management
        </Button>
      </div>
    );
  }

  return <TransferDetailPage transfer={transfer} />;
}
