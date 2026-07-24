import { z } from "zod";

const weekDaySchema = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

const deliverySlotSchema = z.enum(["morning", "afternoon", "evening", "night"]);

const managerPermissionSchema = z.enum([
  "orders",
  "inventory",
  "dispatch",
  "drivers",
  "reports",
  "payments",
  "requisitions",
]);

export const hubInventorySkuSchema = z.object({
  id: z.string(),
  materialId: z.string(),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  sku: z.string(),
  category: z.string(),
  productName: z.string(),
  variant: z.string(),
  unit: z.string(),
  openingStock: z.number().min(0),
  reorderLevel: z.number().min(0),
  safetyStock: z.number().min(0),
  maxStock: z.number().min(0),
  selected: z.boolean(),
});

export const hubFormSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  currentStep: z.number().min(1).max(6),
  assignee: z.string(),
  basic: z.object({
    hubName: z.string().min(2, "Hub name is required"),
    hubCode: z.string().min(1, "Hub code is required"),
    hubType: z.enum([
      "regional-hub",
      "distribution-center",
      "dark-store",
      "micro-hub",
      "cross-dock",
    ]),
    capacityTier: z.enum(["small", "medium", "large", "custom"]),
    customCapacityMt: z.number().min(0),
    openingDate: z.string().min(1, "Opening date is required"),
    isActive: z.boolean(),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    detailedAddress: z.string().min(5, "Detailed address is required"),
    coverageRadiusKm: z.number().min(1).max(100),
    linkedWarehouseId: z.string().min(1),
    linkedWarehouseName: z.string().min(1),
    fulfillmentPriority: z.enum(["P1", "P2", "P3"]),
    workingDays: z
      .array(weekDaySchema)
      .min(1, "Select at least one working day"),
    shiftStart: z.string().min(1),
    shiftEnd: z.string().min(1),
    latitude: z.number(),
    longitude: z.number(),
  }),
  inventory: z.object({
    skus: z.array(hubInventorySkuSchema),
  }),
  warehouse: z.object({
    warehouseId: z.string().min(1),
    warehouseName: z.string().min(1),
    distanceKm: z.number().min(0),
    transferTimeMins: z.number().min(0),
    priority: z.enum(["Tier 1", "Tier 2", "Tier 3"]),
    autoRestocking: z.boolean(),
    restockThresholdPercent: z.number().min(1).max(100),
    emergencyReplenishment: z.boolean(),
    allowedCategories: z.array(z.string()),
    contacts: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
        availability: z.enum(["on-duty", "off-duty"]),
        phone: z.string().optional(),
      }),
    ),
  }),
  manager: z
    .object({
      mode: z.enum(["existing", "create"]),
      existingManagerId: z.string(),
      fullName: z.string(),
      employeeId: z.string(),
      phone: z.string(),
      email: z.string(),
      permissions: z.array(managerPermissionSchema).min(1),
      credentialsGenerated: z.boolean(),
      generatedUsername: z.string().optional(),
      generatedPassword: z.string().optional(),
      sendWhatsAppWelcome: z.boolean(),
    })
    .superRefine((manager, ctx) => {
      if (!manager.fullName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Manager name is required",
          path: ["fullName"],
        });
      }
      if (!manager.employeeId.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employee ID / username is required",
          path: ["employeeId"],
        });
      }
      if (!/^\d{10}$/.test(manager.phone.replace(/\s+/g, ""))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid 10-digit mobile number",
          path: ["phone"],
        });
      }
      if (!manager.email.includes("@")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid corporate email",
          path: ["email"],
        });
      }
      if (!manager.credentialsGenerated) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Generate login credentials before continuing",
          path: ["credentialsGenerated"],
        });
      }
    }),
  fleet: z.object({
    drivers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          phone: z.string(),
          licenseNo: z.string(),
          vehicleType: z.string().optional(),
          avatarInitials: z.string(),
        }),
      )
      .min(1, "Assign at least one driver"),
    vehicles: z
      .array(
        z.object({
          id: z.string(),
          vehicleType: z.string(),
          regNumber: z.string(),
          status: z.enum(["active", "idle", "maintenance"]),
        }),
      )
      .min(1, "Assign at least one vehicle"),
    deliverySlots: z
      .array(deliverySlotSchema)
      .min(1, "Select at least one delivery slot"),
  }),
  coverage: z.object({
    radiusKm: z.number().min(1, "Service area is required"),
    mode: z.enum(["radius", "polygon", "pincode"]),
    pincodes: z.array(z.string()),
    polygonPoints: z.array(z.object({ x: z.number(), y: z.number() })),
    estimatedCustomers: z.number(),
    nearbyHubs: z.number(),
    nearbyHubLabel: z.string(),
    conflictPercent: z.number(),
    conflictHubName: z.string(),
    avgTransitMins: z.number(),
    peakDelayMins: z.number(),
    fuelEfficiency: z.enum(["high", "medium", "low"]),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export type HubFormSchema = z.infer<typeof hubFormSchema>;

export const STEP_SCHEMAS = {
  1: hubFormSchema.pick({ basic: true }).superRefine((data, ctx) => {
    if (!data.basic.hubName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hub name is required",
        path: ["basic", "hubName"],
      });
    }
  }),
  2: hubFormSchema.pick({ inventory: true }).superRefine((data, ctx) => {
    const selected = data.inventory.skus.filter((sku) => sku.selected);
    if (selected.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one SKU",
        path: ["inventory", "skus"],
      });
    }
  }),
  3: hubFormSchema.pick({ manager: true }),
  4: hubFormSchema.pick({ fleet: true }),
  5: hubFormSchema.pick({ coverage: true }).superRefine((data, ctx) => {
    if (data.coverage.radiusKm < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Define a service area",
        path: ["coverage", "radiusKm"],
      });
    }
  }),
} as const;

export const STEP_FIELD_NAMES = {
  1: [
    "basic.hubName",
    "basic.hubCode",
    "basic.openingDate",
    "basic.state",
    "basic.city",
    "basic.pincode",
    "basic.detailedAddress",
    "basic.workingDays",
  ],
  2: ["inventory.skus"],
  3: [
    "manager.fullName",
    "manager.employeeId",
    "manager.phone",
    "manager.email",
    "manager.credentialsGenerated",
  ],
  4: ["fleet.drivers", "fleet.vehicles", "fleet.deliverySlots"],
  5: ["coverage.radiusKm", "coverage.pincodes"],
} as const;
