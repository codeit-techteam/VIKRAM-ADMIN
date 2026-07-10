import { z } from "zod";

import { phoneSchema, pincodeSchema } from "@/utils/validation";

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

const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN (e.g. ABCDE1234F)");

const ifscSchema = z
  .string()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code");

const aadhaarSchema = z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits");

export const driverFormSchema = z.object({
  name: z.string().min(2, "Driver name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  mobile: phoneSchema,
  alternatePhone: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        phoneSchema.safeParse(val.replace(/\D/g, "").slice(-10)).success,
      "Enter a valid alternate phone number",
    ),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  gender: z.string().optional(),
  dob: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        phoneSchema.safeParse(val.replace(/\D/g, "").slice(-10)).success,
      "Enter a valid emergency contact number",
    ),
  emergencyContactRelationship: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || pincodeSchema.safeParse(val).success,
      "Enter a valid 6-digit PIN code",
    ),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseIssueDate: z.string().optional(),
  licenseExpiry: futureDateSchema("License expiry"),
  licenseType: z.string().optional(),
  licenseIssuingState: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentType: z.string().optional(),
  assignedWarehouse: z.string().min(1, "Warehouse is required"),
  assignedHub: z.string().min(1, "Hub is required"),
  assignedVehicleId: z.string().optional(),
  status: z.enum(["available", "driving", "on_leave", "inactive"]),
  shift: z.string().optional(),
  aadhaarNumber: aadhaarSchema,
  panNumber: panSchema,
  accountHolder: z.string().min(1, "Account holder name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: ifscSchema,
  upiId: z.string().optional(),
  remarks: z.string().optional(),
});

export type DriverFormSchema = z.infer<typeof driverFormSchema>;

export const DRIVER_FORM_DEFAULT_VALUES: DriverFormSchema = {
  name: "",
  employeeId: "",
  mobile: "",
  alternatePhone: "",
  email: "",
  gender: "",
  dob: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  emergencyContactRelationship: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  licenseNumber: "",
  licenseIssueDate: "",
  licenseExpiry: "",
  licenseType: "",
  licenseIssuingState: "",
  joiningDate: "",
  employmentType: "Permanent",
  assignedWarehouse: "",
  assignedHub: "",
  assignedVehicleId: "",
  status: "available",
  shift: "Morning",
  aadhaarNumber: "",
  panNumber: "",
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  remarks: "",
};
