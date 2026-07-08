"use client";

import { AlertCircle, ClipboardList, MapPin, Package } from "lucide-react";

import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  TransferType,
  TransferWorkflowContext,
  TransferWorkflowFormValues,
} from "@/types/warehouse.types";

const TRANSFER_TYPE_OPTIONS: { value: TransferType; label: string }[] = [
  { value: "critical", label: "Critical (Highest Priority)" },
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
];

interface TransferDetailsStepProps {
  transferId: string;
  context: TransferWorkflowContext;
  form: TransferWorkflowFormValues;
  onChange: (values: Partial<TransferWorkflowFormValues>) => void;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date: Date | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export function TransferDetailsStep({
  transferId,
  context,
  form,
  onChange,
}: TransferDetailsStepProps) {
  const isCritical = form.transferType === "critical";

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-primary size-5" />
            <h3 className="font-bold text-[#1A1A1A]">Transfer Summary</h3>
          </div>
          {isCritical ? (
            <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-600 uppercase">
              Critical
            </span>
          ) : null}
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Transfer ID
              </p>
              <p className="mt-1 font-bold text-[#1A1A1A]">{transferId}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Allocation ID
              </p>
              <p className="mt-1 font-bold text-[#1A1A1A]">
                {context.allocationId}
              </p>
            </div>
          </div>

          <div className="relative space-y-0 pl-2">
            <div className="absolute top-3 bottom-3 left-[15px] w-0.5 bg-gray-200" />
            <div className="relative flex gap-3 pb-6">
              <div className="bg-primary relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm">
                <MapPin className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Source
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
                  {context.sourceWarehouse}
                </p>
              </div>
            </div>
            <div className="relative flex gap-3">
              <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                <MapPin className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Destination
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
                  {context.destinationHub}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Material
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                  {context.material}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  SKU
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                  {context.sku}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Quantity
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1A1A1A]">
                  <Package className="text-primary size-3.5" />
                  {context.quantity.toLocaleString("en-IN")} {context.unit}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Est. Weight
                </p>
                <div className="bg-primary/10 mt-1 inline-flex rounded px-2 py-1">
                  <p className="text-primary text-sm font-bold">
                    {context.estimatedWeightKg.toLocaleString("en-IN")} KG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-[#1A1A1A]">Transfer Details</h3>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Define dispatch schedule and logistical priority.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="transfer-type">Transfer Type</Label>
            <Select
              value={form.transferType}
              onValueChange={(value) =>
                onChange({ transferType: value as TransferType })
              }
            >
              <SelectTrigger id="transfer-type" className="w-full">
                <SelectValue placeholder="Select transfer type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSFER_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Request Reference</Label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-[#64748B]">
              {context.requisitionId}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dispatch Date</Label>
              <DatePicker
                value={parseDate(form.dispatchDate)}
                onChange={(date) =>
                  onChange({ dispatchDate: formatDateValue(date) })
                }
                placeholder="Select dispatch date"
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Arrival</Label>
              <DatePicker
                value={parseDate(form.expectedArrival)}
                onChange={(date) =>
                  onChange({ expectedArrival: formatDateValue(date) })
                }
                placeholder="Select arrival date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logistics-remarks">Logistics Remarks</Label>
            <Textarea
              id="logistics-remarks"
              value={form.logisticsRemarks}
              onChange={(event) =>
                onChange({ logisticsRemarks: event.target.value })
              }
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/80 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-blue-600" />
            <p className="text-xs leading-relaxed text-blue-800">
              Auto-calculating ETA based on current route traffic and warehouse
              loading average for{" "}
              {(context.estimatedWeightKg / 1000).toFixed(1)}MT load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
