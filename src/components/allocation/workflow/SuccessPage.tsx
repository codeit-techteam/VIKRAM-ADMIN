"use client";

import { ArrowLeft, CheckCircle2, MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { formatWorkflowQuantity } from "@/mock/allocation-workflow";
import type { AllocationWorkflowResult } from "@/types/warehouse.types";
import { ROUTES } from "@/constants/routes";

interface SuccessPageProps {
  result: AllocationWorkflowResult;
  onReset: () => void;
}

export function SuccessPage({ result, onReset }: SuccessPageProps) {
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
          Material Allocated Successfully
        </h2>
        <p className="text-sm leading-relaxed text-[#64748B]">
          The inventory has been secured and reserved for the requested
          destination. You can now initiate the transfer or return to the
          dashboard.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="mt-8 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-3">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Allocation Details
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">
            <CheckCircle2 className="size-3" />
            Allocated
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 text-left">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Allocation ID
            </p>
            <p className="mt-1 font-bold text-[#1A1A1A]">
              {result.allocationId}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Request ID
            </p>
            <p className="text-primary mt-1 font-bold">{result.requestId}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Destination
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1A1A1A]">
              <MapPin className="text-primary size-3.5" />
              {result.destinationHub}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Quantity
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1A1A1A]">
              <Package className="text-primary size-3.5" />
              {formatWorkflowQuantity(result.quantity, result.unit)}
            </p>
          </div>
        </div>

        <div className="h-20 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300" />
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="mt-6 w-full space-y-3"
      >
        <Button
          className="h-11 w-full gap-2"
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/new`} />}
        >
          Create Transfer
          <Truck className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="h-11 w-full gap-2 border-gray-200"
          onClick={onReset}
        >
          <ArrowLeft className="size-4" />
          Back to Allocation Center
        </Button>
      </motion.div>

      <p className="mt-6 text-xs text-[#64748B]">
        Need help with this allocation?{" "}
        <button type="button" className="text-primary font-semibold">
          Contact Support
        </button>
      </p>
    </div>
  );
}
