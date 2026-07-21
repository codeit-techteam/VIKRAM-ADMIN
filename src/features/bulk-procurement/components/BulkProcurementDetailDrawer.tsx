"use client";

import { format } from "date-fns";
import {
  Building2,
  ClipboardList,
  MapPin,
  Package,
  StickyNote,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { BulkProcurementStatusBadge } from "@/features/bulk-procurement/components/BulkProcurementStatusBadge";
import type { BulkProcurementRequest } from "@/mock/mockBulkProcurement";
import { formatCurrency } from "@/utils/format-currency";

interface BulkProcurementDetailDrawerProps {
  request: BulkProcurementRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function BulkProcurementDetailDrawer({
  request,
  open,
  onOpenChange,
  isLoading,
}: BulkProcurementDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : request ? (
            <>
              <SheetTitle className="flex items-center gap-2.5 text-xl font-bold text-[#1A1A1A]">
                <Building2 className="text-primary size-5" />
                {request.project}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                {request.company} · {request.customerName}
              </SheetDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <BulkProcurementStatusBadge status={request.status} />
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {formatCurrency(request.expectedOrderValue)}
                </span>
              </div>
            </>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : request ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-4">
                  <p className="flex items-center gap-1 text-xs text-[#64748B]">
                    <MapPin className="size-3" />
                    Location
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                    {request.projectLocation}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-4">
                  <p className="flex items-center gap-1 text-xs text-[#64748B]">
                    <User className="size-3" />
                    Executive
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                    {request.assignedExecutiveName ?? "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <StickyNote className="text-primary size-4" />
                  Notes
                </h4>
                <p className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-4 text-sm text-[#64748B]">
                  {request.notes}
                </p>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <Package className="text-primary size-4" />
                  Material Requirements
                </h4>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F5F6F8]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[#64748B]">
                          Material
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-[#64748B]">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-[#64748B]">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.materials.map((mat) => (
                        <tr key={mat.id} className="border-t border-gray-100">
                          <td className="px-4 py-2.5 text-[#1A1A1A]">
                            {mat.material}
                          </td>
                          <td className="px-4 py-2.5 text-right text-[#64748B]">
                            {mat.quantity} {mat.unit}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-[#1A1A1A]">
                            {formatCurrency(mat.estimatedValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <ClipboardList className="text-primary size-4" />
                  Timeline
                </h4>
                <div className="relative space-y-0">
                  {request.timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-3 pb-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-primary size-2.5 rounded-full" />
                        {index < request.timeline.length - 1 && (
                          <div className="mt-1 w-px flex-1 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {event.title}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {event.description}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {format(new Date(event.date), "dd MMM yyyy, HH:mm")}
                          {event.actor ? ` · ${event.actor}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {request && !isLoading ? (
          <SheetFooter className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
            <Button
              variant="outline"
              className="ml-auto gap-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              Close
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
