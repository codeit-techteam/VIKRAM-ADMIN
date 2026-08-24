"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BLOOD_GROUP_OPTIONS,
  DRIVER_FORM_STEPS,
  DRIVER_STATUS_FORM_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  LICENSE_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SHIFT_OPTIONS,
} from "@/features/logistics/constants/fleet-form.constants";
import { ConfirmDialog } from "@/features/logistics/components/ConfirmDialog";
import {
  FleetFormField,
  FleetFormSection,
} from "@/features/logistics/components/shared/FleetFormField";
import { FleetFileUpload } from "@/features/logistics/components/shared/FleetFileUpload";
import { FleetFormStepIndicator } from "@/features/logistics/components/shared/FleetFormStepIndicator";
import {
  useCreateDriver,
  useUpdateDriver,
} from "@/features/logistics/hooks/use-drivers";
import { useVehicles } from "@/features/logistics/hooks/use-vehicles";
import {
  DRIVER_FORM_DEFAULT_VALUES,
  driverFormSchema,
  type DriverFormSchema,
} from "@/features/logistics/schema/driver-form.schema";
import {
  formatIndianPhoneInput,
  generateEmployeeId,
} from "@/features/logistics/utils/fleet-formatters";
import { INDIAN_STATES } from "@/mock/hub-onboarding";
import { driversService } from "@/services/drivers.service";
import { hubsService } from "@/services/hubs.service";
import type { LogisticsDriver } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDriver?: LogisticsDriver | null;
}

type ReassignWarning = {
  message: string;
  pendingData: DriverFormSchema;
};

function mapLicenseTypeToApi(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/-/g, "_").toUpperCase();
}

function mapLicenseTypeToForm(value?: string): string {
  if (!value) return "";
  const upper = value.toUpperCase();
  if (upper === "LMV_TR") return "LMV-TR";
  if (upper === "TRANSPORT") return "Transport";
  return upper;
}

function mapEmploymentTypeToApi(value?: string): string | undefined {
  if (!value) return undefined;
  const map: Record<string, string> = {
    permanent: "PERMANENT",
    contract: "CONTRACT",
    temporary: "TEMPORARY",
    "third party": "TEMPORARY",
  };
  return map[value.toLowerCase()] ?? value.toUpperCase();
}

function mapEmploymentTypeToForm(value?: string): string {
  if (!value) return "Permanent";
  const map: Record<string, string> = {
    PERMANENT: "Permanent",
    CONTRACT: "Contract",
    TEMPORARY: "Temporary",
  };
  return map[value.toUpperCase()] ?? value;
}

function mapFormStatus(
  status: LogisticsDriver["status"],
): DriverFormSchema["status"] {
  if (status === "on_leave") return "on_leave";
  if (status === "inactive") return "inactive";
  return "available";
}

function driverToFormValues(driver: LogisticsDriver): DriverFormSchema {
  const mobileDigits = driver.mobile.replace(/\D/g, "").slice(-10);
  return {
    name: driver.name,
    employeeId: driver.employeeId,
    mobile: mobileDigits,
    alternatePhone: driver.alternatePhone?.replace(/\D/g, "").slice(-10) ?? "",
    email: driver.email ?? "",
    gender: driver.gender?.toLowerCase() ?? "",
    dob: driver.dob?.slice(0, 10) ?? "",
    bloodGroup: driver.bloodGroup ?? "",
    emergencyContactName: driver.emergencyContactName ?? "",
    emergencyContactNumber:
      driver.emergencyContactNumber?.replace(/\D/g, "").slice(-10) ?? "",
    emergencyContactRelationship: driver.emergencyContactRelationship ?? "",
    address: driver.address ?? "",
    city: driver.city ?? "",
    state: driver.state ?? "",
    pinCode: driver.pinCode ?? "",
    licenseNumber: driver.licenseNumber,
    licenseIssueDate: driver.licenseIssueDate?.slice(0, 10) ?? "",
    licenseExpiry: driver.licenseExpiry?.slice(0, 10) ?? "",
    licenseType: mapLicenseTypeToForm(driver.licenseType),
    licenseIssuingState: driver.licenseIssuingState ?? "",
    joiningDate: driver.joiningDate?.slice(0, 10) ?? "",
    employmentType: mapEmploymentTypeToForm(driver.employmentType),
    assignedWarehouse: driver.assignedWarehouse,
    assignedHub: driver.assignedHub,
    assignedVehicleId: driver.assignedVehicleId ?? "",
    status: mapFormStatus(driver.status),
    shift: driver.shift ?? "Morning",
    aadhaarNumber: driver.aadhaarNumber ?? "",
    panNumber: driver.panNumber ?? "",
    accountHolder: driver.banking?.accountHolder ?? "",
    bankName: driver.banking?.bankName ?? "",
    accountNumber: driver.banking?.accountNumber ?? "",
    ifscCode: driver.banking?.ifscCode ?? "",
    upiId: driver.banking?.upiId ?? "",
    remarks: driver.remarks ?? "",
  };
}

function getApiErrorMessage(err: unknown): string {
  const axiosMsg =
    err && typeof err === "object" && "response" in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      : undefined;
  return (
    axiosMsg || (err instanceof Error ? err.message : "Failed to save driver")
  );
}

export function AddDriverDialog({
  open,
  onOpenChange,
  editDriver,
}: AddDriverDialogProps) {
  const createDriver = useCreateDriver();
  const updateDriverMutation = useUpdateDriver();

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs-for-driver-form"],
    queryFn: () => hubsService.list({ page: 1, limit: 200 }),
    enabled: open,
  });
  const hubs = hubsQuery.data?.data ?? [];
  const warehouseHubs = useMemo(
    () =>
      hubs.filter((h) =>
        String(h.hubType ?? "")
          .toUpperCase()
          .includes("WAREHOUSE"),
      ),
    [hubs],
  );
  const deliveryHubs = useMemo(
    () =>
      hubs.filter(
        (h) =>
          !String(h.hubType ?? "")
            .toUpperCase()
            .includes("WAREHOUSE"),
      ),
    [hubs],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [reassignWarning, setReassignWarning] =
    useState<ReassignWarning | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFiles, setDocFiles] = useState<{
    drivingLicense: File | null;
    aadhaar: File | null;
    pan: File | null;
  }>({
    drivingLicense: null,
    aadhaar: null,
    pan: null,
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DriverFormSchema>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: DRIVER_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const assignedWarehouse = watch("assignedWarehouse");
  const assignedHub = watch("assignedHub");

  const warehouseOptions = useMemo(
    () =>
      (warehouseHubs.length ? warehouseHubs : hubs).map((w) => ({
        value: w.id,
        label: w.name,
      })),
    [warehouseHubs, hubs],
  );

  const hubOptions = useMemo(
    () =>
      (deliveryHubs.length ? deliveryHubs : hubs).map((hub) => ({
        value: hub.id,
        label: hub.name,
      })),
    [deliveryHubs, hubs],
  );

  const vehiclesQuery = useVehicles({
    hubId: assignedHub || undefined,
    limit: 100,
    status: "AVAILABLE",
  });
  const hubVehicles = vehiclesQuery.data?.vehicles ?? [];

  const vehicleOptions = useMemo(() => {
    const opts = hubVehicles.map((v) => ({
      value: v.id,
      label: `${v.vehicleNumber} — ${v.vehicleType}`,
    }));
    if (
      editDriver?.assignedVehicleId &&
      editDriver.assignedVehicleNumber &&
      !opts.some((o) => o.value === editDriver.assignedVehicleId)
    ) {
      opts.unshift({
        value: editDriver.assignedVehicleId,
        label: `${editDriver.assignedVehicleNumber} — Current`,
      });
    }
    return opts;
  }, [hubVehicles, editDriver]);

  useEffect(() => {
    if (!open) return;
    if (editDriver) {
      const warehouseMatch =
        editDriver.warehouseHubId ||
        hubs.find((h) => h.name === editDriver.assignedWarehouse)?.id ||
        editDriver.assignedWarehouse;
      const hubMatch =
        editDriver.hubId ||
        hubs.find((h) => h.name === editDriver.assignedHub)?.id ||
        editDriver.assignedHub;
      reset({
        ...driverToFormValues(editDriver),
        assignedWarehouse: warehouseMatch,
        assignedHub: hubMatch,
      });
    } else if (warehouseOptions.length || hubOptions.length) {
      reset({
        ...DRIVER_FORM_DEFAULT_VALUES,
        employeeId: generateEmployeeId([]),
        assignedWarehouse: warehouseOptions[0]?.value ?? "",
        assignedHub: hubOptions[0]?.value ?? "",
      });
    } else {
      reset({
        ...DRIVER_FORM_DEFAULT_VALUES,
        employeeId: generateEmployeeId([]),
      });
    }
    setActiveStep(1);
    setPhotoFile(null);
    setDocFiles({
      drivingLicense: null,
      aadhaar: null,
      pan: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editDriver, hubs.length]);

  useEffect(() => {
    if (!assignedWarehouse) return;
    const currentHub = watch("assignedHub");
    if (
      hubOptions.length > 0 &&
      !hubOptions.some((h) => h.value === currentHub)
    ) {
      setValue("assignedHub", hubOptions[0]!.value);
    }
  }, [assignedWarehouse, setValue, watch, hubOptions]);

  useEffect(() => {
    const currentVehicle = watch("assignedVehicleId");
    if (
      currentVehicle &&
      vehicleOptions.length > 0 &&
      !vehicleOptions.some((v) => v.value === currentVehicle) &&
      currentVehicle !== editDriver?.assignedVehicleId
    ) {
      setValue("assignedVehicleId", "");
    }
  }, [assignedHub, vehicleOptions, setValue, watch, editDriver]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const sections = DRIVER_FORM_STEPS.map((s) =>
      container.querySelector(`#driver-section-${s.id}`),
    );
    const scrollTop = container.scrollTop + 80;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section && (section as HTMLElement).offsetTop <= scrollTop) {
        setActiveStep(DRIVER_FORM_STEPS[i]!.id);
        break;
      }
    }
  };

  const persistDriver = async (data: DriverFormSchema) => {
    setIsSaving(true);
    try {
      const hubId = data.assignedHub;
      if (!hubId) {
        notify.error("Hub is required");
        return;
      }

      const payload = {
        hubId,
        warehouseHubId: data.assignedWarehouse || null,
        name: data.name,
        phone: data.mobile,
        employeeId: data.employeeId || undefined,
        alternatePhone: data.alternatePhone || undefined,
        email: data.email || undefined,
        gender: data.gender || undefined,
        dateOfBirth: data.dob || undefined,
        bloodGroup: data.bloodGroup || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactNumber: data.emergencyContactNumber || undefined,
        emergencyContactRelationship:
          data.emergencyContactRelationship || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        pinCode: data.pinCode || undefined,
        licenseNumber: data.licenseNumber,
        licenseIssueDate: data.licenseIssueDate || undefined,
        licenseExpiry: data.licenseExpiry,
        licenseType: mapLicenseTypeToApi(data.licenseType),
        licenseIssuingState: data.licenseIssuingState || undefined,
        joiningDate: data.joiningDate || undefined,
        employmentType: mapEmploymentTypeToApi(data.employmentType),
        shift: data.shift || undefined,
        onLeave: data.status === "on_leave",
        isActive: data.status !== "inactive",
        aadhaarNumber: data.aadhaarNumber,
        panNumber: data.panNumber.toUpperCase(),
        bankAccountHolder: data.accountHolder,
        bankName: data.bankName,
        bankAccountNumber: data.accountNumber,
        bankIfscCode: data.ifscCode.toUpperCase(),
        upiId: data.upiId || undefined,
        remarks: data.remarks || undefined,
        vehicleId: data.assignedVehicleId || null,
      };

      let driverId = editDriver?.id;
      if (editDriver) {
        await updateDriverMutation.mutateAsync({
          id: editDriver.id,
          payload,
        });
        notify.success("Driver Updated");
      } else {
        const created = await createDriver.mutateAsync(payload);
        driverId = created.id;
        notify.success("Driver Added Successfully");
      }

      if (driverId) {
        const uploads: Array<Promise<unknown>> = [];
        if (photoFile) {
          uploads.push(
            driversService.uploadDocumentFile(
              driverId,
              "DRIVER_PHOTO",
              photoFile,
            ),
          );
        }
        if (docFiles.drivingLicense) {
          uploads.push(
            driversService.uploadDocumentFile(
              driverId,
              "DRIVING_LICENSE",
              docFiles.drivingLicense,
              data.licenseExpiry,
            ),
          );
        }
        if (docFiles.aadhaar) {
          uploads.push(
            driversService.uploadDocumentFile(
              driverId,
              "AADHAAR",
              docFiles.aadhaar,
            ),
          );
        }
        if (docFiles.pan) {
          uploads.push(
            driversService.uploadDocumentFile(driverId, "PAN", docFiles.pan),
          );
        }
        if (uploads.length) await Promise.allSettled(uploads);
      }

      onOpenChange(false);
      reset(DRIVER_FORM_DEFAULT_VALUES);
    } catch (err: unknown) {
      notify.error("Save failed", getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = (data: DriverFormSchema) => {
    if (data.assignedVehicleId) {
      const vehicle = hubVehicles.find((v) => v.id === data.assignedVehicleId);
      if (
        vehicle?.assignedDriverId &&
        vehicle.assignedDriverId !== editDriver?.id
      ) {
        setReassignWarning({
          message: `Vehicle currently assigned to ${vehicle.assignedDriverName ?? "another driver"}. Reassign vehicle?`,
          pendingData: data,
        });
        return;
      }
    }

    void persistDriver(data);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-4">
            <DialogTitle>
              {editDriver ? "Edit Driver" : "Add Driver"}
            </DialogTitle>
            <FleetFormStepIndicator
              steps={DRIVER_FORM_STEPS}
              activeStep={activeStep}
              className="mt-3"
            />
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 space-y-6 overflow-y-auto px-6 py-4"
            >
              <FleetFormSection
                title="Personal Information"
                id="driver-section-1"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField
                    label="Driver Photo"
                    className="sm:col-span-2"
                  >
                    <FleetFileUpload
                      compact
                      label="Upload photo"
                      accept={{ "image/*": [] }}
                      onFileChange={(f) => setPhotoFile(f)}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Driver Name"
                    required
                    error={errors.name?.message}
                    className="sm:col-span-2"
                  >
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Rajesh Kumar" />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Employee ID" required>
                    <Controller
                      name="employeeId"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} readOnly className="bg-gray-50" />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Phone Number"
                    required
                    error={errors.mobile?.message}
                  >
                    <Controller
                      name="mobile"
                      control={control}
                      render={({ field }) => (
                        <div className="flex">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                            +91
                          </span>
                          <Input
                            className="rounded-l-none"
                            placeholder="98765 43210"
                            value={formatIndianPhoneInput(field.value)}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                          />
                        </div>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Alternate Phone"
                    error={errors.alternatePhone?.message}
                  >
                    <Controller
                      name="alternatePhone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="Optional"
                          value={formatIndianPhoneInput(field.value ?? "")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Email" error={errors.email?.message}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} type="email" placeholder="Optional" />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Gender">
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((g) => (
                              <SelectItem key={g.value} value={g.value}>
                                {g.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Date of Birth">
                    <Controller
                      name="dob"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="Blood Group">
                    <Controller
                      name="bloodGroup"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_GROUP_OPTIONS.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Emergency Contact Name">
                    <Controller
                      name="emergencyContactName"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Emergency Contact Number"
                    error={errors.emergencyContactNumber?.message}
                  >
                    <Controller
                      name="emergencyContactNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="+91"
                          value={formatIndianPhoneInput(field.value ?? "")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Relationship">
                    <Controller
                      name="emergencyContactRelationship"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Address" className="sm:col-span-2">
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="City">
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="State">
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={INDIAN_STATES.map((s) => ({
                            value: s,
                            label: s,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select state"
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="PIN Code"
                    error={errors.pinCode?.message}
                  >
                    <Controller
                      name="pinCode"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} maxLength={6} placeholder="110001" />
                      )}
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection title="Driving License" id="driver-section-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField
                    label="License Number"
                    required
                    error={errors.licenseNumber?.message}
                  >
                    <Controller
                      name="licenseNumber"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="Issue Date">
                    <Controller
                      name="licenseIssueDate"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Expiry Date"
                    required
                    error={errors.licenseExpiry?.message}
                  >
                    <Controller
                      name="licenseExpiry"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="License Type">
                    <Controller
                      name="licenseType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {LICENSE_TYPE_OPTIONS.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Issuing State">
                    <Controller
                      name="licenseIssuingState"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={INDIAN_STATES.map((s) => ({
                            value: s,
                            label: s,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select state"
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Upload Driving License"
                    className="sm:col-span-2"
                  >
                    <FleetFileUpload
                      compact
                      label="Upload license"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({ ...prev, drivingLicense: f }))
                      }
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection title="Employment" id="driver-section-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField label="Joining Date">
                    <Controller
                      name="joiningDate"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="Employment Type">
                    <Controller
                      name="employmentType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EMPLOYMENT_TYPE_OPTIONS.map((e) => (
                              <SelectItem key={e} value={e}>
                                {e}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Assigned Warehouse"
                    required
                    error={errors.assignedWarehouse?.message}
                  >
                    <Controller
                      name="assignedWarehouse"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={warehouseOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select warehouse"
                          searchPlaceholder="Search warehouse..."
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Assigned Hub"
                    required
                    error={errors.assignedHub?.message}
                  >
                    <Controller
                      name="assignedHub"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={hubOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={
                            assignedWarehouse
                              ? "Select hub"
                              : "Select warehouse first"
                          }
                          disabled={!assignedWarehouse}
                          searchPlaceholder="Search hub..."
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Primary Vehicle">
                    <Controller
                      name="assignedVehicleId"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={[
                            { value: "", label: "None" },
                            ...vehicleOptions,
                          ]}
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                          placeholder="Optional"
                          searchPlaceholder="Search vehicle..."
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Driver Status" required>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DRIVER_STATUS_FORM_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Shift">
                    <Controller
                      name="shift"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIFT_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection title="Documents" id="driver-section-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField
                    label="Aadhaar Number"
                    required
                    error={errors.aadhaarNumber?.message}
                  >
                    <Controller
                      name="aadhaarNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          maxLength={12}
                          placeholder="12 digits"
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/\D/g, ""))
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="PAN Number"
                    required
                    error={errors.panNumber?.message}
                  >
                    <Controller
                      name="panNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="ABCDE1234F"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Upload Aadhaar">
                    <FleetFileUpload
                      compact
                      label="Upload Aadhaar"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({ ...prev, aadhaar: f }))
                      }
                    />
                  </FleetFormField>

                  <FleetFormField label="Upload PAN">
                    <FleetFileUpload
                      compact
                      label="Upload PAN"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({ ...prev, pan: f }))
                      }
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection title="Banking" id="driver-section-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField
                    label="Account Holder"
                    required
                    error={errors.accountHolder?.message}
                  >
                    <Controller
                      name="accountHolder"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Bank Name"
                    required
                    error={errors.bankName?.message}
                  >
                    <Controller
                      name="bankName"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Account Number"
                    required
                    error={errors.accountNumber?.message}
                  >
                    <Controller
                      name="accountNumber"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="IFSC Code"
                    required
                    error={errors.ifscCode?.message}
                  >
                    <Controller
                      name="ifscCode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="SBIN0001234"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="UPI ID" className="sm:col-span-2">
                    <Controller
                      name="upiId"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Optional" />
                      )}
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection title="Notes" id="driver-section-6">
                <FleetFormField label="Remarks">
                  <Controller
                    name="remarks"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Additional notes..."
                      />
                    )}
                  />
                </FleetFormField>
              </FleetFormSection>
            </div>

            <DialogFooter className="sticky bottom-0 shrink-0 border-t border-gray-100 bg-white px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!reassignWarning}
        onOpenChange={(o) => !o && setReassignWarning(null)}
        title="Reassign Vehicle?"
        description={reassignWarning?.message}
        confirmLabel="Reassign"
        onConfirm={() => {
          if (reassignWarning) {
            void persistDriver(reassignWarning.pendingData);
            setReassignWarning(null);
          }
        }}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to close?"
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => {
          setCancelConfirmOpen(false);
          reset(DRIVER_FORM_DEFAULT_VALUES);
          onOpenChange(false);
        }}
      />
    </>
  );
}
