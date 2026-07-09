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
import type { LogisticsVehicle } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editVehicle?: LogisticsVehicle | null;
}

const EMPTY_FORM = {
  vehicleNumber: "",
  vehicleType: "",
  capacityKg: "",
  assignedWarehouse: LOGISTICS_WAREHOUSES[0]!,
  assignedHub: LOGISTICS_HUBS[0]!,
  fuelType: "Diesel",
  registrationDate: "",
  insuranceExpiry: "",
  fitnessExpiry: "",
  status: "available" as LogisticsVehicle["status"],
};

export function AddVehicleDialog({
  open,
  onOpenChange,
  editVehicle,
}: AddVehicleDialogProps) {
  const addVehicle = useLogisticsStore((s) => s.addVehicle);
  const updateVehicle = useLogisticsStore((s) => s.updateVehicle);

  const [form, setForm] = useState(() =>
    editVehicle
      ? {
          vehicleNumber: editVehicle.vehicleNumber,
          vehicleType: editVehicle.vehicleType,
          capacityKg: String(editVehicle.capacityKg),
          assignedWarehouse: editVehicle.assignedWarehouse,
          assignedHub: editVehicle.assignedHub,
          fuelType: editVehicle.fuelType,
          registrationDate: editVehicle.registrationDate,
          insuranceExpiry: editVehicle.insuranceExpiry.slice(0, 10),
          fitnessExpiry: editVehicle.fitnessExpiry.slice(0, 10),
          status: editVehicle.status,
        }
      : EMPTY_FORM,
  );

  const handleSave = () => {
    if (!form.vehicleNumber || !form.vehicleType) {
      notify.error("Please fill required fields");
      return;
    }

    const vehicleData: LogisticsVehicle = {
      id: editVehicle?.id ?? `lv-${Date.now()}`,
      vehicleNumber: form.vehicleNumber,
      vehicleType: form.vehicleType,
      capacityKg: Number(form.capacityKg) || 8000,
      assignedWarehouse: form.assignedWarehouse,
      assignedHub: form.assignedHub,
      assignedDriverId: editVehicle?.assignedDriverId ?? null,
      assignedDriverName: editVehicle?.assignedDriverName ?? null,
      currentShipmentId: editVehicle?.currentShipmentId ?? null,
      fuelType: form.fuelType,
      registrationDate: form.registrationDate,
      insuranceExpiry: form.insuranceExpiry,
      fitnessExpiry: form.fitnessExpiry,
      status: form.status,
    };

    if (editVehicle) {
      updateVehicle(editVehicle.id, vehicleData);
      notify.success("Changes Saved", "Vehicle updated successfully.");
    } else {
      addVehicle(vehicleData);
      notify.success("Vehicle Added Successfully");
    }
    onOpenChange(false);
    setForm(EMPTY_FORM);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Vehicle Number *</Label>
            <Input
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm({ ...form, vehicleNumber: e.target.value })
              }
              placeholder="HR-55-AN-1024"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle Type *</Label>
            <Input
              value={form.vehicleType}
              onChange={(e) =>
                setForm({ ...form, vehicleType: e.target.value })
              }
              placeholder="10-Ton Trailer"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Capacity (kg)</Label>
            <Input
              type="number"
              value={form.capacityKg}
              onChange={(e) => setForm({ ...form, capacityKg: e.target.value })}
              placeholder="10000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Warehouse</Label>
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
            <Label>Hub</Label>
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
            <Label>Fuel Type</Label>
            <Select
              value={form.fuelType}
              onValueChange={(v) => v && setForm({ ...form, fuelType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="CNG">CNG</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                v &&
                setForm({ ...form, status: v as LogisticsVehicle["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Registration Date</Label>
            <Input
              type="date"
              value={form.registrationDate}
              onChange={(e) =>
                setForm({ ...form, registrationDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Insurance Expiry</Label>
            <Input
              type="date"
              value={form.insuranceExpiry}
              onChange={(e) =>
                setForm({ ...form, insuranceExpiry: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Fitness Expiry</Label>
            <Input
              type="date"
              value={form.fitnessExpiry}
              onChange={(e) =>
                setForm({ ...form, fitnessExpiry: e.target.value })
              }
            />
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
