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
  FUEL_TYPE_OPTIONS,
  MANUFACTURER_OPTIONS,
  PERMIT_TYPE_OPTIONS,
  VEHICLE_CAPACITY_OPTIONS,
  VEHICLE_FORM_STEPS,
  VEHICLE_STATUS_FORM_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
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
  VEHICLE_FORM_DEFAULT_VALUES,
  vehicleFormSchema,
  type VehicleFormSchema,
} from "@/features/logistics/schema/vehicle-form.schema";
import {
  createDocumentMeta,
  createFleetTimelineEvent,
  formatIndianPhoneInput,
  formatVehicleNumber,
} from "@/features/logistics/utils/fleet-formatters";
import { LOGISTICS_WAREHOUSES } from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { LogisticsVehicle } from "@/types/logistics.types";
import { formatPhone } from "@/utils/format-phone";
import { notify } from "@/utils/notify";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editVehicle?: LogisticsVehicle | null;
}

type ReassignWarning = {
  type: "driver" | "vehicle";
  message: string;
  pendingData: VehicleFormSchema;
};

function vehicleToFormValues(vehicle: LogisticsVehicle): VehicleFormSchema {
  return {
    vehicleNumber: vehicle.vehicleNumber,
    vehicleType: vehicle.vehicleType,
    capacityLabel: vehicle.capacityLabel ?? `${vehicle.capacityKg / 1000} Ton`,
    payloadKg: vehicle.capacityKg,
    fuelType: vehicle.fuelType,
    manufacturer: vehicle.manufacturer ?? "",
    model: vehicle.model ?? "",
    yearOfManufacture: vehicle.yearOfManufacture,
    assignedWarehouse: vehicle.assignedWarehouse,
    assignedHub: vehicle.assignedHub,
    assignedDriverId: vehicle.assignedDriverId ?? "",
    status:
      vehicle.status === "running" || vehicle.status === "loading"
        ? "assigned"
        : vehicle.status === "inactive"
          ? "inactive"
          : vehicle.status === "maintenance"
            ? "maintenance"
            : vehicle.status === "assigned"
              ? "assigned"
              : "available",
    registrationDate: vehicle.registrationDate?.slice(0, 10) ?? "",
    fitnessExpiry: vehicle.fitnessExpiry?.slice(0, 10) ?? "",
    insuranceExpiry: vehicle.insuranceExpiry?.slice(0, 10) ?? "",
    pollutionExpiry: vehicle.pollutionExpiry?.slice(0, 10) ?? "",
    permitType: vehicle.permitType ?? "",
    permitExpiry: vehicle.permitExpiry?.slice(0, 10) ?? "",
    currentOdometer: vehicle.currentOdometer,
    gpsInstalled: vehicle.gpsInstalled ? "yes" : "no",
    fastagNumber: vehicle.fastagNumber ?? "",
    vehicleColor: vehicle.vehicleColor ?? "",
    emergencyContact: vehicle.emergencyContact ?? "",
    remarks: vehicle.remarks ?? "",
  };
}

export function AddVehicleDialog({
  open,
  onOpenChange,
  editVehicle,
}: AddVehicleDialogProps) {
  const vehicles = useLogisticsStore((s) => s.vehicles);
  const drivers = useLogisticsStore((s) => s.drivers);
  const addVehicle = useLogisticsStore((s) => s.addVehicle);
  const updateVehicle = useLogisticsStore((s) => s.updateVehicle);
  const reassignVehicleDriver = useLogisticsStore(
    (s) => s.reassignVehicleDriver,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [reassignWarning, setReassignWarning] =
    useState<ReassignWarning | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [docFiles, setDocFiles] = useState<{
    rc: File | null;
    insurance: File | null;
    fitness: File | null;
  }>({ rc: null, insurance: null, fitness: null });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VehicleFormSchema>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: VEHICLE_FORM_DEFAULT_VALUES,
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

  const driverOptions = useMemo(
    () =>
      drivers.map((d) => ({
        value: d.id,
        label: `${d.name} (${d.employeeId})`,
      })),
    [drivers],
  );

  useEffect(() => {
    if (!open) return;
    if (editVehicle) {
      reset(vehicleToFormValues(editVehicle));
    } else {
      reset({
        ...VEHICLE_FORM_DEFAULT_VALUES,
        assignedWarehouse: LOGISTICS_WAREHOUSES[0] ?? "",
        assignedHub:
          WAREHOUSE_HUB_MAP[LOGISTICS_WAREHOUSES[0] ?? ""]?.[0] ?? "",
      });
    }
    setActiveStep(1);
    setDocFiles({ rc: null, insurance: null, fitness: null });
  }, [open, editVehicle, reset]);

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
    const sections = VEHICLE_FORM_STEPS.map((s) =>
      container.querySelector(`#vehicle-section-${s.id}`),
    );
    const scrollTop = container.scrollTop + 80;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section && (section as HTMLElement).offsetTop <= scrollTop) {
        setActiveStep(VEHICLE_FORM_STEPS[i]!.id);
        break;
      }
    }
  };

  const persistVehicle = (data: VehicleFormSchema, reassign = false) => {
    const selectedDriver = data.assignedDriverId
      ? drivers.find((d) => d.id === data.assignedDriverId)
      : null;

    const vehicleData: LogisticsVehicle = {
      id: editVehicle?.id ?? `lv-${Date.now()}`,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      capacityKg: data.payloadKg,
      capacityLabel: data.capacityLabel,
      assignedWarehouse: data.assignedWarehouse,
      assignedHub: data.assignedHub,
      assignedDriverId: data.assignedDriverId || null,
      assignedDriverName: selectedDriver?.name ?? null,
      currentShipmentId: editVehicle?.currentShipmentId ?? null,
      fuelType: data.fuelType,
      manufacturer: data.manufacturer,
      model: data.model,
      yearOfManufacture: data.yearOfManufacture,
      registrationDate: data.registrationDate ?? "",
      insuranceExpiry: data.insuranceExpiry,
      fitnessExpiry: data.fitnessExpiry,
      pollutionExpiry: data.pollutionExpiry,
      permitType: data.permitType,
      permitExpiry: data.permitExpiry,
      currentOdometer: data.currentOdometer,
      gpsInstalled: data.gpsInstalled === "yes",
      fastagNumber: data.fastagNumber,
      vehicleColor: data.vehicleColor,
      emergencyContact: data.emergencyContact
        ? formatPhone(data.emergencyContact.replace(/\D/g, "").slice(-10))
        : undefined,
      remarks: data.remarks,
      lastMaintenanceDate: editVehicle?.lastMaintenanceDate,
      photoUrl: editVehicle?.photoUrl ?? null,
      documents: {
        rc: docFiles.rc
          ? createDocumentMeta(docFiles.rc)
          : editVehicle?.documents?.rc,
        insurance: docFiles.insurance
          ? createDocumentMeta(docFiles.insurance)
          : editVehicle?.documents?.insurance,
        fitness: docFiles.fitness
          ? createDocumentMeta(docFiles.fitness)
          : editVehicle?.documents?.fitness,
      },
      timeline: editVehicle?.timeline ?? [
        createFleetTimelineEvent(
          "Vehicle registered in fleet",
          `Added to ${data.assignedWarehouse}`,
          "success",
        ),
      ],
      status: data.status,
    };

    if (editVehicle) {
      updateVehicle(editVehicle.id, vehicleData);
      notify.success("Changes Saved", "Vehicle updated successfully.");
    } else {
      addVehicle(vehicleData);
      notify.success("Vehicle Added Successfully");
    }

    if (data.assignedDriverId && reassign) {
      reassignVehicleDriver(data.assignedDriverId, vehicleData.id);
    } else if (data.assignedDriverId) {
      reassignVehicleDriver(data.assignedDriverId, vehicleData.id);
    }

    onOpenChange(false);
    reset(VEHICLE_FORM_DEFAULT_VALUES);
  };

  const onSubmit = (data: VehicleFormSchema) => {
    const duplicate = vehicles.find(
      (v) =>
        v.vehicleNumber.toUpperCase() === data.vehicleNumber.toUpperCase() &&
        v.id !== editVehicle?.id,
    );
    if (duplicate) {
      notify.error("Vehicle number already exists");
      return;
    }

    if (data.assignedDriverId) {
      const driver = drivers.find((d) => d.id === data.assignedDriverId);
      if (
        driver?.assignedVehicleId &&
        driver.assignedVehicleId !== editVehicle?.id
      ) {
        setReassignWarning({
          type: "driver",
          message: `This driver is already assigned to Vehicle ${driver.assignedVehicleNumber}. Do you want to reassign?`,
          pendingData: data,
        });
        return;
      }
    }

    if (
      editVehicle?.assignedDriverId &&
      data.assignedDriverId !== editVehicle.assignedDriverId
    ) {
      const currentVehicle = vehicles.find((v) => v.id === editVehicle.id);
      if (
        currentVehicle?.assignedDriverId &&
        data.assignedDriverId &&
        currentVehicle.assignedDriverId !== data.assignedDriverId
      ) {
        // handled above via driver check
      }
    }

    const vehicleWithDriver = vehicles.find(
      (v) =>
        v.assignedDriverId === data.assignedDriverId &&
        v.id !== editVehicle?.id &&
        data.assignedDriverId,
    );
    if (vehicleWithDriver && data.assignedDriverId) {
      const driver = drivers.find((d) => d.id === data.assignedDriverId);
      setReassignWarning({
        type: "vehicle",
        message: `Vehicle currently assigned to ${driver?.name ?? "another driver"}. Reassign vehicle?`,
        pendingData: data,
      });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      persistVehicle(data, true);
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
              {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </DialogTitle>
            <FleetFormStepIndicator
              steps={VEHICLE_FORM_STEPS}
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
                title="Basic Vehicle Information"
                id="vehicle-section-1"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField
                    label="Vehicle Number"
                    required
                    error={errors.vehicleNumber?.message}
                    className="sm:col-span-2"
                  >
                    <Controller
                      name="vehicleNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="HR-55-AN-1024"
                          onChange={(e) =>
                            field.onChange(formatVehicleNumber(e.target.value))
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Vehicle Type"
                    required
                    error={errors.vehicleType?.message}
                  >
                    <Controller
                      name="vehicleType"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={VEHICLE_TYPE_OPTIONS.map((t) => ({
                            value: t,
                            label: t,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select type"
                          searchPlaceholder="Search vehicle type..."
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Capacity"
                    required
                    error={errors.capacityLabel?.message}
                  >
                    <Controller
                      name="capacityLabel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            if (!v) return;
                            field.onChange(v);
                            const cap = VEHICLE_CAPACITY_OPTIONS.find(
                              (c) => c.label === v,
                            );
                            if (cap) setValue("payloadKg", cap.kg);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select capacity" />
                          </SelectTrigger>
                          <SelectContent>
                            {VEHICLE_CAPACITY_OPTIONS.map((c) => (
                              <SelectItem key={c.label} value={c.label}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Payload (Kg)"
                    required
                    error={errors.payloadKg?.message}
                  >
                    <Controller
                      name="payloadKg"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Fuel Type"
                    required
                    error={errors.fuelType?.message}
                  >
                    <Controller
                      name="fuelType"
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
                            {FUEL_TYPE_OPTIONS.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Manufacturer">
                    <Controller
                      name="manufacturer"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={MANUFACTURER_OPTIONS.map((m) => ({
                            value: m,
                            label: m,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select manufacturer"
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Model">
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Model name" />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Year of Manufacture">
                    <Controller
                      name="yearOfManufacture"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          placeholder="2024"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      )}
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection title="Assignment" id="vehicle-section-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField
                    label="Warehouse"
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
                          searchPlaceholder="Search warehouse..."
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Hub"
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

                  <FleetFormField label="Assigned Driver">
                    <Controller
                      name="assignedDriverId"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          options={[
                            { value: "", label: "None" },
                            ...driverOptions,
                          ]}
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                          placeholder="Optional"
                          searchPlaceholder="Search driver..."
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Vehicle Availability" required>
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
                            {VEHICLE_STATUS_FORM_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection
                title="Registration & Compliance"
                id="vehicle-section-3"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField label="Registration Date">
                    <Controller
                      name="registrationDate"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Fitness Certificate Expiry"
                    required
                    error={errors.fitnessExpiry?.message}
                  >
                    <Controller
                      name="fitnessExpiry"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Insurance Expiry"
                    required
                    error={errors.insuranceExpiry?.message}
                  >
                    <Controller
                      name="insuranceExpiry"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="Pollution Certificate Expiry">
                    <Controller
                      name="pollutionExpiry"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="Permit Type">
                    <Controller
                      name="permitType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select permit" />
                          </SelectTrigger>
                          <SelectContent>
                            {PERMIT_TYPE_OPTIONS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Permit Expiry">
                    <Controller
                      name="permitExpiry"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </FleetFormField>

                  <FleetFormField label="RC Upload" className="sm:col-span-2">
                    <FleetFileUpload
                      compact
                      label="Upload RC"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({ ...prev, rc: f }))
                      }
                    />
                  </FleetFormField>

                  <FleetFormField label="Insurance Upload">
                    <FleetFileUpload
                      compact
                      label="Upload Insurance"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({ ...prev, insurance: f }))
                      }
                    />
                  </FleetFormField>

                  <FleetFormField label="Fitness Certificate Upload">
                    <FleetFileUpload
                      compact
                      label="Upload Fitness"
                      accept={{ "application/pdf": [], "image/*": [] }}
                      onFileChange={(f) =>
                        setDocFiles((prev) => ({ ...prev, fitness: f }))
                      }
                    />
                  </FleetFormField>
                </div>
              </FleetFormSection>

              <FleetFormSection
                title="Operational Details"
                id="vehicle-section-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FleetFormField label="Current Odometer (KM)">
                    <Controller
                      name="currentOdometer"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          placeholder="45000"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="GPS Installed">
                    <Controller
                      name="gpsInstalled"
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
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Fastag Number">
                    <Controller
                      name="fastagNumber"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Optional" />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Vehicle Color">
                    <Controller
                      name="vehicleColor"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="White" />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField
                    label="Emergency Contact"
                    error={errors.emergencyContact?.message}
                    className="sm:col-span-2"
                  >
                    <Controller
                      name="emergencyContact"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="+91 98765 43210"
                          onChange={(e) =>
                            field.onChange(
                              formatIndianPhoneInput(e.target.value),
                            )
                          }
                        />
                      )}
                    />
                  </FleetFormField>

                  <FleetFormField label="Remarks" className="sm:col-span-2">
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
                </div>
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
            persistVehicle(reassignWarning.pendingData, true);
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
          reset(VEHICLE_FORM_DEFAULT_VALUES);
          onOpenChange(false);
        }}
      />
    </>
  );
}
