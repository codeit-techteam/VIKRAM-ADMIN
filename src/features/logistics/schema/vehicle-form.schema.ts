import { z } from "zod";

import { phoneSchema } from "@/utils/validation";

const futureDateSchema = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(isFutureDateValue, `${label} must be a future date`);

function isFutureDateValue(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

export const vehicleFormSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, "Vehicle number is required")
    .regex(
      /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/,
      "Enter a valid Indian vehicle number (e.g. HR-55-AN-1024)",
    ),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  capacityLabel: z.string().min(1, "Capacity is required"),
  payloadKg: z
    .number({ message: "Payload must be a number" })
    .positive("Capacity must be positive"),
  fuelType: z.string().min(1, "Fuel type is required"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  yearOfManufacture: z.number().optional(),
  assignedWarehouse: z.string().min(1, "Warehouse is required"),
  assignedHub: z.string().min(1, "Hub is required"),
  assignedDriverId: z.string().optional(),
  status: z.enum(["available", "assigned", "maintenance", "inactive"]),
  registrationDate: z.string().optional(),
  fitnessExpiry: futureDateSchema("Fitness expiry"),
  insuranceExpiry: futureDateSchema("Insurance expiry"),
  pollutionExpiry: z.string().optional(),
  permitType: z.string().optional(),
  permitExpiry: z.string().optional(),
  currentOdometer: z.number().nonnegative().optional(),
  gpsInstalled: z.enum(["yes", "no"]),
  fastagNumber: z.string().optional(),
  vehicleColor: z.string().optional(),
  emergencyContact: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        phoneSchema.safeParse(val.replace(/\D/g, "").slice(-10)).success,
      "Enter a valid emergency contact number",
    ),
  remarks: z.string().optional(),
});

export type VehicleFormSchema = z.infer<typeof vehicleFormSchema>;

export const VEHICLE_FORM_DEFAULT_VALUES: VehicleFormSchema = {
  vehicleNumber: "",
  vehicleType: "",
  capacityLabel: "",
  payloadKg: 0,
  fuelType: "Diesel",
  manufacturer: "",
  model: "",
  yearOfManufacture: undefined,
  assignedWarehouse: "",
  assignedHub: "",
  assignedDriverId: "",
  status: "available",
  registrationDate: "",
  fitnessExpiry: "",
  insuranceExpiry: "",
  pollutionExpiry: "",
  permitType: "",
  permitExpiry: "",
  currentOdometer: undefined,
  gpsInstalled: "no",
  fastagNumber: "",
  vehicleColor: "",
  emergencyContact: "",
  remarks: "",
};
