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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/services/api";
import { inviteAdminCustomer } from "@/services/customers";
import { notify } from "@/utils/notify";

interface FilterOption {
  value: string;
  label: string;
}

interface InviteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubOptions: FilterOption[];
  executiveOptions: FilterOption[];
  onInvited: () => void;
}

export function InviteCustomerDialog({
  open,
  onOpenChange,
  hubOptions,
  executiveOptions,
  onInvited,
}: InviteCustomerDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hubId, setHubId] = useState("");
  const [executiveId, setExecutiveId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setCompanyName("");
    setHubId("");
    setExecutiveId("");
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || phone.replace(/\D/g, "").length < 10) {
      notify.error(
        "Missing details",
        "Enter a customer name and a valid 10-digit phone number.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteAdminCustomer({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        companyName: companyName.trim() || undefined,
        hubId: hubId || undefined,
        executiveId: executiveId || undefined,
      });
      notify.success(
        "Customer invited",
        "The customer can sign in to the app with OTP using this phone number.",
      );
      reset();
      onOpenChange(false);
      onInvited();
    } catch (error) {
      notify.error("Unable to invite customer", getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New Customer</DialogTitle>
          <DialogDescription>
            Creates a customer record. The customer logs in with OTP on the
            Bajriwala app — no password is issued from Admin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Full name</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Customer name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-phone">Phone</Label>
            <Input
              id="invite-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="9876500001"
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email (optional)</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-company">Company (optional)</Label>
            <Input
              id="invite-company"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Assigned hub (optional)</Label>
            <Select
              value={hubId}
              onValueChange={(value) => setHubId(value ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Not assigned" />
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
          <div className="space-y-1.5">
            <Label>Assigned executive (optional)</Label>
            <Select
              value={executiveId}
              onValueChange={(value) => setExecutiveId(value ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Not assigned" />
              </SelectTrigger>
              <SelectContent>
                {executiveOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Inviting..." : "Invite Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
