"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Grid3X3, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ROUTES } from "@/constants/routes";
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import {
  clearCustomerDraft,
  loadCustomerDraft,
  saveCustomerDraft,
} from "@/features/customer-executive/utils/draft-storage";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { notify } from "@/utils/notify";
import type { CeCustomer, CustomerType } from "@/features/customer-executive/types";

const registrationSchema = z.object({
  phone: z.string().min(10, "Enter valid 10-digit mobile number"),
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company is required"),
  gst: z.string().optional(),
  email: z.string().email("Valid email required"),
  customerType: z.enum([
    "CONTRACTOR",
    "BUILDER",
    "DEALER",
    "ARCHITECT",
    "INDIVIDUAL",
  ]),
  address: z.string().min(10, "Address is required"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(6, "Valid pincode required"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const INDIAN_STATES = [
  "Haryana",
  "Maharashtra",
  "Uttar Pradesh",
  "Telangana",
  "Delhi",
  "Karnataka",
  "Punjab",
];

export function CeNewCustomerPage() {
  const router = useRouter();
  const lookupCustomer = useCustomerExecutiveStore((s) => s.lookupCustomer);
  const sendOtp = useCustomerExecutiveStore((s) => s.sendOtp);
  const verifyOtp = useCustomerExecutiveStore((s) => s.verifyOtp);
  const registerCustomer = useCustomerExecutiveStore((s) => s.registerCustomer);
  const loadCurrentExecutive = useCustomerExecutiveStore(
    (s) => s.loadCurrentExecutive,
  );
  const currentExecutive = useCustomerExecutiveStore((s) => s.currentExecutive);

  const [step, setStep] = useState(1);
  const [lookupPhone, setLookupPhone] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<CeCustomer | null>(
    null,
  );
  const [lookupDone, setLookupDone] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phone: "",
      name: "",
      company: "",
      gst: "",
      email: "",
      customerType: "CONTRACTOR",
      address: "",
      state: "Haryana",
      city: "",
      pincode: "",
    },
  });

  useEffect(() => {
    void loadCurrentExecutive();
  }, [loadCurrentExecutive]);

  useEffect(() => {
    const draft = loadCustomerDraft();
    if (draft?.phone) {
      setLookupPhone(draft.phone);
      form.reset({
        phone: draft.phone,
        name: draft.name ?? "",
        company: draft.company ?? "",
        gst: draft.gst ?? "",
        email: draft.email ?? "",
        customerType:
          (draft.customerType as RegistrationForm["customerType"]) ??
          "CONTRACTOR",
        address: draft.address ?? "",
        state: draft.state ?? "Haryana",
        city: draft.city ?? "",
        pincode: draft.pincode ?? "",
      });
      if (draft.name) setStep(2);
      if (draft.savedAt) setDraftSavedAt(draft.savedAt);
    }
  }, [form]);

  const handleSaveDraft = () => {
    const values = form.getValues();
    saveCustomerDraft({
      ...values,
      phone: values.phone || lookupPhone,
      customerType: values.customerType as CustomerType,
    });
    setDraftSavedAt(new Date().toISOString());
    notify.success("Draft saved", "You can continue registration later");
  };

  const handleLookup = async () => {
    setIsLookingUp(true);
    try {
      const result = await lookupCustomer(lookupPhone);
      setLookupDone(true);
      if (result.assignedToOtherExecutive) {
        notify.warning(
          "Customer exists",
          "This customer is assigned to another executive",
        );
        setExistingCustomer(null);
        return;
      }
      if (result.exists && result.customer) {
        setExistingCustomer(result.customer);
        notify.info("Existing customer found", result.customer.name);
      } else {
        setExistingCustomer(null);
        form.setValue("phone", lookupPhone);
        setStep(2);
      }
    } catch (error) {
      notify.error(
        "Lookup failed",
        error instanceof Error ? error.message : "Try again",
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const result = await sendOtp(lookupPhone || form.getValues("phone"));
      setOtpSent(true);
      if (result.otp) {
        setOtpValue(result.otp);
        notify.info("Development OTP", result.otp);
      } else {
        notify.success("OTP sent", "Check the customer's mobile");
      }
    } catch (error) {
      notify.error(
        "Failed to send OTP",
        error instanceof Error ? error.message : "Try again",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue.trim()) {
      notify.error("Enter OTP");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const result = await verifyOtp(
        lookupPhone || form.getValues("phone"),
        otpValue.trim(),
      );
      setVerificationToken(result.verificationToken);
      notify.success("Phone verified", "You can complete registration");
    } catch (error) {
      notify.error(
        "OTP verification failed",
        error instanceof Error ? error.message : "Try again",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleRegister = (andCreateOrder = false) => {
    if (!verificationToken) {
      notify.error("Verify OTP first");
      return;
    }

    form.handleSubmit(async (data) => {
      setIsRegistering(true);
      try {
        const customer = await registerCustomer(
          {
            ...data,
            gst: data.gst ?? "",
            customerType: data.customerType as CustomerType,
          },
          verificationToken,
        );
        clearCustomerDraft();
        notify.success(
          "Customer registered",
          `${customer.name} added successfully`,
        );
        if (andCreateOrder) {
          router.push(
            `${ROUTES.CUSTOMER_EXECUTIVE}/orders/new?customer=${customer.id}`,
          );
        } else {
          router.push(`${ROUTES.CUSTOMER_EXECUTIVE}/customers/${customer.id}`);
        }
      } catch (error) {
        notify.error(
          "Registration failed",
          error instanceof Error ? error.message : "Try again",
        );
      } finally {
        setIsRegistering(false);
      }
    })();
  };

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        {
          label: "Customer Management",
          href: `${ROUTES.CUSTOMER_EXECUTIVE}/customers`,
        },
        { label: "New Registration" },
      ]}
      title="New Customer Registration"
      subtitle="Register a new B2B customer in the procurement network."
    >
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="text-primary size-4" />
              Step 1: Customer Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-3">
                <Label>Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-[#64748B]">
                    +91
                  </div>
                  <Input
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="flex-1"
                  />
                  <Button onClick={handleLookup} disabled={isLookingUp}>
                    <Check className="size-4" />
                    {isLookingUp ? "Searching..." : "Verify & Search"}
                  </Button>
                </div>
                <p className="text-xs text-[#64748B]">
                  Quickly check if the customer is already registered in our B2B
                  procurement network.
                </p>
              </div>

              <AnimatePresence>
                {lookupDone && existingCustomer && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full rounded-xl border border-orange-200 bg-orange-50/50 p-4 lg:w-80"
                  >
                    <span className="bg-primary rounded-full px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
                      Existing Record Found
                    </span>
                    <div className="mt-3 flex items-center gap-3">
                      <CeCustomerAvatar
                        name={existingCustomer.name}
                        id={existingCustomer.id}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold">{existingCustomer.name}</p>
                        <p className="text-xs text-[#64748B]">
                          {existingCustomer.id}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-[#64748B]">
                      <p>Type: {existingCustomer.customerType}</p>
                      <p>City: {existingCustomer.city}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      render={
                        <Link
                          href={`${ROUTES.CUSTOMER_EXECUTIVE}/customers/${existingCustomer.id}`}
                        />
                      }
                    >
                      View Full History
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Step 2: Phone Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? "Sending..." : "Send OTP"}
                  </Button>
                  <Input
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Enter OTP"
                    className="max-w-[180px]"
                  />
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || !otpSent}
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
                {verificationToken ? (
                  <p className="text-xs text-green-700">
                    Phone verified. Complete the registration details below.
                  </p>
                ) : (
                  <p className="text-xs text-[#64748B]">
                    Send and verify OTP before registering the customer.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Grid3X3 className="text-primary size-4" />
                  Step 3: Registration Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...form.register("name")} placeholder="John Doe" />
                    {form.formState.errors.name && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Type</Label>
                    <Select
                      value={form.watch("customerType")}
                      onValueChange={(v) =>
                        form.setValue(
                          "customerType",
                          v as RegistrationForm["customerType"],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                        <SelectItem value="BUILDER">Builder</SelectItem>
                        <SelectItem value="DEALER">Dealer</SelectItem>
                        <SelectItem value="ARCHITECT">Architect</SelectItem>
                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      {...form.register("email")}
                      placeholder="name@company.com"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Company Name</Label>
                    <Input
                      {...form.register("company")}
                      placeholder="Company Pvt Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number (Optional)</Label>
                    <Input
                      {...form.register("gst")}
                      placeholder="27AABCM1234F1Z5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="text-primary size-4" />
                  Step 4: Address & Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Delivery Address</Label>
                  <Textarea
                    {...form.register("address")}
                    placeholder="Enter complete delivery address"
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>PIN Code</Label>
                    <Input {...form.register("pincode")} placeholder="122001" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input {...form.register("city")} placeholder="Gurgaon" />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      value={form.watch("state")}
                      onValueChange={(v) => v && form.setValue("state", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step >= 2 && (
          <div className="sticky bottom-0 flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#64748B]">
              {draftSavedAt
                ? `Draft saved ${new Date(draftSavedAt).toLocaleString("en-IN")}`
                : `Draft will be saved by ${currentExecutive?.name ?? "your executive"}`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRegister(false)}
                disabled={isRegistering || !verificationToken}
              >
                Register Customer
              </Button>
              <Button
                onClick={() => handleRegister(true)}
                disabled={isRegistering || !verificationToken}
              >
                Register & Create Order →
              </Button>
            </div>
          </div>
        )}
      </div>
    </CePageShell>
  );
}
