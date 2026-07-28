"use client";

import { Check, MapPin, Phone, Search, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import {
  getLatestOrderForCustomer,
  searchOrders,
} from "@/features/customer-executive/utils/search";
import { initiateCall } from "@/features/customer-executive/utils/communication";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import type { TrackingStep } from "@/features/customer-executive/types";
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

function MapMock({ vehicleLabel }: { vehicleLabel: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f0f0f0_25%,transparent_25%),linear-gradient(225deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(315deg,#f0f0f0_25%,#e8e8e8_25%)] bg-[length:20px_20px]" />
      <svg className="absolute inset-0 size-full" viewBox="0 0 400 300">
        <path
          d="M 50 200 Q 150 100 250 150 T 350 80"
          fill="none"
          stroke="#ff6b00"
          strokeWidth="3"
          strokeDasharray="8 4"
        />
        <circle cx="280" cy="120" r="8" fill="#ff6b00" />
        <circle cx="350" cy="80" r="6" fill="#1A1A1A" />
      </svg>
      <div className="absolute top-1/3 left-2/3 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="bg-primary rounded-lg px-2 py-1 text-[10px] font-semibold text-white">
          {vehicleLabel}
        </div>
        <Truck className="text-primary size-6" />
      </div>
      <div className="absolute right-4 bottom-4 left-4 rounded-lg bg-white/90 p-2 text-xs shadow-sm">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="bg-primary size-2 rounded-full" />
            Vehicle Location
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#1A1A1A]" />
            Delivery Point
          </span>
        </div>
      </div>
    </div>
  );
}

export function CeTrackingPage() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") ?? "";
  const initialCustomer = searchParams.get("customer") ?? "";

  const getOrderByNumber = useCustomerExecutiveStore((s) => s.getOrderByNumber);
  const orders = useCustomerExecutiveStore((s) => s.orders);
  const customers = useCustomerExecutiveStore((s) => s.customers);
  const loadOrdersFromApi = useCustomerExecutiveStore(
    (s) => s.loadOrdersFromApi,
  );
  const loadOrderDetailFromApi = useCustomerExecutiveStore(
    (s) => s.loadOrderDetailFromApi,
  );

  const [searchQuery, setSearchQuery] = useState(
    initialOrder || initialCustomer,
  );
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(initialOrder);

  useEffect(() => {
    void loadOrdersFromApi();
    const timer = window.setInterval(() => {
      void loadOrdersFromApi();
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [loadOrdersFromApi]);

  useEffect(() => {
    if (initialOrder) {
      setSearchQuery(initialOrder);
      setSelectedOrderNumber(initialOrder);
      return;
    }
    if (initialCustomer) {
      const latest = getLatestOrderForCustomer(orders, initialCustomer);
      if (latest) {
        setSearchQuery(latest.orderNumber);
        setSelectedOrderNumber(latest.orderNumber);
      }
    }
  }, [initialOrder, initialCustomer, orders]);

  const order = useMemo(() => {
    if (!selectedOrderNumber)
      return orders.find((o) => o.status === "IN_TRANSIT");
    return getOrderByNumber(selectedOrderNumber);
  }, [selectedOrderNumber, getOrderByNumber, orders]);

  useEffect(() => {
    if (!order?.id) return;
    void loadOrderDetailFromApi(order.id);
  }, [order?.id, loadOrderDetailFromApi]);

  const liveOrder = order
    ? (orders.find((o) => o.id === order.id) ?? order)
    : null;
  const currentStepIndex = liveOrder
    ? getStepIndex(liveOrder.trackingStep)
    : -1;

  const handleSearch = () => {
    const found =
      searchOrders(orders, customers, searchQuery) ??
      getOrderByNumber(searchQuery);
    if (found) {
      setSelectedOrderNumber(found.orderNumber);
      notify.success("Order found", found.orderNumber);
    } else {
      notify.error("Order not found", "Check the order ID, phone, or name");
    }
  };

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
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="size-4" />
            Search
          </Button>
        </CardContent>
      </Card>

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
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      LIVE
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4" />
                  Real-time Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapMock vehicleLabel={vehicleNumber ?? "Vehicle"} />
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
