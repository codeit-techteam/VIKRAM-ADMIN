"use client";

import { MapPin, Search, Truck, User } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogisticsTimeline } from "@/features/logistics/components/LogisticsTimeline";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useLogisticsLoading } from "@/features/logistics/hooks/use-logistics-loading";
import { formatLogisticsDateTime, getShipmentTimeline } from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";

export function ShipmentTrackingPage() {
  const { isLoading } = useLogisticsLoading();
  const warehouseShipments = useLogisticsStore((s) => s.warehouseShipments);
  const customerDeliveries = useLogisticsStore((s) => s.customerDeliveries);

  const [searchQuery, setSearchQuery] = useState("WS-2026-0142");
  const [activeShipmentId, setActiveShipmentId] = useState("WS-2026-0142");

  const timeline = useMemo(
    () =>
      getShipmentTimeline(
        activeShipmentId,
        warehouseShipments,
        customerDeliveries,
      ),
    [activeShipmentId, warehouseShipments, customerDeliveries],
  );

  const suggestedIds = useMemo(() => {
    const ids = [
      ...warehouseShipments.map((s) => s.shipmentId),
      ...customerDeliveries.map((d) => d.orderId),
    ];
    if (!searchQuery.trim()) return ids.slice(0, 5);
    return ids
      .filter((id) => id.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [warehouseShipments, customerDeliveries, searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveShipmentId(searchQuery.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-[#F8F9FB] p-4 shadow-sm">
        <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Search Shipment ID
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="WS-2026-0142 or CD-2026-0891"
              className="h-10 border-gray-200 bg-white pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Track</Button>
        </div>
        {suggestedIds.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchQuery(id);
                  setActiveShipmentId(id);
                }}
                className="hover:border-primary/30 hover:text-primary rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-[#64748B] transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : !timeline ? (
        <EmptyState
          title="No Shipments"
          description={`No shipment found for ID "${activeShipmentId}". Try another ID.`}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Shipment Timeline
              </h2>
              <LogisticsStatusBadge
                status={
                  timeline.shipmentType === "warehouse_transfer"
                    ? "in_transit"
                    : "out_for_delivery"
                }
                label={
                  timeline.shipmentType === "warehouse_transfer"
                    ? "Warehouse Transfer"
                    : "Customer Delivery"
                }
              />
            </div>
            <LogisticsTimeline timeline={timeline} />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
                Shipment Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary mt-0.5 size-4" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Route</p>
                    <p className="text-sm font-medium">
                      {timeline.source} → {timeline.destination}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="text-primary mt-0.5 size-4" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Current Vehicle
                    </p>
                    <p className="text-sm font-medium">
                      {timeline.vehicleNumber ?? "Not assigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-primary mt-0.5 size-4" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Driver</p>
                    <p className="text-sm font-medium">
                      {timeline.driverName ?? "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
                ETA & Status
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase">
                    Estimated Arrival
                  </p>
                  <p className="text-sm font-medium">
                    {formatLogisticsDateTime(timeline.eta)}
                  </p>
                </div>
                {timeline.delayMinutes > 0 ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-700">
                      Delay: {timeline.delayMinutes} minutes
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-medium text-emerald-700">
                      On schedule
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 uppercase">Remarks</p>
                  <p className="text-sm text-[#64748B]">{timeline.remarks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
