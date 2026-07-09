"use client";

import { useState } from "react";
import { ArrowRightLeft, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SubHubManager } from "@/features/user-management/types/sub-hub-manager.types";
import { MANAGER_HUBS } from "@/mock/sub-hub-manager-service";

interface TransferHubModalProps {
  manager: SubHubManager | null;
  open: boolean;
  onClose: () => void;
  onTransfer: (
    managerId: string,
    newHubId: string,
    reason: string,
    effectiveDate: string,
  ) => void;
}

export function TransferHubModal({
  manager,
  open,
  onClose,
  onTransfer,
}: TransferHubModalProps) {
  const [newHubId, setNewHubId] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  function handleSubmit() {
    if (!manager || !newHubId || !reason || !effectiveDate) return;
    onTransfer(manager.id, newHubId, reason, effectiveDate);
    setNewHubId("");
    setReason("");
    setEffectiveDate(new Date().toISOString().split("T")[0]);
    onClose();
  }

  function handleClose() {
    setNewHubId("");
    setReason("");
    setEffectiveDate(new Date().toISOString().split("T")[0]);
    onClose();
  }

  const availableHubs = MANAGER_HUBS.filter((h) => h.hubId !== manager?.hubId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="text-primary size-5" />
            Transfer Hub
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-[#FAFAF8] p-3">
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Current Hub
            </p>
            <p className="mt-1 font-semibold text-[#1A1A1A]">
              {manager?.hubName ?? "—"}
            </p>
            <p className="text-xs text-[#64748B]">
              {manager?.city} · {manager?.hubCode}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Select New Hub</Label>
            <Select
              value={newHubId}
              onValueChange={(v) => setNewHubId(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a hub..." />
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

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea
              placeholder="Reason for transfer..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Effective Date
            </Label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!newHubId || !reason || !effectiveDate}
          >
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
