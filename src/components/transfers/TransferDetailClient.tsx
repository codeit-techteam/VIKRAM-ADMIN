"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { TransferDetailPage } from "@/components/transfers/TransferDetailPage";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { warehouseService } from "@/services/warehouse";
import type { TransferListItem } from "@/types/warehouse.types";

export function TransferDetailClient() {
  const params = useParams<{ transferId: string }>();
  const [transfer, setTransfer] = useState<TransferListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrorMessage(null);
    warehouseService
      .getTransfer(params.transferId)
      .then((item) => {
        if (!active) return;
        setTransfer(item);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setTransfer(null);
        const axiosMsg =
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data
            ? String((err.response.data as { message?: string }).message ?? "")
            : "";
        setErrorMessage(
          axiosMsg ||
            (err instanceof Error ? err.message : null) ||
            `${params.transferId} does not exist in the transfer registry.`,
        );
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [params.transferId]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-[#64748B]">
        Loading transfer...
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-semibold text-[#1A1A1A]">
          Transfer not found
        </p>
        <p className="mt-1 max-w-md text-sm text-[#64748B]">
          {errorMessage ??
            `${params.transferId} does not exist in the transfer registry.`}
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
