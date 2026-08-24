"use client";

import { Truck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useVehicles } from "@/features/logistics/hooks/use-vehicles";
import { formatLogisticsDate } from "@/features/logistics/utils/logistics-formatters";

interface HubAssignedVehiclesPanelProps {
  hubId: string;
}

export function HubAssignedVehiclesPanel({
  hubId,
}: HubAssignedVehiclesPanelProps) {
  const vehiclesQuery = useVehicles({
    page: 1,
    limit: 50,
    hubId,
  });
  const vehicles = vehiclesQuery.data?.vehicles ?? [];

  if (vehiclesQuery.isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState
        title="No assigned vehicles"
        description="Vehicles assigned to this hub will appear here from the Vehicle Master."
        icon={<Truck className="size-8" />}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
            <TableHead>Vehicle Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead>Fitness</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-medium">{v.vehicleNumber}</TableCell>
              <TableCell>{v.vehicleType}</TableCell>
              <TableCell>
                {v.capacityLabel ?? `${(v.capacityKg / 1000).toFixed(1)}T`}
              </TableCell>
              <TableCell>{v.assignedDriverName ?? "—"}</TableCell>
              <TableCell>
                <LogisticsStatusBadge status={v.status} />
              </TableCell>
              <TableCell>{formatLogisticsDate(v.insuranceExpiry)}</TableCell>
              <TableCell>{formatLogisticsDate(v.fitnessExpiry)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
