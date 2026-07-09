"use client";

import { useState } from "react";

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
import { LOGISTICS_HUBS, LOGISTICS_WAREHOUSES } from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { LogisticsDriver } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDriver?: LogisticsDriver | null;
}

const EMPTY_FORM = {
  name: "",
  employeeId: "",
  mobile: "",
  licenseNumber: "",
  licenseExpiry: "",
  assignedHub: LOGISTICS_HUBS[0]!,
  assignedWarehouse: LOGISTICS_WAREHOUSES[0]!,
  status: "available" as LogisticsDriver["status"],
};

export function AddDriverDialog({
  open,
  onOpenChange,
  editDriver,
}: AddDriverDialogProps) {
  const addDriver = useLogisticsStore((s) => s.addDriver);
  const updateDriver = useLogisticsStore((s) => s.updateDriver);

  const [form, setForm] = useState(() =>
    editDriver
      ? {
          name: editDriver.name,
          employeeId: editDriver.employeeId,
          mobile: editDriver.mobile,
          licenseNumber: editDriver.licenseNumber,
          licenseExpiry: editDriver.licenseExpiry.slice(0, 10),
          assignedHub: editDriver.assignedHub,
          assignedWarehouse: editDriver.assignedWarehouse,
          status: editDriver.status,
        }
      : EMPTY_FORM,
  );

  const handleSave = () => {
    if (!form.name || !form.employeeId) {
      notify.error("Please fill required fields");
      return;
    }

    const driverData: LogisticsDriver = {
      id: editDriver?.id ?? `ld-${Date.now()}`,
      photoUrl: null,
      name: form.name,
      employeeId: form.employeeId,
      mobile: form.mobile,
      licenseNumber: form.licenseNumber,
      licenseExpiry: form.licenseExpiry,
      assignedHub: form.assignedHub,
      assignedWarehouse: form.assignedWarehouse,
      assignedVehicleId: editDriver?.assignedVehicleId ?? null,
      assignedVehicleNumber: editDriver?.assignedVehicleNumber ?? null,
      tripsToday: editDriver?.tripsToday ?? 0,
      status: form.status,
    };

    if (editDriver) {
      updateDriver(editDriver.id, driverData);
      notify.success("Driver Updated");
    } else {
      addDriver(driverData);
      notify.success("Driver Added Successfully");
    }
    onOpenChange(false);
    setForm(EMPTY_FORM);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editDriver ? "Edit Driver" : "Add Driver"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Driver Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rajesh Kumar"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Employee ID *</Label>
            <Input
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              placeholder="DRV-1001"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-1.5">
            <Label>License Number</Label>
            <Input
              value={form.licenseNumber}
              onChange={(e) =>
                setForm({ ...form, licenseNumber: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>License Expiry</Label>
            <Input
              type="date"
              value={form.licenseExpiry}
              onChange={(e) =>
                setForm({ ...form, licenseExpiry: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Assigned Hub</Label>
            <Select
              value={form.assignedHub}
              onValueChange={(v) => v && setForm({ ...form, assignedHub: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOGISTICS_HUBS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned Warehouse</Label>
            <Select
              value={form.assignedWarehouse}
              onValueChange={(v) =>
                v && setForm({ ...form, assignedWarehouse: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOGISTICS_WAREHOUSES.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                v &&
                setForm({ ...form, status: v as LogisticsDriver["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="driving">Driving</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
