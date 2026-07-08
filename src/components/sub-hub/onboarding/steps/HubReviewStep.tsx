"use client";

import {
  Boxes,
  Building2,
  CheckCircle2,
  MapPinned,
  Pencil,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { hubTypeLabel } from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { cn } from "@/lib/utils";

interface HubReviewStepProps {
  onEditStep: (step: number) => void;
}

export function HubReviewStep({ onEditStep }: HubReviewStepProps) {
  const { control } = useFormContext<HubFormSchema>();
  const basic = useWatch({ control, name: "basic" });
  const inventory = useWatch({ control, name: "inventory" });
  const warehouse = useWatch({ control, name: "warehouse" });
  const manager = useWatch({ control, name: "manager" });
  const fleet = useWatch({ control, name: "fleet" });
  const coverage = useWatch({ control, name: "coverage" });

  const selectedSkus =
    inventory?.skus?.filter((sku) => sku.selected).length ?? 0;

  const readiness = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!basic?.hubName?.trim()) errors.push("Hub name missing");
    if (!basic?.detailedAddress?.trim()) errors.push("Address missing");
    if (!warehouse?.warehouseId) errors.push("Warehouse not selected");
    if (!manager?.fullName?.trim()) errors.push("Manager not assigned");
    if (!manager?.credentialsGenerated)
      errors.push("Credentials not generated");
    if (selectedSkus === 0) errors.push("No inventory SKUs selected");
    if (!(fleet?.drivers?.length > 0)) errors.push("No drivers assigned");
    if (!(fleet?.vehicles?.length > 0)) errors.push("No vehicles assigned");
    if (!(coverage?.radiusKm > 0)) errors.push("Service area missing");
    if ((coverage?.conflictPercent ?? 0) > 5) {
      warnings.push(
        `${coverage?.conflictPercent}% overlap with ${coverage?.conflictHubName}`,
      );
    }

    const score = Math.max(0, 100 - errors.length * 12 - warnings.length * 4);

    return { errors, warnings, score };
  }, [basic, warehouse, manager, fleet, coverage, selectedSkus]);

  const cards = [
    {
      step: 1,
      title: "Basic Info",
      icon: Building2,
      lines: [
        basic?.hubName || "Untitled hub",
        `${basic?.city || "—"}, ${basic?.state || "—"}`,
        hubTypeLabel(basic?.hubType ?? "distribution-center"),
      ],
    },
    {
      step: 3,
      title: "Warehouse",
      icon: Warehouse,
      lines: [
        warehouse?.warehouseName || "—",
        `Distance: ${warehouse?.distanceKm ?? 0} km`,
        warehouse?.autoRestocking
          ? "• Auto-restock enabled"
          : "• Manual restock",
      ],
    },
    {
      step: 2,
      title: "Inventory",
      icon: Boxes,
      lines: [
        `${selectedSkus} SKUs Mapped`,
        `Sync Frequency: 5 Mins`,
        `Auto-reorder Level: ${warehouse?.restockThresholdPercent ?? 20}%`,
      ],
    },
    {
      step: 4,
      title: "Hub Manager",
      icon: UserRound,
      lines: [
        manager?.fullName || "Pending",
        manager?.employeeId || "—",
        manager?.email || "—",
      ],
      avatar: (manager?.fullName || "NA")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    },
    {
      step: 5,
      title: "Fleet Setup",
      icon: Truck,
      lines: [
        `${fleet?.vehicles?.length ?? 0} Vehicles Linked`,
        `${fleet?.drivers?.length ?? 0} Drivers · ${fleet?.deliverySlots?.length ?? 0} Shifts`,
        "Fuel Card Integration: Active",
      ],
    },
    {
      step: 6,
      title: "Coverage",
      icon: MapPinned,
      lines: [
        `${basic?.city || "Service Area"}`,
        `Radius: ${coverage?.radiusKm ?? 0}km`,
        `${coverage?.estimatedCustomers?.toLocaleString("en-IN") ?? 0} Est. Customers`,
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Review Hub Configuration
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Finalize your warehouse settings and operational logistics before
            launching.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
            readiness.errors.length === 0
              ? "bg-orange-50 text-[#9A3412]"
              : "bg-rose-50 text-rose-700",
          )}
        >
          <CheckCircle2 className="size-4" />
          {readiness.errors.length === 0
            ? "Pre-Validation Passed"
            : "Validation Issues Found"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-orange-50">
                    {"avatar" in card && card.avatar ? (
                      <span className="text-primary text-xs font-bold">
                        {card.avatar}
                      </span>
                    ) : (
                      <Icon className="text-primary size-4" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">
                    {card.title}
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary h-8 gap-1 px-2"
                  onClick={() => onEditStep(card.step)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                {card.lines.map((line) => (
                  <p
                    key={line}
                    className="first:font-semibold first:text-[#1A1A1A]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A1A]">
              Configuration Readiness · {readiness.score}%
            </p>
            <p className="text-sm text-gray-600">
              {readiness.errors.length === 0
                ? "All required fields have been validated for system compatibility."
                : readiness.errors.join(" · ")}
            </p>
            {readiness.warnings.length > 0 ? (
              <p className="mt-1 text-sm text-amber-700">
                Warnings: {readiness.warnings.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs tracking-wider text-gray-500 uppercase">
              Errors
            </p>
            <p className="text-lg font-bold text-[#1A1A1A]">
              {readiness.errors.length}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-wider text-gray-500 uppercase">
              Warnings
            </p>
            <p className="text-lg font-bold text-[#1A1A1A]">
              {readiness.warnings.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
