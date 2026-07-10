"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatHubTransferDateTime } from "@/mock/hub-transfers";
import type { HubTransferFleetDriver } from "@/types/hub-transfer.types";
import { cn } from "@/lib/utils";

interface HubTransferAssignDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferLabel: string;
  hubName: string;
  drivers: HubTransferFleetDriver[];
  onAssign: (driverId: string) => void;
}

export function HubTransferAssignDriverModal({
  open,
  onOpenChange,
  transferLabel,
  hubName,
  drivers,
  onAssign,
}: HubTransferAssignDriverModalProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return drivers;
    return drivers.filter(
      (driver) =>
        driver.name.toLowerCase().includes(query) ||
        driver.mobile.includes(query) ||
        driver.employeeId.toLowerCase().includes(query),
    );
  }, [drivers, search]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg rounded-xl p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle>Assign Driver</DialogTitle>
          <p className="text-sm text-[#64748B]">
            {transferLabel} · {hubName}
          </p>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search driver name or mobile"
              className="h-10 pl-9"
            />
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-amber-600">
                No available drivers for this hub.
              </p>
            ) : (
              filtered.map((driver) => (
                <button
                  key={driver.id}
                  type="button"
                  onClick={() => onAssign(driver.id)}
                  className="hover:border-primary/30 flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left transition-colors hover:bg-orange-50/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {driver.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {driver.employeeId} · {driver.mobile}
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      License valid till{" "}
                      {formatHubTransferDateTime(driver.licenseExpiry)} · Hub:{" "}
                      {driver.assignedHub}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                      driver.availability === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {driver.availability.replace("_", " ")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-gray-100 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
