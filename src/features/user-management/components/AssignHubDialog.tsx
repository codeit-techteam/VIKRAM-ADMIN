"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HubOption {
  value: string;
  label: string;
}

interface AssignHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubOptions: HubOption[];
  selectedCount: number;
  onConfirm: (hubId: string) => void;
}

export function AssignHubDialog({
  open,
  onOpenChange,
  hubOptions,
  selectedCount,
  onConfirm,
}: AssignHubDialogProps) {
  const [hubId, setHubId] = useState(hubOptions[0]?.value ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Hub</DialogTitle>
          <DialogDescription>
            Assign a service hub to {selectedCount} selected customer
            {selectedCount === 1 ? "" : "s"}. Customers without orders will
            receive a pending first order at the selected hub, triggering
            executive assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Service Hub
          </label>
          <Select
            value={hubId}
            onValueChange={(value) => {
              if (value) setHubId(value);
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select hub" />
            </SelectTrigger>
            <SelectContent>
              {hubOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!hubId}
            onClick={() => {
              onConfirm(hubId);
              onOpenChange(false);
            }}
          >
            Assign Hub
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
