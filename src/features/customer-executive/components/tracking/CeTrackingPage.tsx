"use client";

import { Check, MapPin, Phone, Search, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import type { TrackingStep } from "@/features/customer-executive/types";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

const TRACKING_STEPS: { key: TrackingStep; label: string }[] = [
  { key: "ORDER_CREATED", label: "Order Created" },
  { key: "PAYMENT_RECEIVED", label: "Payment Received" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PACKED", label: "Packed" },
  { key: "LOADED", label: "Loaded" },
  { key: "DISPATCHED", label: "Dispatched" },
  { key: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" },
];

const STEP_ORDER = TRACKING_STEPS.map((s) => s.key);

function getStepIndex(step: TrackingStep): number {
  return STEP_ORDER.indexOf(step);
}

export function CeTrackingPage() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") ?? "";

  const getOrderByNumber = useCustomerExecutiveStore((s) => s.getOrderByNumber);
  const orders = useCustomerExecutiveStore((s) => s.orders);
  const drivers = useCustomerExecutiveStore((s) => s.drivers);
  const vehicles = useCustomerExecutiveStore((s) => s.vehicles);
  const hubs = useCustomerExecutiveStore((s) => s.hubs);

  const [searchQuery, setSearchQuery] = useState(initialOrder);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(initialOrder);

  const order = useMemo(() => {
    if (!selectedOrderNumber)
      return orders.find((o) => o.status === "IN_TRANSIT");
    return getOrderByNumber(selectedOrderNumber);
  }, [selectedOrderNumber, getOrderByNumber, orders]);

  const driver = drivers.find((d) => d.id === order?.driverId);
  const vehicle = vehicles.find((v) => v.id === order?.vehicleId);
  const hub = hubs.find((h) => h.id === order?.hubId);
  const currentStepIndex = order ? getStepIndex(order.trackingStep) : -1;

  const handleSearch = () => {
    const found = getOrderByNumber(searchQuery);
    if (found) {
      setSelectedOrderNumber(found.orderNumber);
      notify.success("Order found", found.orderNumber);
    } else {
      notify.error("Order not found", "Check the order ID and try again");
    }
  };

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

      {order ? (
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
                      #{order.orderNumber}
                    </span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      LIVE
                    </Badge>
                  </div>
                  <p className="font-semibold">{order.company}</p>
                  <p className="text-sm text-[#64748B]">{order.customerName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#64748B]">Estimated Arrival</p>
                <p className="text-primary text-lg font-bold">
                  {order.eta ?? "Calculating..."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="overflow-x-auto p-6">
              <div className="flex min-w-[800px] items-center justify-between">
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
                {driver && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-[#64748B]">Driver</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() =>
                        notify.info("Calling driver", driver.phone)
                      }
                    >
                      <Phone className="size-4" />
                      Call Driver
                    </Button>
                  </div>
                )}
                {vehicle && (
                  <div>
                    <p className="text-sm text-[#64748B]">Vehicle</p>
                    <p className="font-medium">
                      {vehicle.registration} — {vehicle.model} (
                      {vehicle.payload} Payload)
                    </p>
                  </div>
                )}
                {hub && (
                  <div>
                    <p className="text-sm text-[#64748B]">Fulfillment Hub</p>
                    <p className="font-medium">{hub.name}</p>
                    {hub.lastScannedAt && (
                      <p className="text-xs text-[#64748B]">
                        Last scanned{" "}
                        {new Date(hub.lastScannedAt).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
                  <p className="text-sm">
                    En route via NH-48 (Delhi-Jaipur Expressway)
                  </p>
                </div>
                <div className="rounded-lg bg-[#1A1A1A] p-4 text-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">CURRENT SPEED</p>
                      <p className="text-primary text-xl font-bold">42 km/h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">
                        REMAINING DISTANCE
                      </p>
                      <p className="text-primary text-xl font-bold">12.4 km</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Delivery Address</p>
                  <p className="font-medium">{order.deliveryAddress}</p>
                  <p className="text-sm text-[#64748B]">
                    PIN: {order.deliveryPincode}
                  </p>
                </div>
                <CeStatusBadge status={order.status} />
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#f0f0f0_25%,transparent_25%),linear-gradient(225deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(315deg,#f0f0f0_25%,#e8e8e8_25%)] bg-[length:20px_20px]" />
                  <svg
                    className="absolute inset-0 size-full"
                    viewBox="0 0 400 300"
                  >
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
                      {vehicle?.registration ?? "Vehicle"}
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
