"use client";

import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  LayoutDashboard,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { formatTransferDateTime } from "@/mock/transfers";
import type { TransferWorkflowResult } from "@/types/warehouse.types";
import { ROUTES } from "@/constants/routes";

interface TransferSuccessPageProps {
  result: TransferWorkflowResult;
  onReset: () => void;
}

export function TransferSuccessPage({
  result,
  onReset,
}: TransferSuccessPageProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex size-20 items-center justify-center rounded-full bg-green-100"
      >
        <CheckCircle2 className="size-10 text-green-600" />
      </motion.div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="mt-6 space-y-2"
      >
        <h2 className="text-2xl font-bold text-[#1A1A1A]">
          Transfer Created Successfully
        </h2>
        <p className="text-sm text-[#64748B]">
          Step 5/5: Confirmation Complete
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="mt-8 w-full overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Transfer ID
            </p>
            <p className="text-primary mt-1 text-lg font-bold">
              {result.transferId}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Status
            </p>
            <span className="mt-1 inline-flex rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold tracking-wider text-orange-600 uppercase">
              Pending Dispatch
            </span>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Vehicle Number
            </p>
            <p className="mt-1 font-bold text-[#1A1A1A]">
              {result.vehicleNumber}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Assigned Driver
            </p>
            <p className="mt-1 font-bold text-[#1A1A1A]">{result.driverName}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Destination
            </p>
            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
              {result.destinationHub}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Material & Quantity
            </p>
            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
              {result.material} — {result.quantity.toLocaleString("en-IN")}{" "}
              {result.unit}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-right">
          <p className="text-xs text-[#64748B]">
            Date Created: {formatTransferDateTime(result.createdAt)}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="mt-6 w-full space-y-3"
      >
        <Button
          className="h-11 w-full gap-2"
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch`} />}
        >
          Go to Dispatch Control
          <ArrowRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="h-11 w-full gap-2 border-gray-200"
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers`} />}
        >
          <ExternalLink className="size-4" />
          Open Transfer Management
        </Button>
        <Button
          variant="ghost"
          className="h-11 w-full gap-2 text-[#64748B]"
          render={
            <Link href={`${ROUTES.CENTRAL_WAREHOUSE}`} onClick={onReset} />
          }
        >
          <LayoutDashboard className="size-4" />
          Back to Dashboard
        </Button>
      </motion.div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-[#64748B]">
        <Truck className="size-3.5" />
        Inventory remains reserved until dispatch is confirmed.
      </p>
    </div>
  );
}
