"use client";

import { useEffect, useState } from "react";

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
import type { CeCustomer } from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { notify } from "@/utils/notify";

interface CeEditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CeCustomer;
}

export function CeEditCustomerDialog({
  open,
  onOpenChange,
  customer,
}: CeEditCustomerDialogProps) {
  const updateCustomer = useCustomerExecutiveStore((s) => s.updateCustomer);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [companyName, setCompanyName] = useState(customer.company);
  const [gstNumber, setGstNumber] = useState(customer.gst ?? "");
  const [address, setAddress] = useState(customer.address);
  const [city, setCity] = useState(customer.city);
  const [state, setState] = useState(customer.state);
  const [pincode, setPincode] = useState(customer.pincode);

  useEffect(() => {
    if (!open) return;
    setFullName(customer.name);
    setEmail(customer.email);
    setCompanyName(customer.company);
    setGstNumber(customer.gst ?? "");
    setAddress(customer.address);
    setCity(customer.city);
    setState(customer.state);
    setPincode(customer.pincode);
  }, [open, customer]);

  const handleSave = async () => {
    const name = fullName.trim();
    if (name.length < 2) {
      notify.error("Name is required");
      return;
    }
    if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
      notify.error("Enter a valid 6-digit pincode");
      return;
    }

    setIsSaving(true);
    try {
      await updateCustomer(customer.id, {
        fullName: name,
        email: email.trim() || undefined,
        companyName: companyName.trim() || undefined,
        gstNumber: gstNumber.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
      });
      notify.success("Customer updated");
      onOpenChange(false);
    } catch (error) {
      notify.error(
        "Could not update customer",
        error instanceof Error ? error.message : "Try again",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
          <DialogDescription>
            Update profile details for {customer.name}. Phone cannot be changed
            here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="ce-edit-name">Name</Label>
            <Input
              id="ce-edit-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-edit-email">Email</Label>
            <Input
              id="ce-edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-edit-company">Company</Label>
            <Input
              id="ce-edit-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="ce-edit-gst">GSTIN</Label>
            <Input
              id="ce-edit-gst"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="ce-edit-address">Address</Label>
            <Input
              id="ce-edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-edit-city">City</Label>
            <Input
              id="ce-edit-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-edit-state">State</Label>
            <Input
              id="ce-edit-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-edit-pincode">Pincode</Label>
            <Input
              id="ce-edit-pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
