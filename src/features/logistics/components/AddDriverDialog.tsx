"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
  WAREHOUSE_HUB_MAP,
} from "@/features/logistics/constants/fleet-form.constants";
import { ConfirmDialog } from "@/features/logistics/components/ConfirmDialog";
import {
  FleetFormField,
  FleetFormSection,
} from "@/features/logistics/components/shared/FleetFormField";
import { FleetFileUpload } from "@/features/logistics/components/shared/FleetFileUpload";
import { FleetFormStepIndicator } from "@/features/logistics/components/shared/FleetFormStepIndicator";
import {
  DRIVER_FORM_DEFAULT_VALUES,
  driverFormSchema,
  type DriverFormSchema,
} from "@/features/logistics/schema/driver-form.schema";
import {
  createDocumentMeta,
  createFleetTimelineEvent,
  formatIndianPhoneInput,
  generateEmployeeId,
} from "@/features/logistics/utils/fleet-formatters";
import { INDIAN_STATES } from "@/mock/hub-onboarding";
import { LOGISTICS_WAREHOUSES } from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { LogisticsDriver } from "@/types/logistics.types";
import { formatPhone } from "@/utils/format-phone";
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

function driverToFormValues(driver: LogisticsDriver): DriverFormSchema {
  const mobileDigits = driver.mobile.replace(/\D/g, "").slice(-10);
  return {
    name: driver.name,
    employeeId: driver.employeeId,
    mobile: mobileDigits,
    alternatePhone: driver.alternatePhone?.replace(/\D/g, "").slice(-10) ?? "",
    email: driver.email ?? "",
    gender: driver.gender ?? "",
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
    licenseType: driver.licenseType ?? "",
    licenseIssuingState: driver.licenseIssuingState ?? "",
    joiningDate: driver.joiningDate?.slice(0, 10) ?? "",
    employmentType: driver.employmentType ?? "Permanent",
    assignedWarehouse: driver.assignedWarehouse,
    assignedHub: driver.assignedHub,
    assignedVehicleId: driver.assignedVehicleId ?? "",
    status: driver.status,
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

export function AddDriverDialog({
  open,
  onOpenChange,
  editDriver,
}: AddDriverDialogProps) {
  const vehicles = useLogisticsStore((s) => s.vehicles);
  const drivers = useLogisticsStore((s) => s.drivers);
  const addDriver = useLogisticsStore((s) => s.addDriver);
  const updateDriver = useLogisticsStore((s) => s.updateDriver);
  const reassignVehicleDriver = useLogisticsStore(
    (s) => s.reassignVehicleDriver,
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
    policeVerification: File | null;
    medicalCertificate: File | null;
    profilePhoto: File | null;
  }>({
    drivingLicense: null,
    aadhaar: null,
    pan: null,
    policeVerification: null,
    medicalCertificate: null,
    profilePhoto: null,
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

  const hubOptions = useMemo(
    () =>
      (WAREHOUSE_HUB_MAP[assignedWarehouse] ?? []).map((hub) => ({
        value: hub,
        label: hub,
      })),
    [assignedWarehouse],
  );

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((v) => ({
        value: v.id,
        label: `${v.vehicleNumber} — ${v.vehicleType}`,
      })),
    [vehicles],
  );

  useEffect(() => {
    if (!open) return;
    if (editDriver) {
      reset(driverToFormValues(editDriver));
    } else {
      const employeeId = generateEmployeeId(drivers.map((d) => d.employeeId));
      reset({
        ...DRIVER_FORM_DEFAULT_VALUES,
        employeeId,
        assignedWarehouse: LOGISTICS_WAREHOUSES[0] ?? "",
        assignedHub:
          WAREHOUSE_HUB_MAP[LOGISTICS_WAREHOUSES[0] ?? ""]?.[0] ?? "",
      });
    }
    setActiveStep(1);
    setPhotoFile(null);
    setDocFiles({
      drivingLicense: null,
      aadhaar: null,
      pan: null,
      policeVerification: null,
      medicalCertificate: null,
      profilePhoto: null,
    });
  }, [open, editDriver, reset, drivers]);

  useEffect(() => {
    if (!assignedWarehouse) return;
    const hubs = WAREHOUSE_HUB_MAP[assignedWarehouse] ?? [];
    const currentHub = watch("assignedHub");
    if (hubs.length > 0 && !hubs.includes(currentHub)) {
      setValue("assignedHub", hubs[0]!);
    }
  }, [assignedWarehouse, setValue, watch]);

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

  const persistDriver = (data: DriverFormSchema, reassign = false) => {
    const selectedVehicle = data.assignedVehicleId
      ? vehicles.find((v) => v.id === data.assignedVehicleId)
      : null;

    const photoPreview = photoFile?.type.startsWith("image/")
      ? URL.createObjectURL(photoFile)
      : (editDriver?.photoUrl ?? null);

    const driverData: LogisticsDriver = {
      id: editDriver?.id ?? `ld-${Date.now()}`,
      photoUrl: photoPreview,
      name: data.name,
      employeeId: data.employeeId,
      mobile: formatPhone(data.mobile),
      alternatePhone: data.alternatePhone
        ? formatPhone(data.alternatePhone)
        : undefined,
      email: data.email || undefined,
      gender: data.gender,
      dob: data.dob,
      bloodGroup: data.bloodGroup,
      emergencyContactName: data.emergencyContactName,
      emergencyContactNumber: data.emergencyContactNumber
        ? formatPhone(data.emergencyContactNumber)
        : undefined,
      emergencyContactRelationship: data.emergencyContactRelationship,
      address: data.address,
      city: data.city,
      state: data.state,
      pinCode: data.pinCode,
      licenseNumber: data.licenseNumber,
      licenseIssueDate: data.licenseIssueDate,
      licenseExpiry: data.licenseExpiry,
      licenseType: data.licenseType,
      licenseIssuingState: data.licenseIssuingState,
      joiningDate: data.joiningDate,
      employmentType: data.employmentType,
      assignedHub: data.assignedHub,
      assignedWarehouse: data.assignedWarehouse,
      assignedVehicleId: data.assignedVehicleId || null,
      assignedVehicleNumber: selectedVehicle?.vehicleNumber ?? null,
      tripsToday: editDriver?.tripsToday ?? 0,
      tripsCompleted: editDriver?.tripsCompleted ?? 0,
      aadhaarNumber: data.aadhaarNumber,
      panNumber: data.panNumber.toUpperCase(),
      banking: {
        accountHolder: data.accountHolder,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode.toUpperCase(),
        upiId: data.upiId,
      },
      remarks: data.remarks,
      shift: data.shift,
      documents: {
        drivingLicense: docFiles.drivingLicense
          ? createDocumentMeta(docFiles.drivingLicense)
          : editDriver?.documents?.drivingLicense,
        aadhaar: docFiles.aadhaar
          ? createDocumentMeta(docFiles.aadhaar)
          : editDriver?.documents?.aadhaar,
        pan: docFiles.pan
          ? createDocumentMeta(docFiles.pan)
          : editDriver?.documents?.pan,
        policeVerification: docFiles.policeVerification
          ? createDocumentMeta(docFiles.policeVerification)
          : editDriver?.documents?.policeVerification,
        medicalCertificate: docFiles.medicalCertificate
          ? createDocumentMeta(docFiles.medicalCertificate)
          : editDriver?.documents?.medicalCertificate,
        profilePhoto: docFiles.profilePhoto
          ? createDocumentMeta(docFiles.profilePhoto)
          : editDriver?.documents?.profilePhoto,
      },
      timeline: editDriver?.timeline ?? [
        createFleetTimelineEvent(
          "Driver onboarded",
          `Joined ${data.assignedWarehouse}`,
          "success",
        ),
      ],
      status: data.status,
    };

    if (editDriver) {
      updateDriver(editDriver.id, driverData);
      notify.success("Driver Updated");
    } else {
      addDriver(driverData);
      notify.success("Driver Added Successfully");
    }

    if (data.assignedVehicleId && reassign) {
      reassignVehicleDriver(driverData.id, data.assignedVehicleId);
    } else if (data.assignedVehicleId) {
      reassignVehicleDriver(driverData.id, data.assignedVehicleId);
    }

    onOpenChange(false);
    reset(DRIVER_FORM_DEFAULT_VALUES);
  };

  const onSubmit = (data: DriverFormSchema) => {
    if (data.assignedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === data.assignedVehicleId);
      if (
        vehicle?.assignedDriverId &&
        vehicle.assignedDriverId !== editDriver?.id
      ) {
        const currentDriver = drivers.find(
          (d) => d.id === vehicle.assignedDriverId,
        );
        setReassignWarning({
          message: `Vehicle currently assigned to ${currentDriver?.name ?? "another driver"}. Reassign vehicle?`,
          pendingData: data,
        });
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      persistDriver(data, true);
      setIsSaving(false);
    }, 400);
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
                      onFileChange={(f) => {
                        setPhotoFile(f);
                        setDocFiles((prev) => ({ ...prev, profilePhoto: f }));
                      }}
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
                          options={LOGISTICS_WAREHOUSES.map((w) => ({
                            value: w,
                            label: w,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select warehouse"
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
                          placeholder="Select hub"
                          disabled={!assignedWarehouse}
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

                  <FleetFormField label="Police Verification">
                    <FleetFileUpload
                      compact
                      label="Upload verification"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({
                          ...prev,
                          policeVerification: f,
                        }))
                      }
                    />
                  </FleetFormField>

                  <FleetFormField label="Medical Certificate">
                    <FleetFileUpload
                      compact
                      label="Upload certificate"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({
                          ...prev,
                          medicalCertificate: f,
                        }))
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
            persistDriver(reassignWarning.pendingData, true);
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
