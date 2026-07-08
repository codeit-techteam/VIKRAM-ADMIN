"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { DispatchConfirmView } from "@/components/dispatch/DispatchConfirmView";
import { DispatchDetailView } from "@/components/dispatch/DispatchDetailView";
import { DispatchSuccessView } from "@/components/dispatch/DispatchSuccessView";
import { LoadingConfirmationView } from "@/components/dispatch/LoadingConfirmationView";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTransferListStore } from "@/store/transfer-list-store";

function TransferNotFound({ transferId }: { transferId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-semibold text-[#1A1A1A]">Transfer not found</p>
      <p className="mt-1 text-sm text-[#64748B]">
        {transferId} does not exist in the transfer registry.
      </p>
      <Button
        className="mt-4"
        render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch`} />}
      >
        Back to Dispatch Control
      </Button>
    </div>
  );
}

function useLiveTransfer(transferId: string) {
  const transfers = useTransferListStore((state) => state.transfers);
  return useMemo(
    () => transfers.find((t) => t.transferId === transferId),
    [transfers, transferId],
  );
}

export function DispatchTransferDetailClient() {
  const params = useParams<{ transferId: string }>();
  const transfer = useLiveTransfer(params.transferId);

  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <DispatchDetailView transfer={transfer} />;
}

export function DispatchLoadingClient() {
  const params = useParams<{ transferId: string }>();
  const transfer = useLiveTransfer(params.transferId);

  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <LoadingConfirmationView transfer={transfer} />;
}

export function DispatchConfirmClient() {
  const params = useParams<{ transferId: string }>();
  const transfer = useLiveTransfer(params.transferId);

  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <DispatchConfirmView transfer={transfer} />;
}

export function DispatchSuccessClient() {
  const params = useParams<{ transferId: string }>();
  const transfer = useLiveTransfer(params.transferId);

  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <DispatchSuccessView transfer={transfer} />;
}
