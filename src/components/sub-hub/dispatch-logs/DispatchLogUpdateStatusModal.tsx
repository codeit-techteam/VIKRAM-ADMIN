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
import { DISPATCH_LOG_STATUS_OPTIONS } from "@/mock/dispatch-logs";
import type {
  DispatchLogStatus,
  DispatchLogStatusUpdatePayload,
} from "@/types/dispatch-log.types";

interface DispatchLogUpdateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: DispatchLogStatus;
  dispatchLabel: string;
  updatedBy: string;
  onSave: (payload: DispatchLogStatusUpdatePayload) => void;
}

export function DispatchLogUpdateStatusModal({
  open,
  onOpenChange,
  currentStatus,
  dispatchLabel,
  updatedBy,
  onSave,
}: DispatchLogUpdateStatusModalProps) {
  const [status, setStatus] = useState<DispatchLogStatus>(currentStatus);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setRemarks("");
    }
  }, [open, currentStatus]);

  const handleSave = () => {
    onSave({
      status,
      remarks: remarks.trim() || `Manual status updated to ${status}.`,
      updatedBy,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <p className="text-sm text-[#64748B]">
            {dispatchLabel} · Manual tracking update
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dispatch-log-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus((value ?? currentStatus) as DispatchLogStatus)
              }
            >
              <SelectTrigger id="dispatch-log-status" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPATCH_LOG_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispatch-log-remarks">Remarks</Label>
            <Textarea
              id="dispatch-log-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Add manual dispatch remarks..."
              className="min-h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Updated By</Label>
            <Input value={updatedBy} disabled className="h-10 bg-gray-50" />
          </div>

          <p className="text-xs text-[#94A3B8]">
            This update will be appended to the dispatch timeline with
            timestamp. No live GPS tracking.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
