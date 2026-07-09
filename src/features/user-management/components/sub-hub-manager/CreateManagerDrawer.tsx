"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateManagerPayload } from "@/features/user-management/types/sub-hub-manager.types";
import { MANAGER_HUBS } from "@/mock/sub-hub-manager-service";

const REGIONS = [
  "West Region",
  "North Region",
  "North NCR",
  "Central Region",
  "South Region",
];

const WAREHOUSES = [
  "Mumbai Central Warehouse",
  "Pune Regional Warehouse",
  "Delhi Central Warehouse",
  "NCR Regional Warehouse",
  "Nagpur Warehouse",
  "Hyderabad Warehouse",
  "Chennai Warehouse",
  "Bangalore Warehouse",
];

interface CreateManagerDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateManagerPayload) => void;
}

const EMPTY_FORM: CreateManagerPayload = {
  name: "",
  phone: "",
  email: "",
  employeeId: "",
  hubId: "",
  warehouse: "",
  region: "",
  permissions: {
    inventory: true,
    dispatch: true,
    requisition: true,
    drivers: true,
    reports: false,
  },
};

export function CreateManagerDrawer({
  open,
  onClose,
  onCreate,
}: CreateManagerDrawerProps) {
  const [form, setForm] = useState<CreateManagerPayload>(EMPTY_FORM);
  const [isDraft, setIsDraft] = useState(false);

  function handleClose() {
    setForm(EMPTY_FORM);
    setIsDraft(false);
    onClose();
  }

  function handleCreate() {
    onCreate(form);
    handleClose();
  }

  function handleSaveDraft() {
    setIsDraft(true);
    onClose();
  }

  const isValid =
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.employeeId.trim() &&
    form.hubId &&
    form.warehouse &&
    form.region;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="text-primary size-5" />
            Create Sub-Hub Manager
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto py-4 pr-1">
          {/* Personal Information */}
          <section>
            <p className="mb-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Personal Information
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  placeholder="e.g. Arjun Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+91 98000 00000"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Employee ID</Label>
                  <Input
                    placeholder="BQ-MGR-XXX"
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm({ ...form, employeeId: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="name@bqindia.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Assignment */}
          <section>
            <p className="mb-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Assignment
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Assign Hub</Label>
                <Select
                  value={form.hubId}
                  onValueChange={(v) => setForm({ ...form, hubId: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hub..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGER_HUBS.map((hub) => (
                      <SelectItem key={hub.hubId} value={hub.hubId}>
                        {hub.hubName} · {hub.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign Warehouse</Label>
                <Select
                  value={form.warehouse}
                  onValueChange={(v) =>
                    setForm({ ...form, warehouse: v ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a warehouse..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSES.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign Region</Label>
                <Select
                  value={form.region}
                  onValueChange={(v) => setForm({ ...form, region: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Permissions */}
          <section>
            <p className="mb-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Permissions
            </p>
            <div className="space-y-2">
              {(
                [
                  { key: "inventory", label: "Inventory Management" },
                  { key: "dispatch", label: "Dispatch Management" },
                  { key: "requisition", label: "Requisition Management" },
                  { key: "drivers", label: "Driver Management" },
                  { key: "reports", label: "Reports & Analytics" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <Checkbox
                    id={`perm-${key}`}
                    checked={form.permissions[key]}
                    onCheckedChange={(checked) =>
                      setForm({
                        ...form,
                        permissions: {
                          ...form.permissions,
                          [key]: !!checked,
                        },
                      })
                    }
                  />
                  <Label
                    htmlFor={`perm-${key}`}
                    className="cursor-pointer font-normal"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </section>
        </div>

        <SheetFooter className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleCreate}
            disabled={!isValid}
          >
            Create Manager
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
