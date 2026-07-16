"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubHubManager } from "@/features/user-management/types/sub-hub-manager.types";
import { MANAGER_HUBS } from "@/mock/sub-hub-manager-service";

interface AssignManagerHubDialogProps {
  open: boolean;
  onClose: () => void;
  managers: SubHubManager[];
  onAssign: (managerId: string, hubId: string) => void;
  initialManagerId?: string;
}

export function AssignManagerHubDialog({
  open,
  onClose,
  managers,
  onAssign,
  initialManagerId,
}: AssignManagerHubDialogProps) {
  const [managerId, setManagerId] = useState(initialManagerId ?? "");
  const [hubId, setHubId] = useState("");

  useEffect(() => {
    if (open) {
      setManagerId(initialManagerId ?? "");
      setHubId("");
    }
  }, [open, initialManagerId]);

  const selectedManager = managers.find((m) => m.id === managerId);
  const availableHubs = MANAGER_HUBS.filter(
    (hub) => hub.hubId !== selectedManager?.hubId,
  );

  function handleSubmit() {
    if (!managerId || !hubId) return;
    onAssign(managerId, hubId);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="text-primary size-5" />
            Assign Hub
          </DialogTitle>
          <DialogDescription>
            Assign a Sub-Hub Network location to a manager. Operational metrics
            on their card will update from that hub&apos;s live data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Manager</Label>
            <Select
              value={managerId}
              onValueChange={(value) => setManagerId(value ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager..." />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name} · {manager.employeeId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedManager ? (
            <div className="rounded-lg bg-[#FAFAF8] p-3">
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Current Hub
              </p>
              <p className="mt-1 font-semibold text-[#1A1A1A]">
                {selectedManager.hubName || "Unassigned"}
              </p>
              <p className="text-xs text-[#64748B]">
                {selectedManager.city} · {selectedManager.hubCode}
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label>Assign To Hub</Label>
            <Select
              value={hubId}
              onValueChange={(value) => setHubId(value ?? "")}
              disabled={!managerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose hub from network..." />
              </SelectTrigger>
              <SelectContent>
                {availableHubs.map((hub) => (
                  <SelectItem key={hub.hubId} value={hub.hubId}>
                    {hub.hubName} · {hub.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!managerId || !hubId}
          >
            Assign Hub
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
