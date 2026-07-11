"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FINANCE_CUSTOMERS,
  FINANCE_EXECUTIVES,
  FINANCE_HUBS,
} from "@/features/finance/mock/seed";
import type { FinancePaymentFilters } from "@/features/finance/types";
import { cn } from "@/lib/utils";

interface FinanceFilterBarProps {
  draftFilters: FinancePaymentFilters;
  onDraftChange: (filters: FinancePaymentFilters) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export function FinanceFilterBar({
  draftFilters,
  onDraftChange,
  onApply,
  onReset,
  className,
}: FinanceFilterBarProps) {
  const update = (patch: Partial<FinancePaymentFilters>) => {
    onDraftChange({ ...draftFilters, ...patch, quickFilter: null });
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-[#F8F9FB] p-4 shadow-sm",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2 xl:col-span-2">
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Search
          </label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={draftFilters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Customer, Order ID, or Invoice Number..."
              className="h-10 border-gray-200 bg-white pl-9 text-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Status
          </label>
          <Select
            value={draftFilters.status}
            onValueChange={(v) =>
              v && update({ status: v as FinancePaymentFilters["status"] })
            }
          >
            <SelectTrigger className="h-10 border-gray-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Hub
          </label>
          <Select
            value={draftFilters.hubId}
            onValueChange={(v) => v && update({ hubId: v })}
          >
            <SelectTrigger className="h-10 border-gray-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Hubs</SelectItem>
              {FINANCE_HUBS.map((hub) => (
                <SelectItem key={hub.id} value={hub.id}>
                  {hub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Customer
          </label>
          <Select
            value={draftFilters.customerId}
            onValueChange={(v) => v && update({ customerId: v })}
          >
            <SelectTrigger className="h-10 border-gray-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Customers</SelectItem>
              {FINANCE_CUSTOMERS.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Executive
          </label>
          <Select
            value={draftFilters.executiveId}
            onValueChange={(v) => v && update({ executiveId: v })}
          >
            <SelectTrigger className="h-10 border-gray-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Executives</SelectItem>
              {FINANCE_EXECUTIVES.map((exec) => (
                <SelectItem key={exec.id} value={exec.id}>
                  {exec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Invoice Date From
          </label>
          <DatePicker
            value={
              draftFilters.invoiceDateFrom
                ? new Date(draftFilters.invoiceDateFrom)
                : undefined
            }
            onChange={(date) =>
              update({ invoiceDateFrom: date?.toISOString() })
            }
            placeholder="Start date"
            className="h-10 border-gray-200 bg-white text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Invoice Date To
          </label>
          <DatePicker
            value={
              draftFilters.invoiceDateTo
                ? new Date(draftFilters.invoiceDateTo)
                : undefined
            }
            onChange={(date) => update({ invoiceDateTo: date?.toISOString() })}
            placeholder="End date"
            className="h-10 border-gray-200 bg-white text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={onApply}
          className="h-10 bg-[#1A1A2E] px-6 text-white hover:bg-[#1A1A2E]/90"
        >
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-10 border-gray-200"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
