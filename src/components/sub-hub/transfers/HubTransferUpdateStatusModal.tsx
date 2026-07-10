"use client";

import { useEffect, useState } from "react";

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
import { HUB_TRANSFER_STATUS_OPTIONS } from "@/mock/hub-transfers";
import type {
  HubTransferStatus,
  HubTransferStatusUpdatePayload,
} from "@/types/hub-transfer.types";

interface HubTransferUpdateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: HubTransferStatus;
  transferLabel: string;
  updatedBy: string;
  onSave: (payload: HubTransferStatusUpdatePayload) => void;
}

export function HubTransferUpdateStatusModal({
  open,
  onOpenChange,
  currentStatus,
  transferLabel,
  updatedBy,
  onSave,
}: HubTransferUpdateStatusModalProps) {
  const [status, setStatus] = useState<HubTransferStatus>(currentStatus);
  const [remarks, setRemarks] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState("");

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setRemarks("");
      setEstimatedArrival("");
    }
  }, [open, currentStatus]);

  const handleSave = () => {
    onSave({
      status,
      remarks: remarks.trim() || "Status updated from dispatch console.",
      estimatedArrival: estimatedArrival || undefined,
      updatedBy,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <p className="text-sm text-[#64748B]">{transferLabel}</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="hub-transfer-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus((value ?? currentStatus) as HubTransferStatus)
              }
            >
              <SelectTrigger id="hub-transfer-status" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HUB_TRANSFER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hub-transfer-remarks">Remarks</Label>
            <Textarea
              id="hub-transfer-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Add dispatch remarks..."
              className="min-h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hub-transfer-eta">Estimated Arrival</Label>
            <Input
              id="hub-transfer-eta"
              type="datetime-local"
              value={estimatedArrival}
              onChange={(event) => setEstimatedArrival(event.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label>Updated By</Label>
            <Input value={updatedBy} disabled className="h-10 bg-gray-50" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
