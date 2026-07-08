"use client";

import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { estimateTripTimeHours } from "@/mock/transfer-workflow";
import type {
  FleetDriver,
  FleetVehicle,
  TransferWorkflowContext,
  TransferWorkflowFormValues,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const CHECKLIST_ITEMS = [
  "Vehicle Assigned",
  "Driver Assigned",
  "Inventory Reserved",
  "Ready for Dispatch",
] as const;

interface TransferReviewStepProps {
  transferId: string;
  context: TransferWorkflowContext;
  form: TransferWorkflowFormValues;
  vehicles: FleetVehicle[];
  drivers: FleetDriver[];
  isSubmitting?: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

function formatArrivalSchedule(expectedArrival: string): string {
  const date = new Date(expectedArrival);
  date.setHours(18, 30, 0, 0);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function TransferReviewStep({
  transferId,
  context,
  form,
  vehicles,
  drivers,
  isSubmitting = false,
  onConfirm,
  onBack,
}: TransferReviewStepProps) {
  const vehicle = vehicles.find((entry) => entry.id === form.vehicleId);
  const driver = drivers.find((entry) => entry.id === form.driverId);
  const tripHours = estimateTripTimeHours(
    context.sourceWarehouse,
    context.destinationHub,
  );

  const summaryFields = [
    {
      label: "Source Warehouse",
      value: context.sourceWarehouse,
    },
    {
      label: "Destination Hub",
      value: context.destinationHub,
    },
    {
      label: "Arrival Schedule",
      value: formatArrivalSchedule(form.expectedArrival),
    },
    {
      label: "Vehicle Details",
      value: vehicle
        ? `${vehicle.vehicleType} (${vehicle.vehicleNumber})`
        : "—",
      sub: vehicle ? `Fleet ID: ${vehicle.id.toUpperCase()}` : undefined,
    },
    {
      label: "Assigned Driver",
      value: driver?.name ?? "—",
      sub: driver ? `License ID: ${driver.employeeId}` : undefined,
    },
    {
      label: "Route Distance",
      value: `42 KM (Est. ${tripHours}h)`,
    },
    {
      label: "Material Type",
      value: context.material,
    },
    {
      label: "SKU / QTY",
      value: `${context.sku} | ${context.quantity.toLocaleString("en-IN")} ${context.unit}`,
    },
    {
      label: "Total Payload",
      value: `${context.estimatedWeightKg.toLocaleString("en-IN")} KG (${(context.estimatedWeightKg / 1000).toFixed(1)} Metric Tonnes)`,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-[#1A1A1A]">Transfer Summary</h3>
                <p className="mt-0.5 text-sm text-[#64748B]">
                  Review technical dispatch parameters before final
                  confirmation.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                ID: {transferId}
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {summaryFields.map((field) => (
              <div key={field.label}>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  {field.label}
                </p>
                <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                  {field.value}
                </p>
                {field.sub ? (
                  <p className="mt-0.5 text-xs text-[#64748B]">{field.sub}</p>
                ) : null}
              </div>
            ))}
          </div>

          {form.logisticsRemarks ? (
            <div className="border-t border-gray-100 px-5 py-4">
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Dispatch Remarks
              </p>
              <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-sm leading-relaxed text-[#64748B]">
                {form.logisticsRemarks}
              </div>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-bold text-[#1A1A1A]">Operational Checklist</h3>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {CHECKLIST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50/50 px-4 py-3"
              >
                <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border-2 border-orange-200 bg-orange-50/50 p-5">
          <p className="text-sm leading-relaxed text-[#1A1A1A]">
            <span className="font-bold">Final Confirmation:</span> Once
            confirmed this transfer will move inventory to Dispatch Queue. This
            action triggers ERP record locking and generates the Gate Pass
            (Form-12).
          </p>
        </div>

        <Button
          type="button"
          className="h-11 w-full gap-2"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Confirming..." : "Confirm Transfer"}
          <ArrowRight className="size-4" />
        </Button>

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-primary w-full text-sm font-semibold hover:underline disabled:opacity-50"
        >
          ← Back to Driver
        </button>

        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-red-600 hover:underline",
          )}
          disabled={isSubmitting}
        >
          <AlertTriangle className="size-3.5" />
          Abort Transfer Request
        </button>
      </div>
    </div>
  );
}
