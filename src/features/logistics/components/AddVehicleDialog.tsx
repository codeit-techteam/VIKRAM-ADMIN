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
  FUEL_TYPE_OPTIONS,
  MANUFACTURER_OPTIONS,
  PERMIT_TYPE_OPTIONS,
  VEHICLE_CAPACITY_OPTIONS,
  VEHICLE_FORM_STEPS,
  VEHICLE_STATUS_FORM_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from "@/features/logistics/constants/fleet-form.constants";
import { ConfirmDialog } from "@/features/logistics/components/ConfirmDialog";
import {
  FleetFormField,
  FleetFormSection,
} from "@/features/logistics/components/shared/FleetFormField";
import { FleetFileUpload } from "@/features/logistics/components/shared/FleetFileUpload";
import { FleetFormStepIndicator } from "@/features/logistics/components/shared/FleetFormStepIndicator";
import {
  useCreateVehicle,
  useUpdateVehicle,
} from "@/features/logistics/hooks/use-vehicles";
import {
  VEHICLE_FORM_DEFAULT_VALUES,
  vehicleFormSchema,
  type VehicleFormSchema,
} from "@/features/logistics/schema/vehicle-form.schema";
import {
  formatIndianPhoneInput,
  formatVehicleNumber,
} from "@/features/logistics/utils/fleet-formatters";
import {
  mapUiStatusToApi,
  mapVehicleTypeToApi,
  parseCapacityTons,
} from "@/features/logistics/utils/vehicle-api.mapper";
import { hubsService } from "@/services/hubs.service";
import { vehiclesService } from "@/services/vehicles.service";
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
  const drivers = useLogisticsStore((s) => s.drivers);
  const createVehicle = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs-for-vehicle-form"],
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
      const warehouseMatch =
        hubs.find((h) => h.name === editVehicle.assignedWarehouse)?.id ??
        editVehicle.assignedWarehouse;
      const hubMatch =
        hubs.find((h) => h.name === editVehicle.assignedHub)?.id ??
        editVehicle.assignedHub;
      reset({
        ...vehicleToFormValues(editVehicle),
        assignedWarehouse: warehouseMatch,
        assignedHub: hubMatch,
      });
    } else if (warehouseOptions.length || hubOptions.length) {
      reset({
        ...VEHICLE_FORM_DEFAULT_VALUES,
        assignedWarehouse: warehouseOptions[0]?.value ?? "",
        assignedHub: hubOptions[0]?.value ?? "",
      });
    }
    setActiveStep(1);
    setDocFiles({ rc: null, insurance: null, fitness: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editVehicle, hubs.length]);

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

  const persistVehicle = async (data: VehicleFormSchema) => {
    setIsSaving(true);
    try {
      const hubId = data.assignedHub;
      if (!hubId) {
        notify.error("Hub is required");
        return;
      }

      const payload = {
        registration: data.vehicleNumber.toUpperCase(),
        hubId,
        warehouseHubId: data.assignedWarehouse || null,
        capacity: parseCapacityTons(data.capacityLabel, data.payloadKg),
        payloadKg: data.payloadKg,
        vehicleType: mapVehicleTypeToApi(data.vehicleType),
        vehicleCategory: data.vehicleType,
        fuelType: data.fuelType,
        manufacturer: data.manufacturer || undefined,
        model: data.model || undefined,
        manufactureYear: data.yearOfManufacture,
        vehicleColor: data.vehicleColor || undefined,
        fastagNumber: data.fastagNumber || undefined,
        odometerKm: data.currentOdometer,
        emergencyContact: data.emergencyContact
          ? formatPhone(data.emergencyContact.replace(/\D/g, "").slice(-10))
          : undefined,
        remarks: data.remarks || undefined,
        registrationDate: data.registrationDate || undefined,
        insuranceExpiry: data.insuranceExpiry,
        fitnessExpiry: data.fitnessExpiry,
        pucExpiry: data.pollutionExpiry || undefined,
        permitType: data.permitType || undefined,
        permitExpiry: data.permitExpiry || undefined,
        status: mapUiStatusToApi(data.status),
        assignedDriverId: data.assignedDriverId || null,
      };

      let vehicleId = editVehicle?.id;
      if (editVehicle) {
        await updateVehicleMutation.mutateAsync({
          id: editVehicle.id,
          payload,
        });
        notify.success("Changes Saved", "Vehicle updated successfully.");
      } else {
        const created = await createVehicle.mutateAsync(payload);
        vehicleId = created.id;
        notify.success("Vehicle Added Successfully");
      }

      if (vehicleId) {
        const uploads: Array<Promise<unknown>> = [];
        if (docFiles.rc) {
          uploads.push(
            vehiclesService.uploadDocumentFile(vehicleId, "RC", docFiles.rc),
          );
        }
        if (docFiles.insurance) {
          uploads.push(
            vehiclesService.uploadDocumentFile(
              vehicleId,
              "INSURANCE",
              docFiles.insurance,
              data.insuranceExpiry,
            ),
          );
        }
        if (docFiles.fitness) {
          uploads.push(
            vehiclesService.uploadDocumentFile(
              vehicleId,
              "FITNESS",
              docFiles.fitness,
              data.fitnessExpiry,
            ),
          );
        }
        if (uploads.length) await Promise.allSettled(uploads);
      }

      onOpenChange(false);
      reset(VEHICLE_FORM_DEFAULT_VALUES);
    } catch (err: unknown) {
      const axiosMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      notify.error(
        "Save failed",
        axiosMsg || (err instanceof Error ? err.message : "Failed to save vehicle"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = (data: VehicleFormSchema) => {
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
    void persistVehicle(data);
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
            void persistVehicle(reassignWarning.pendingData);
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
