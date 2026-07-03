import { z } from "zod";

export function createAllocationFormSchema(
  maxAvailable: number,
  maxRequested: number,
  unit: string,
) {
  return z.object({
    warehouseSourceId: z.string().min(1, "Please select a warehouse source."),
    allocationQty: z
      .number({
        error: "Allocation quantity is required.",
      })
      .positive("Allocation quantity must be greater than zero.")
      .max(
        maxAvailable,
        maxAvailable === 0
          ? "Insufficient Stock"
          : `Maximum allocation allowed is ${maxAvailable.toLocaleString("en-IN")} ${unit}.`,
      )
      .max(
        maxRequested,
        `Cannot exceed requested quantity of ${maxRequested.toLocaleString("en-IN")} ${unit}.`,
      ),
    remarks: z.string().optional(),
  });
}

export type AllocationFormSchema = z.infer<
  ReturnType<typeof createAllocationFormSchema>
>;
