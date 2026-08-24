"use client";

import { Download, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  HubOrderExportFormat,
  HubOrderFilters,
} from "@/types/hub-orders.types";
import { cn } from "@/lib/utils";

interface HubOrderFiltersBarProps {
  filters: HubOrderFilters;
  onChange: (next: Partial<HubOrderFilters>) => void;
  onApply: () => void;
  onClear: () => void;
  onExport: (format: HubOrderExportFormat) => void;
  exporting?: boolean;
  className?: string;
}

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "all", label: "All Methods" },
  { value: "Cash", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "Advance", label: "Advance" },
  { value: "Credit 15 Days", label: "Credit 15 Days" },
  { value: "Credit 30 Days", label: "Credit 30 Days" },
  { value: "Credit 45 Days", label: "Credit 45 Days" },
  { value: "Credit 60 Days", label: "Credit 60 Days" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED_BY_HUB", label: "Accepted" },
  { value: "PACKED", label: "Packed" },
  { value: "READY_FOR_DISPATCH", label: "Ready" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All Payment Status" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "COLLECTED", label: "Collected" },
  { value: "FAILED", label: "Failed" },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "Individual", label: "Individual" },
  { value: "Contractor", label: "Contractor" },
  { value: "Builder", label: "Builder" },
  { value: "Dealer", label: "Dealer" },
  { value: "Architect", label: "Architect" },
];

function hasActiveFilters(filters: HubOrderFilters): boolean {
  return (
    filters.dateRange !== "" ||
    filters.fromDate.length > 0 ||
    filters.toDate.length > 0 ||
    filters.paymentMethod !== "all" ||
    filters.orderStatus !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.customerType !== "all" ||
    filters.search.trim().length > 0
  );
}

export function HubOrderFiltersBar({
  filters,
  onChange,
  onApply,
  onClear,
  onExport,
  exporting,
  className,
}: HubOrderFiltersBarProps) {
  const active = hasActiveFilters(filters);

  return (
    <div
      className={cn(
        "sticky top-0 z-20 space-y-3 rounded-xl border border-gray-100 bg-white/95 p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onApply()}
            placeholder="Search customer, order ID, phone, invoice…"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onApply}>
            Apply Filters
          </Button>
          {active ? (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="mr-1 size-3.5" />
              Clear
            </Button>
          ) : null}
          <Select
            onValueChange={(value) =>
              onExport((value ?? "csv") as HubOrderExportFormat)
            }
          >
            <SelectTrigger className="h-9 w-[130px]" disabled={exporting}>
              <Download className="mr-1.5 size-3.5" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-[#94A3B8] uppercase">
          Filters:
        </span>

        <Select
          value={filters.dateRange || "all"}
          onValueChange={(value) =>
            onChange({
              dateRange:
                value === "all" ? "" : (value as HubOrderFilters["dateRange"]),
            })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters.dateRange === "custom" ? (
          <>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onChange({ fromDate: e.target.value })}
              className="h-9 w-[150px]"
            />
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => onChange({ toDate: e.target.value })}
              className="h-9 w-[150px]"
            />
          </>
        ) : null}

        <Select
          value={filters.paymentMethod}
          onValueChange={(value) => onChange({ paymentMethod: value ?? "all" })}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.orderStatus}
          onValueChange={(value) => onChange({ orderStatus: value ?? "all" })}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.paymentStatus}
          onValueChange={(value) => onChange({ paymentStatus: value ?? "all" })}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.customerType}
          onValueChange={(value) => onChange({ customerType: value ?? "all" })}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Customer Type" />
          </SelectTrigger>
          <SelectContent>
            {CUSTOMER_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
