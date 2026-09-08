"use client";

import { Check, MapPin, Phone, Search, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { initiateCall } from "@/features/customer-executive/utils/communication";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import type { CeOrder, TrackingStep } from "@/features/customer-executive/types";
import { notify } from "@/utils/notify";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

const TRACKING_STEPS: { key: TrackingStep; label: string }[] = [
  { key: "ORDER_CREATED", label: "Order Created" },
  { key: "PAYMENT_RECEIVED", label: "Confirmed" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PACKED", label: "Packed" },
  { key: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const STEP_ORDER = TRACKING_STEPS.map((s) => s.key);

function getStepIndex(step: TrackingStep): number {
  const index = STEP_ORDER.indexOf(step);
  if (index >= 0) return index;
  if (step === "IN_TRANSIT" || step === "DISPATCHED" || step === "LOADED") {
    return STEP_ORDER.indexOf("OUT_FOR_DELIVERY");
  }
  return -1;
}

export function CeTrackingPage() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") ?? "";

  const orders = useCustomerExecutiveStore((s) => s.orders);
  const searchTracking = useCustomerExecutiveStore((s) => s.searchTracking);
  const loadOrderDetailFromApi = useCustomerExecutiveStore(
    (s) => s.loadOrderDetailFromApi,
  );

  const [searchQuery, setSearchQuery] = useState(initialOrder);
  const [selectedOrder, setSelectedOrder] = useState<CeOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        notify.error("Enter a search term");
        return;
      }

      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchTracking(query.trim());
        if (results.length === 0) {
          setSelectedOrder(null);
          notify.error("Order not found", "Check the order ID, phone, or name");
          return;
        }
        setSelectedOrder(results[0]);
        notify.success("Order found", results[0].orderNumber);
      } catch (error) {
        setSelectedOrder(null);
        const message =
          error instanceof Error ? error.message : "Tracking search failed";
        setSearchError(message);
        notify.error("Search failed", message);
      } finally {
        setIsSearching(false);
      }
    },
    [searchTracking],
  );

  useEffect(() => {
    if (initialOrder) {
      setSearchQuery(initialOrder);
      void handleSearch(initialOrder);
    }
  }, [initialOrder, handleSearch]);

  const liveOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find((o) => o.id === selectedOrder.id) ?? selectedOrder;
  }, [selectedOrder, orders]);

  useEffect(() => {
    if (!liveOrder?.id) return;
    void loadOrderDetailFromApi(liveOrder.id);
  }, [liveOrder?.id, loadOrderDetailFromApi]);

  const currentStepIndex = liveOrder
    ? getStepIndex(liveOrder.trackingStep)
    : -1;

  const driverName = liveOrder?.driverName;
  const driverPhone = liveOrder?.driverPhone;
  const vehicleNumber = liveOrder?.vehicleNumber;
  const hubName = liveOrder?.hubName;
  const hubCode = liveOrder?.hubCode;

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        { label: "Tracking" },
      ]}
      title="Logistics Command Center"
      subtitle="Real-time order tracking and delivery status."
    >
      <Card>
        <CardContent className="flex gap-2 p-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Customer Mobile, or Name..."
            className="flex-1"
            onKeyDown={(e) =>
              e.key === "Enter" && void handleSearch(searchQuery)
            }
          />
          <Button
            onClick={() => void handleSearch(searchQuery)}
            disabled={isSearching}
          >
            <Search className="size-4" />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>

      {searchError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{searchError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => void handleSearch(searchQuery)}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {liveOrder ? (
        <div className="space-y-5">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-orange-50">
                  <Truck className="text-primary size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-lg font-bold">
                      #{liveOrder.orderNumber}
                    </span>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Tracking
                    </Badge>
                    <CeStatusBadge
                      status={liveOrder.status}
                      label={liveOrder.statusLabel}
                    />
                  </div>
                  <p className="font-semibold">{liveOrder.company}</p>
                  <p className="text-sm text-[#64748B]">
                    {liveOrder.customerName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#64748B]">Expected Delivery</p>
                <p className="text-primary text-lg font-bold">
                  {liveOrder.expectedDelivery
                    ? formatDate(liveOrder.expectedDelivery)
                    : (liveOrder.eta ?? "—")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="overflow-x-auto p-6">
              <div className="flex min-w-[700px] items-center justify-between">
                {TRACKING_STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                            isCompleted
                              ? "bg-[#1A1A1A] text-white"
                              : isCurrent
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-500",
                          )}
                        >
                          {isCompleted ? (
                            <Check className="size-4" />
                          ) : isCurrent ? (
                            <Truck className="size-3.5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <p
                          className={cn(
                            "mt-2 max-w-[80px] text-center text-[10px] leading-tight",
                            isCurrent
                              ? "text-primary font-semibold"
                              : "text-[#64748B]",
                          )}
                        >
                          {step.label}
                        </p>
                      </div>
                      {index < TRACKING_STEPS.length - 1 && (
                        <div
                          className={cn(
                            "mx-1 h-0.5 flex-1",
                            index < currentStepIndex
                              ? "bg-primary"
                              : "bg-gray-200",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Logistics Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-xs text-[#64748B]">Current Status</p>
                    <p className="font-medium">
                      {liveOrder.statusLabel ??
                        liveOrder.trackingStep.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Order Age</p>
                    <p className="font-medium">
                      {liveOrder.orderAgeHours != null
                        ? `${liveOrder.orderAgeHours} hrs`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Last Updated</p>
                    <p className="font-medium">
                      {liveOrder.lastUpdated
                        ? formatDate(liveOrder.lastUpdated)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Expected Delivery</p>
                    <p className="font-medium">
                      {liveOrder.expectedDelivery
                        ? formatDate(liveOrder.expectedDelivery)
                        : "—"}
                    </p>
                  </div>
                </div>

                {driverName ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{driverName}</p>
                      <p className="text-sm text-[#64748B]">Driver</p>
                    </div>
                    {driverPhone ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => initiateCall(driverPhone, driverName)}
                      >
                        <Phone className="size-4" />
                        Call Driver
                      </Button>
                    ) : null}
                  </div>
                ) : null}
                {vehicleNumber ? (
                  <div>
                    <p className="text-sm text-[#64748B]">Vehicle</p>
                    <p className="font-medium">{vehicleNumber}</p>
                  </div>
                ) : null}
                {hubName ? (
                  <div>
                    <p className="text-sm text-[#64748B]">Fulfillment Hub</p>
                    <p className="font-medium">
                      {hubName}
                      {hubCode ? ` (${hubCode})` : ""}
                    </p>
                  </div>
                ) : null}
                {liveOrder.managerName ? (
                  <div>
                    <p className="text-sm text-[#64748B]">Hub Manager</p>
                    <p className="font-medium">{liveOrder.managerName}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-[#64748B]">Delivery Address</p>
                  <p className="font-medium">{liveOrder.deliveryAddress}</p>
                  <p className="text-sm text-[#64748B]">
                    PIN: {liveOrder.deliveryPincode}
                  </p>
                </div>

                {liveOrder.timeline && liveOrder.timeline.length > 0 ? (
                  <div>
                    <p className="mb-2 text-sm font-medium">Timeline</p>
                    <ol className="max-h-48 space-y-2 overflow-y-auto">
                      {liveOrder.timeline.map((entry, index) => (
                        <li
                          key={
                            entry.id ??
                            `${entry.status}-${entry.createdAt}-${index}`
                          }
                          className="border-b border-gray-50 pb-2 last:border-0"
                        >
                          <p className="text-sm font-medium">
                            {entry.statusLabel ??
                              entry.status?.replaceAll("_", " ") ??
                              "Update"}
                          </p>
                          {entry.message ? (
                            <p className="text-xs text-[#64748B]">
                              {entry.message}
                            </p>
                          ) : null}
                          {entry.createdAt ? (
                            <p className="text-[11px] text-gray-400">
                              {formatDate(entry.createdAt)}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                <CeStatusBadge
                  status={liveOrder.status}
                  label={liveOrder.statusLabel}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[#64748B]">
                  Live GPS is not available for this shipment. Status below is
                  taken from the order timeline.
                </p>
                <div>
                  <p className="text-xs text-[#64748B]">Delivery address</p>
                  <p className="font-medium">{liveOrder.deliveryAddress}</p>
                  {liveOrder.deliveryPincode ? (
                    <p className="text-sm text-[#64748B]">
                      PIN: {liveOrder.deliveryPincode}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Truck className="mx-auto size-12 text-gray-300" />
          <p className="mt-4 font-medium">Search for an order to track</p>
          <p className="text-sm text-[#64748B]">
            Enter an order ID, customer mobile, or name above
          </p>
        </Card>
      )}
    </CePageShell>
  );
}
