"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TYPE_LABELS,
  type CustomerDetail,
  type CustomerEditPayload,
  type CustomerStatus,
  type CustomerType,
} from "@/features/user-management/types/customer.types";
import { formatDate } from "@/utils/format-date";

interface EditCustomerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerDetail | null;
  onSave: (payload: CustomerEditPayload) => void;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs text-gray-400">{label}</Label>
      <p className="mt-1 text-sm font-medium text-[#1A1A1A]">{value}</p>
    </div>
  );
}

export function EditCustomerDrawer({
  open,
  onOpenChange,
  customer,
  onSave,
}: EditCustomerDrawerProps) {
  const [form, setForm] = useState<CustomerEditPayload | null>(null);

  useEffect(() => {
    if (customer && open) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        customerType: customer.customerType,
        status: customer.status,
        address: { ...customer.address },
      });
    }
  }, [customer, open]);

  if (!customer || !form) {
    return null;
  }

  const handleSave = () => {
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-gray-100 p-5">
          <SheetTitle className="text-lg text-[#1A1A1A]">
            Edit Customer
          </SheetTitle>
          <SheetDescription>
            Update customer profile details. Read-only fields reflect system
            assignments.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Customer Type</Label>
              <Select
                value={form.customerType}
                onValueChange={(value) =>
                  setForm({ ...form, customerType: value as CustomerType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(CUSTOMER_TYPE_LABELS) as [
                      CustomerType,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({ ...form, status: value as CustomerStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(CUSTOMER_STATUS_LABELS) as [
                      CustomerStatus,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={form.address.primaryAddress}
                onChange={(event) =>
                  setForm({
                    ...form,
                    address: {
                      ...form.address,
                      primaryAddress: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={form.address.city}
                onChange={(event) =>
                  setForm({
                    ...form,
                    address: { ...form.address, city: event.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state">State</Label>
              <Input
                id="edit-state"
                value={form.address.state}
                onChange={(event) =>
                  setForm({
                    ...form,
                    address: { ...form.address, state: event.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pincode">Pincode</Label>
              <Input
                id="edit-pincode"
                value={form.address.pincode}
                onChange={(event) =>
                  setForm({
                    ...form,
                    address: { ...form.address, pincode: event.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
            <p className="mb-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Read Only
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label="Customer ID" value={customer.customerId} />
              <ReadOnlyField
                label="Registration Date"
                value={formatDate(customer.registrationDate)}
              />
              <ReadOnlyField
                label="Assigned Hub"
                value={customer.assignedOperations.hubName}
              />
              <ReadOnlyField
                label="Assigned Executive"
                value={customer.assignedOperations.executiveName}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-gray-100 p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
