"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { createAllocationFormSchema } from "@/components/allocation/allocation.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getMaterialBatches,
  getWorkflowWarehouses,
} from "@/mock/allocation-workflow";
import type {
  AllocationWorkflowFormValues,
  RequisitionListItem,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface WorkflowAllocationFormProps {
  requisition: RequisitionListItem;
  formValues: AllocationWorkflowFormValues;
  inventory: import("@/types/inventory.types").InventoryItem[];
  onChange: (values: Partial<AllocationWorkflowFormValues>) => void;
}

export function WorkflowAllocationForm({
  requisition,
  formValues,
  inventory,
  onChange,
}: WorkflowAllocationFormProps) {
  const warehouses = useMemo(
    () =>
      getWorkflowWarehouses(
        requisition.materialId,
        requisition.requestedQty,
        inventory,
      ),
    [requisition, inventory],
  );

  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === formValues.warehouseSourceId,
  );

  const batches = useMemo(
    () =>
      formValues.warehouseSourceId
        ? getMaterialBatches(
            requisition.materialId,
            formValues.warehouseSourceId,
            inventory,
          )
        : [],
    [requisition.materialId, formValues.warehouseSourceId, inventory],
  );

  const selectedBatch = batches.find(
    (batch) => batch.id === formValues.batchId,
  );

  const maxAvailable = Math.min(
    selectedWarehouse?.stock ?? 0,
    selectedBatch?.available ?? selectedWarehouse?.stock ?? 0,
  );

  const validationSchema = useMemo(
    () =>
      createAllocationFormSchema(
        maxAvailable,
        requisition.requestedQty,
        requisition.unit,
      ),
    [maxAvailable, requisition.requestedQty, requisition.unit],
  );

  const form = useForm({
    defaultValues: formValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(formValues);
  }, [form, formValues]);

  const allocationQty = form.watch("allocationQty");

  useEffect(() => {
    const result = validationSchema.safeParse(formValues);
    if (!result.success) {
      const qtyIssue = result.error.issues.find(
        (issue) => issue.path[0] === "allocationQty",
      );
      if (qtyIssue) {
        form.setError("allocationQty", { message: qtyIssue.message });
      }
    } else {
      form.clearErrors("allocationQty");
    }
  }, [allocationQty, formValues, validationSchema, form]);

  const qtyError = form.formState.errors.allocationQty?.message;

  return (
    <div className="space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-[#1A1A1A]">Allocation Details</h3>
        <p className="mt-1 text-sm text-[#64748B]">
          Specify warehouse source, batch, and allocation quantity.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Select Warehouse
        </Label>
        <Select
          value={formValues.warehouseSourceId}
          onValueChange={(value) => {
            if (!value) return;
            const warehouseBatches = getMaterialBatches(
              requisition.materialId,
              value,
              inventory,
            );
            onChange({
              warehouseSourceId: value,
              batchId: warehouseBatches[0]?.id ?? "",
              allocationQty: Math.min(
                requisition.requestedQty,
                warehouses.find((entry) => entry.id === value)?.stock ?? 0,
                warehouseBatches[0]?.available ?? 0,
              ),
            });
          }}
        >
          <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white">
            <SelectValue placeholder="Select warehouse" />
          </SelectTrigger>
          <SelectContent>
            {warehouses
              .filter((warehouse) => warehouse.status !== "EMPTY")
              .map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Allocation Quantity
        </Label>
        <div className="relative">
          <Controller
            control={form.control}
            name="allocationQty"
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                step={1}
                value={field.value || ""}
                onChange={(event) => {
                  const value =
                    event.target.value === "" ? 0 : Number(event.target.value);
                  field.onChange(value);
                  onChange({ allocationQty: value });
                }}
                className={cn(
                  "h-11 rounded-xl border-gray-200 pr-20",
                  qtyError && "border-red-300 focus-visible:ring-red-200",
                )}
              />
            )}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {requisition.unit}
          </span>
        </div>
        {qtyError ? <p className="text-sm text-red-600">{qtyError}</p> : null}
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Select Batch
        </Label>
        <Select
          value={formValues.batchId}
          onValueChange={(value) => {
            if (value) onChange({ batchId: value });
          }}
          disabled={batches.length === 0}
        >
          <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white">
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.label} (Available:{" "}
                {batch.available.toLocaleString("en-IN")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedBatch?.clearanceNote ? (
          <p className="text-xs text-[#64748B]">
            {selectedBatch.clearanceNote}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Remarks
        </Label>
        <Textarea
          value={formValues.remarks}
          onChange={(event) => onChange({ remarks: event.target.value })}
          placeholder="Add any specific instructions for the warehouse team..."
          className="min-h-28 resize-none rounded-xl border-gray-200 bg-white"
        />
      </div>
    </div>
  );
}

export function useAllocationFormValidation(
  requisition: RequisitionListItem,
  formValues: AllocationWorkflowFormValues,
  inventory: import("@/types/inventory.types").InventoryItem[],
): { isValid: boolean; error?: string } {
  const warehouses = getWorkflowWarehouses(
    requisition.materialId,
    requisition.requestedQty,
    inventory,
  );
  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === formValues.warehouseSourceId,
  );
  const batches = formValues.warehouseSourceId
    ? getMaterialBatches(
        requisition.materialId,
        formValues.warehouseSourceId,
        inventory,
      )
    : [];
  const selectedBatch = batches.find(
    (batch) => batch.id === formValues.batchId,
  );
  const maxAvailable = Math.min(
    selectedWarehouse?.stock ?? 0,
    selectedBatch?.available ?? selectedWarehouse?.stock ?? 0,
  );

  const schema = createAllocationFormSchema(
    maxAvailable,
    requisition.requestedQty,
    requisition.unit,
  );
  const result = schema.safeParse(formValues);

  if (!result.success) {
    const issue = result.error.issues[0];
    return { isValid: false, error: issue?.message };
  }

  return { isValid: true };
}
