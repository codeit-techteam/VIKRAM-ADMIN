"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { createAllocationFormSchema } from "@/components/allocation/allocation.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatAllocationQuantity,
  getMaterialAvailableForAllocation,
  WAREHOUSE_SOURCE_OPTIONS,
} from "@/mock/allocations";
import type { MaterialAllocationItem } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface AllocationFormProps {
  item: MaterialAllocationItem;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    warehouseSourceId: string;
    allocationQty: number;
    remarks?: string;
  }) => void;
}

export function AllocationForm({
  item,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: AllocationFormProps) {
  const remainingQty = item.requestedQty - item.allocatedQty;
  const defaultWarehouseId = WAREHOUSE_SOURCE_OPTIONS[0].id;
  const unit = item.unit;

  const form = useForm({
    defaultValues: {
      warehouseSourceId: defaultWarehouseId,
      allocationQty: 0,
      remarks: "",
    },
    mode: "onChange",
  });

  const warehouseSourceId = form.watch("warehouseSourceId");
  const allocationQty = form.watch("allocationQty");

  const warehouseStock = useMemo(
    () =>
      getMaterialAvailableForAllocation(
        item.materialId,
        warehouseSourceId,
        item.id,
      ),
    [item.materialId, item.id, warehouseSourceId],
  );

  const currentMaxAvailable = warehouseStock?.available ?? 0;
  const displayUnit = warehouseStock?.unit ?? unit;
  const isInsufficientStock = currentMaxAvailable === 0;

  const validationSchema = useMemo(
    () =>
      createAllocationFormSchema(
        currentMaxAvailable,
        remainingQty,
        displayUnit,
      ),
    [currentMaxAvailable, remainingQty, displayUnit],
  );

  useEffect(() => {
    const defaultQty = Math.min(remainingQty, currentMaxAvailable);
    form.reset({
      warehouseSourceId,
      allocationQty: defaultQty > 0 ? defaultQty : 0,
      remarks: form.getValues("remarks"),
    });
  }, [item.id, form, warehouseSourceId, currentMaxAvailable, remainingQty]);

  useEffect(() => {
    const values = form.getValues();
    const result = validationSchema.safeParse(values);

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
  }, [allocationQty, validationSchema, form]);

  const handleSubmit = form.handleSubmit((values) => {
    const result = validationSchema.safeParse(values);
    if (!result.success) {
      const qtyIssue = result.error.issues.find(
        (issue) => issue.path[0] === "allocationQty",
      );
      if (qtyIssue) {
        form.setError("allocationQty", { message: qtyIssue.message });
      }
      return;
    }

    onSubmit(result.data);
  });

  const qtyError = form.formState.errors.allocationQty?.message;
  const showMaxReached =
    !qtyError &&
    allocationQty > 0 &&
    allocationQty >= currentMaxAvailable &&
    currentMaxAvailable < remainingQty;

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="space-y-2">
          <Label
            htmlFor="warehouse-source"
            className="text-sm font-medium text-[#1A1A1A]"
          >
            Warehouse Source
          </Label>
          <Controller
            control={form.control}
            name="warehouseSourceId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="warehouse-source"
                  className="h-10 w-full rounded-xl border-gray-200 bg-white"
                >
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_SOURCE_OPTIONS.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="allocation-qty"
            className="text-sm font-medium text-[#1A1A1A]"
          >
            Allocation Quantity
          </Label>
          <div className="relative">
            <Controller
              control={form.control}
              name="allocationQty"
              render={({ field }) => (
                <Input
                  id="allocation-qty"
                  type="number"
                  min={0}
                  step={1}
                  value={field.value || ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                  className={cn(
                    "h-10 rounded-xl border-gray-200 pr-24",
                    qtyError && "border-red-300 focus-visible:ring-red-200",
                  )}
                  disabled={isInsufficientStock || isSubmitting}
                />
              )}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              {displayUnit}
            </span>
          </div>
          {isInsufficientStock ? (
            <p className="text-sm text-red-600">Insufficient Stock</p>
          ) : qtyError ? (
            <p className="text-sm text-red-600">{qtyError}</p>
          ) : showMaxReached ? (
            <p className="text-sm text-red-600">
              Max available quantity reached from this source.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="allocation-remarks"
            className="text-sm font-medium text-[#1A1A1A]"
          >
            Allocation Remarks
          </Label>
          <Controller
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <Textarea
                id="allocation-remarks"
                value={field.value}
                onChange={field.onChange}
                placeholder="Add any dispatch instructions..."
                className="min-h-28 resize-none rounded-xl border-gray-200 bg-white"
                disabled={isSubmitting}
              />
            )}
          />
          <p className="text-xs text-[#64748B]">Optional</p>
        </div>

        {warehouseStock ? (
          <p className="text-xs text-[#64748B]">
            Available at selected warehouse:{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {formatAllocationQuantity(
                warehouseStock.available,
                warehouseStock.unit,
              )}
            </span>
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10"
            disabled={
              isSubmitting ||
              isInsufficientStock ||
              allocationQty <= 0 ||
              Boolean(qtyError)
            }
          >
            Confirm Allocation
          </Button>
        </div>
      </div>
    </form>
  );
}
