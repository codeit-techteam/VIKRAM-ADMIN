"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { DispatchConfirmView } from "@/components/dispatch/DispatchConfirmView";
import { DispatchDetailView } from "@/components/dispatch/DispatchDetailView";
import { DispatchSuccessView } from "@/components/dispatch/DispatchSuccessView";
import { LoadingConfirmationView } from "@/components/dispatch/LoadingConfirmationView";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { warehouseService } from "@/services/warehouse";
import type { TransferListItem } from "@/types/warehouse.types";

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
  const [transfer, setTransfer] = useState<TransferListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    warehouseService
      .getTransfer(transferId)
      .then((item) => active && setTransfer(item))
      .catch(() => active && setTransfer(null))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [transferId]);
  return { transfer, isLoading };
}

export function DispatchTransferDetailClient() {
  const params = useParams<{ transferId: string }>();
  const { transfer, isLoading } = useLiveTransfer(params.transferId);

  if (isLoading)
    return <div className="py-16 text-center">Loading transfer...</div>;
  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <DispatchDetailView transfer={transfer} />;
}

export function DispatchLoadingClient() {
  const params = useParams<{ transferId: string }>();
  const { transfer, isLoading } = useLiveTransfer(params.transferId);

  if (isLoading)
    return <div className="py-16 text-center">Loading transfer...</div>;
  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <LoadingConfirmationView transfer={transfer} />;
}

export function DispatchConfirmClient() {
  const params = useParams<{ transferId: string }>();
  const { transfer, isLoading } = useLiveTransfer(params.transferId);

  if (isLoading)
    return <div className="py-16 text-center">Loading transfer...</div>;
  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <DispatchConfirmView transfer={transfer} />;
}

export function DispatchSuccessClient() {
  const params = useParams<{ transferId: string }>();
  const { transfer, isLoading } = useLiveTransfer(params.transferId);

  if (isLoading)
    return <div className="py-16 text-center">Loading transfer...</div>;
  if (!transfer) {
    return <TransferNotFound transferId={params.transferId} />;
  }

  return <DispatchSuccessView transfer={transfer} />;
}
