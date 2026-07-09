import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;

export const managerPermissionSetSchema = z.object({
  dashboard: z.boolean(),
  inventory: z.boolean(),
  dispatch: z.boolean(),
  drivers: z.boolean(),
  requisition: z.boolean(),
  reports: z.boolean(),
});

export const managerDocumentFileSchema = z.object({
  name: z.string(),
  size: z.number(),
  previewUrl: z.string(),
  uploadedAt: z.string(),
});

export const managerDocumentsSchema = z.object({
  aadhaar: managerDocumentFileSchema.nullable(),
  pan: managerDocumentFileSchema.nullable(),
  offerLetter: managerDocumentFileSchema.nullable(),
  drivingLicense: managerDocumentFileSchema.nullable(),
  policeVerification: managerDocumentFileSchema.nullable(),
  bankDetails: managerDocumentFileSchema.nullable(),
});

export const managerOnboardingSchema = z.object({
  id: z.string(),
  currentStep: z.number().min(1).max(7),
  permissionsSkipped: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  profilePhoto: z.string().nullable(),
  fullName: z.string().min(2, "Full name is required"),
  employeeId: z.string().min(1),
  phone: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email address"),
  dob: z.string(),
  gender: z.enum(["male", "female", "other", ""]),
  address: z.string(),
  employeeType: z.string().min(1, "Employee type is required"),
  department: z.string().min(1, "Department is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  reportingManager: z.string().min(1, "Reporting manager is required"),
  reportingManagerName: z.string(),
  employmentStatus: z.enum(["active", "probation", "notice"]),
  region: z.string().min(1, "Region is required"),
  city: z.string().min(1, "City is required"),
  warehouse: z.string().min(1, "Warehouse is required"),
  hub: z.string().min(1, "Hub is required"),
  hubName: z.string(),
  hubCode: z.string(),
  permissionTemplate: z.enum(["standard", "inventory", "operations", "custom"]),
  permissions: managerPermissionSetSchema,
  username: z.string(),
  temporaryPassword: z.string(),
  sendWelcomeEmail: z.boolean(),
  sendSms: z.boolean(),
  forcePasswordReset: z.boolean(),
  accountActive: z.boolean(),
  credentialsGenerated: z.boolean(),
  documents: managerDocumentsSchema,
});

export type ManagerOnboardingSchema = z.infer<typeof managerOnboardingSchema>;

export const STEP_1_SCHEMA = managerOnboardingSchema.pick({
  fullName: true,
  phone: true,
  email: true,
});

export const STEP_2_SCHEMA = managerOnboardingSchema.pick({
  employeeType: true,
  department: true,
  joiningDate: true,
  reportingManager: true,
});

export const STEP_3_SCHEMA = managerOnboardingSchema.pick({
  region: true,
  city: true,
  warehouse: true,
  hub: true,
});

export const STEP_4_SCHEMA = managerOnboardingSchema.pick({
  permissionTemplate: true,
  permissions: true,
});

export const STEP_5_SCHEMA = managerOnboardingSchema
  .pick({
    username: true,
    temporaryPassword: true,
    credentialsGenerated: true,
  })
  .refine((data) => data.credentialsGenerated, {
    message: "Generate credentials before continuing",
    path: ["credentialsGenerated"],
  });

export const STEP_6_SCHEMA = managerOnboardingSchema
  .pick({ documents: true })
  .refine(
    (data) =>
      data.documents.aadhaar &&
      data.documents.pan &&
      data.documents.offerLetter,
    {
      message: "Upload all required documents (Aadhaar, PAN, Offer Letter)",
      path: ["documents"],
    },
  );

export const STEP_SCHEMAS = {
  1: STEP_1_SCHEMA,
  2: STEP_2_SCHEMA,
  3: STEP_3_SCHEMA,
  4: STEP_4_SCHEMA,
  5: STEP_5_SCHEMA,
  6: STEP_6_SCHEMA,
  7: managerOnboardingSchema,
} as const;

export const STEP_FIELD_NAMES = {
  1: ["fullName", "phone", "email"] as const,
  2: ["employeeType", "department", "joiningDate", "reportingManager"] as const,
  3: ["region", "city", "warehouse", "hub"] as const,
  4: ["permissionTemplate", "permissions"] as const,
  5: ["username", "temporaryPassword", "credentialsGenerated"] as const,
  6: ["documents"] as const,
  7: [] as const,
} as const;
