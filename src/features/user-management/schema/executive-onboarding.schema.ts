import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;

export const executiveResponsibilitiesSchema = z.object({
  customerRegistration: z.boolean(),
  assignCustomer: z.boolean(),
  takePhoneOrders: z.boolean(),
  orderFollowUp: z.boolean(),
  complaintSupport: z.boolean(),
  orderTracking: z.boolean(),
});

export const executiveDocumentFileSchema = z.object({
  name: z.string(),
  size: z.number(),
  previewUrl: z.string(),
  uploadedAt: z.string(),
});

export const executiveDocumentsSchema = z.object({
  aadhaar: executiveDocumentFileSchema.nullable(),
  pan: executiveDocumentFileSchema.nullable(),
  photo: executiveDocumentFileSchema.nullable(),
  offerLetter: executiveDocumentFileSchema.nullable(),
  previousCompany: executiveDocumentFileSchema.nullable(),
});

export const executiveOnboardingSchema = z.object({
  id: z.string(),
  currentStep: z.number().min(1).max(7),
  createdAt: z.string(),
  updatedAt: z.string(),
  profilePhoto: z.string().nullable(),
  fullName: z.string().min(2, "Full name is required"),
  employeeId: z.string().min(1),
  phone: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email address"),
  dob: z.string(),
  gender: z.enum(["male", "female", "other", ""]),
  executiveType: z.string().min(1),
  branchOffice: z.string().min(1, "Branch office is required"),
  department: z.string().min(1),
  designation: z.string().min(1),
  joiningDate: z.string().min(1, "Joining date is required"),
  reportingHub: z.string().min(1, "Reporting hub is required"),
  reportingHubName: z.string(),
  reportingHubRegion: z.string(),
  reportingHubDepartment: z.string(),
  reportingHubBranch: z.string(),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  zone: z.string().min(1, "Zone is required"),
  assignedHubs: z.array(z.string()).min(1, "Select at least one hub"),
  assignedHubNames: z.array(z.string()),
  estimatedCustomers: z.number(),
  estimatedDailyOrders: z.number(),
  responsibilities: executiveResponsibilitiesSchema,
  username: z.string(),
  tempPassword: z.string(),
  corporateEmail: z.string(),
  sendWelcomeEmail: z.boolean(),
  sendSms: z.boolean(),
  forcePasswordReset: z.boolean(),
  accountActive: z.boolean(),
  credentialsGenerated: z.boolean(),
  documents: executiveDocumentsSchema,
});

export type ExecutiveOnboardingSchema = z.infer<
  typeof executiveOnboardingSchema
>;

export const STEP_1_SCHEMA = executiveOnboardingSchema.pick({
  fullName: true,
  phone: true,
  email: true,
});

export const STEP_2_SCHEMA = executiveOnboardingSchema.pick({
  branchOffice: true,
  joiningDate: true,
  reportingHub: true,
});

export const STEP_3_SCHEMA = executiveOnboardingSchema.pick({
  state: true,
  city: true,
  zone: true,
  assignedHubs: true,
});

export const STEP_4_SCHEMA = executiveOnboardingSchema.pick({
  responsibilities: true,
});

export const STEP_5_SCHEMA = executiveOnboardingSchema
  .pick({
    username: true,
    tempPassword: true,
    credentialsGenerated: true,
  })
  .refine((data) => data.credentialsGenerated, {
    message: "Generate credentials before continuing",
    path: ["credentialsGenerated"],
  });

export const STEP_6_SCHEMA = executiveOnboardingSchema
  .pick({ documents: true })
  .refine(
    (data) =>
      data.documents.aadhaar && data.documents.pan && data.documents.photo,
    {
      message:
        "Upload all required documents (Aadhaar, PAN, Professional Photo)",
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
  7: executiveOnboardingSchema,
} as const;

export const STEP_FIELD_NAMES = {
  1: ["fullName", "phone", "email"] as const,
  2: ["branchOffice", "joiningDate", "reportingHub"] as const,
  3: ["state", "city", "zone", "assignedHubs"] as const,
  4: ["responsibilities"] as const,
  5: ["username", "tempPassword", "credentialsGenerated"] as const,
  6: ["documents"] as const,
  7: [] as const,
} as const;
