"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UpdateEtaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEta: string;
  onSubmit: (newEta: string, remarks?: string) => void;
}

export function UpdateEtaDialog({
  open,
  onOpenChange,
  currentEta,
  onSubmit,
}: UpdateEtaDialogProps) {
  const [newEta, setNewEta] = useState(() =>
    new Date(currentEta).toISOString().slice(0, 16),
  );
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    onSubmit(new Date(newEta).toISOString(), remarks || undefined);
    onOpenChange(false);
    setRemarks("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update ETA</DialogTitle>
          <DialogDescription>
            Set a revised estimated time of arrival for this transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-eta">New ETA</Label>
            <Input
              id="new-eta"
              type="datetime-local"
              value={newEta}
              onChange={(e) => setNewEta(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eta-remarks">Remarks (optional)</Label>
            <Textarea
              id="eta-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add context for the ETA change..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update ETA</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReportDelayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEta: string;
  onSubmit: (newEta: string, reason: string) => void;
}

export function ReportDelayDialog({
  open,
  onOpenChange,
  currentEta,
  onSubmit,
}: ReportDelayDialogProps) {
  const [newEta, setNewEta] = useState(() =>
    new Date(currentEta).toISOString().slice(0, 16),
  );
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(new Date(newEta).toISOString(), reason.trim());
    onOpenChange(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Delay</DialogTitle>
          <DialogDescription>
            Record a delay with revised ETA and reason. Status will be marked as
            delayed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="delay-eta">Revised ETA</Label>
            <Input
              id="delay-eta"
              type="datetime-local"
              value={newEta}
              onChange={(e) => setNewEta(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delay-reason">Delay Reason</Label>
            <Textarea
              id="delay-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Traffic congestion, vehicle breakdown, weather..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim()}>
            Record Delay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddRemarksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (remarks: string) => void;
}

export function AddRemarksDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddRemarksDialogProps) {
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    if (!remarks.trim()) return;
    onSubmit(remarks.trim());
    onOpenChange(false);
    setRemarks("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Remarks</DialogTitle>
          <DialogDescription>
            Add a transit remark to the transfer timeline.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!remarks.trim()}>
            Add Remark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
