import type {
  BulkDeliveryRequirement,
  BulkFollowUp,
  BulkFollowUpStatus,
  BulkInternalNote,
  BulkProcurementDashboardStats,
  BulkProcurementRequest,
  BulkProcurementStatus,
  BulkQuotation,
  BulkQuotationStatus,
  BulkTimelineEvent,
} from "@/features/bulk-procurement/types";
import { customerExecutiveService } from "@/services/customerExecutive";
import { formatCurrency } from "@/utils/format-currency";

/** Cum / Cubic Metres → Cubic Meter (IndiaMART traditional RMC unit). */
function normalizeVolumeUnit(unit: string): string {
  const key = unit.trim().toLowerCase();
  if (
    key === "cum" ||
    key === "cubic metre" ||
    key === "cubic metres" ||
    key === "cubic meters" ||
    key === "cubic meter"
  ) {
    return "Cubic Meter";
  }
  return unit.trim() || "Units";
}

export const BULK_PROCUREMENT_PAGE_SIZE = 10;

export type BulkStatusFilter = "all" | BulkProcurementStatus;

export type BulkQuickFilter =
  | "all"
  | "open"
  | "assigned"
  | "inProgress"
  | "completed"
  | "cancelled"
  | "pipeline";

export interface BulkProcurementFilters {
  search: string;
  status: BulkStatusFilter;
  quickFilter: BulkQuickFilter;
}

export const EMPTY_BULK_PROCUREMENT_FILTERS: BulkProcurementFilters = {
  search: "",
  status: "all",
  quickFilter: "all",
};

export interface BulkProcurementQueryParams {
  page: number;
  limit: number;
  filters: BulkProcurementFilters;
}

export interface BulkProcurementQueryResult {
  data: BulkProcurementRequest[];
  total: number;
  totalPages: number;
  page: number;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function formatPipelineDisplay(
  quotedPipeline: number | null | undefined,
  estimatedPipeline: number | null | undefined,
): string {
  if (quotedPipeline != null && quotedPipeline > 0) {
    return formatCurrency(quotedPipeline);
  }
  if (estimatedPipeline != null && estimatedPipeline > 0) {
    return formatCurrency(estimatedPipeline);
  }
  return "Awaiting Quote";
}

function resolveStatus(raw: string): BulkProcurementStatus {
  const status = raw.toUpperCase() as BulkProcurementStatus;
  const valid: BulkProcurementStatus[] = [
    "NEW",
    "ASSIGNED",
    "CONTACTED",
    "IN_PROGRESS",
    "QUOTE_PREPARED",
    "QUOTE_SENT",
    "QUOTED",
    "NEGOTIATION",
    "CONVERTED",
    "ORDER_CREATED",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
    "EXPIRED",
  ];
  return valid.includes(status) ? status : "NEW";
}

function mapTimeline(raw: Record<string, unknown>): BulkTimelineEvent[] {
  return asArray(raw.activities).map((item, index) => {
    const activity = asRecord(item);
    return {
      id: asString(activity.id, `activity-${index}`),
      type: asString(activity.type, "STATUS_CHANGED"),
      title: asString(activity.type, "Activity").replaceAll("_", " "),
      description: asString(activity.message),
      date: asString(activity.createdAt, new Date().toISOString()),
      actor: asString(activity.performedBy) || undefined,
    };
  });
}

function mapFollowUps(raw: Record<string, unknown>): BulkFollowUp[] {
  return asArray(raw.followUps).map((item, index) => {
    const row = asRecord(item);
    return {
      id: asString(row.id, `followup-${index}`),
      followUpAt: asString(row.followUpAt),
      note: asString(row.note),
      status: asString(row.status, "PENDING") as BulkFollowUpStatus,
      createdByName: row.createdByName != null ? asString(row.createdByName) : null,
      completedAt: row.completedAt != null ? asString(row.completedAt) : null,
      createdAt: asString(row.createdAt, new Date().toISOString()),
    };
  });
}

function mapNotes(raw: Record<string, unknown>): BulkInternalNote[] {
  return asArray(raw.internalNotes).map((item, index) => {
    const row = asRecord(item);
    return {
      id: asString(row.id, `note-${index}`),
      note: asString(row.note),
      createdByName: row.createdByName != null ? asString(row.createdByName) : null,
      createdAt: asString(row.createdAt, new Date().toISOString()),
    };
  });
}

function mapQuotations(raw: Record<string, unknown>): BulkQuotation[] {
  return asArray(raw.quotations).map((item, index) => {
    const row = asRecord(item);
    return {
      id: asString(row.id, `quote-${index}`),
      quotationNumber: asString(row.quotationNumber),
      status: asString(row.status, "DRAFT") as BulkQuotationStatus,
      materialLabel: asString(row.materialLabel),
      quantity: asNumber(row.quantity) ?? 0,
      unit: normalizeVolumeUnit(asString(row.unit, "Units")),
      unitPrice: asNumber(row.unitPrice) ?? 0,
      deliveryCharge: asNumber(row.deliveryCharge) ?? 0,
      gstPercent: asNumber(row.gstPercent) ?? 18,
      discountAmount: asNumber(row.discountAmount) ?? 0,
      subtotal: asNumber(row.subtotal) ?? 0,
      gstAmount: asNumber(row.gstAmount) ?? 0,
      totalAmount: asNumber(row.totalAmount) ?? 0,
      productId: row.productId != null ? asString(row.productId) : null,
      notes: row.notes != null ? asString(row.notes) : null,
      validUntil: row.validUntil != null ? asString(row.validUntil) : null,
      sentAt: row.sentAt != null ? asString(row.sentAt) : null,
      acceptedAt: row.acceptedAt != null ? asString(row.acceptedAt) : null,
      rejectedAt: row.rejectedAt != null ? asString(row.rejectedAt) : null,
      createdAt: asString(row.createdAt, new Date().toISOString()),
    };
  });
}

function materialQuantities(
  raw: Record<string, unknown>,
): Array<{ name: string; quantity: number; unit: string }> {
  const categories = asArray(raw.materialCategoriesJson).length
    ? asArray(raw.materialCategoriesJson)
    : asArray(raw.materialCategories);

  return categories
    .map((item) => {
      const rec = asRecord(item);
      const quantity = asNumber(rec.quantity);
      const unit = asString(rec.unit);
      const name = asString(rec.name);
      if (quantity == null || quantity <= 0 || !unit) return null;
      return { name, quantity, unit: normalizeVolumeUnit(unit) };
    })
    .filter(
      (line): line is { name: string; quantity: number; unit: string } =>
        line != null,
    );
}

function materialLabel(raw: Record<string, unknown>): string {
  const isMixed = raw.isMixedLoad === true;
  const categories = asArray(raw.materialCategoriesJson).length
    ? asArray(raw.materialCategoriesJson)
    : asArray(raw.materialCategories);

  if (isMixed || categories.length > 1) {
    const names = categories
      .map((item) => asString(asRecord(item).name))
      .filter(Boolean);
    if (names.length) {
      return names.length === 1
        ? names[0]
        : `Mixed Load (${names.join(", ")})`;
    }
    if (isMixed) return "Mixed Load";
  }

  return (
    asString(raw.materialCategoryName) ||
    asString(raw.materialTypeLabel) ||
    asString(raw.productType) ||
    "Material"
  );
}

export function mapBulkEnquiry(
  rawInput: Record<string, unknown>,
): BulkProcurementRequest {
  const raw = asRecord(rawInput);
  const customer = asRecord(raw.customer);
  const profile = asRecord(customer.profile);
  const executiveUser = asRecord(raw.assignedExecutiveUser);

  const estimatedValue = asNumber(raw.estimatedValue);
  const quotedValue = asNumber(raw.quotedValue);
  const quantity = asNumber(raw.expectedQuantity) ?? 0;
  const unit = normalizeVolumeUnit(asString(raw.expectedUnit, "Units"));
  const materialLines = materialQuantities(raw);
  const quantityLabel =
    materialLines.length > 0
      ? materialLines
          .map((line) =>
            line.name
              ? `${line.quantity} ${line.unit} ${line.name}`
              : `${line.quantity} ${line.unit}`,
          )
          .join(", ")
      : `${quantity} ${unit}`;

  const customerName =
    asString(raw.customerNameSnapshot) ||
    asString(customer.fullName) ||
    "Customer";
  const customerPhone =
    asString(raw.customerPhoneSnapshot) || asString(customer.phone);
  const company =
    asString(raw.companyName) ||
    asString(profile.companyName) ||
    "—";

  const assignedExecutiveName =
    asString(executiveUser.fullName) ||
    asString(raw.assignedExecutive) ||
    null;

  return {
    id: asString(raw.id),
    enquiryNumber: asString(raw.enquiryNumber) || asString(raw.id).slice(0, 8),
    company,
    customerId: asString(raw.customerId || customer.id),
    customerName,
    customerPhone,
    customerEmail:
      asString(raw.customerEmailSnapshot) || asString(customer.email) || null,
    project: asString(raw.projectName) || "—",
    projectLocation: asString(raw.location) || "—",
    material: materialLabel(raw),
    quantity,
    unit,
    quantityLabel,
    materialLines,
    deliveryRequirement: raw.deliveryRequirement
      ? (asString(raw.deliveryRequirement) as BulkDeliveryRequirement)
      : null,
    deliveryDate: raw.deliveryDate != null ? asString(raw.deliveryDate) : null,
    status: resolveStatus(asString(raw.status, "NEW")),
    assignedExecutiveId:
      raw.assignedExecutiveId != null
        ? asString(raw.assignedExecutiveId)
        : executiveUser.id
          ? asString(executiveUser.id)
          : null,
    assignedExecutiveName,
    estimatedValue,
    quotedValue,
    pipelineDisplay: formatPipelineDisplay(quotedValue, estimatedValue),
    remarks: raw.remarks != null ? asString(raw.remarks) : null,
    additionalNotes:
      raw.additionalNotes != null ? asString(raw.additionalNotes) : null,
    preferredContact:
      raw.preferredContact != null ? asString(raw.preferredContact) : null,
    convertedOrderId:
      raw.convertedOrderId != null ? asString(raw.convertedOrderId) : null,
    addressId: raw.addressId != null ? asString(raw.addressId) : null,
    city: raw.city != null ? asString(raw.city) : null,
    state: raw.state != null ? asString(raw.state) : null,
    pincode: raw.pincode != null ? asString(raw.pincode) : null,
    createdAt: asString(raw.createdAt, new Date().toISOString()),
    updatedAt: asString(raw.updatedAt, new Date().toISOString()),
    timeline: mapTimeline(raw),
    followUps: mapFollowUps(raw),
    internalNotes: mapNotes(raw),
    quotations: mapQuotations(raw),
  };
}

function statusForQuickFilter(
  quickFilter: BulkQuickFilter,
): string | undefined {
  switch (quickFilter) {
    case "open":
      return "NEW";
    case "assigned":
      return "ASSIGNED";
    case "inProgress":
      return "IN_PROGRESS";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return undefined;
  }
}

export async function getBulkProcurementRequests(
  params: BulkProcurementQueryParams,
): Promise<BulkProcurementQueryResult> {
  const { filters } = params;
  const statusFromQuick = statusForQuickFilter(filters.quickFilter);
  const status =
    filters.quickFilter !== "all" &&
    filters.quickFilter !== "pipeline" &&
    statusFromQuick
      ? statusFromQuick
      : filters.status !== "all"
        ? filters.status
        : undefined;

  const result = await customerExecutiveService.getBulkEnquiries({
    page: params.page,
    limit: params.limit,
    search: filters.search.trim() || undefined,
    status,
  });

  const data = result.data.map((row) => mapBulkEnquiry(row));
  const total = result.meta?.total ?? data.length;
  const totalPages = Math.max(1, result.meta?.totalPages ?? 1);
  const page = result.meta?.page ?? params.page;

  return { data, total, totalPages, page };
}

export async function getBulkProcurementStats(): Promise<BulkProcurementDashboardStats> {
  const raw = await customerExecutiveService.getBulkStats();
  const estimatedPipeline = asNumber(raw.estimatedPipeline) ?? 0;
  const quotedPipeline = asNumber(raw.quotedPipeline) ?? 0;

  return {
    openRequests: asNumber(raw.openRequests) ?? 0,
    assigned: asNumber(raw.assigned) ?? 0,
    inProgress: asNumber(raw.inProgress) ?? 0,
    completed: asNumber(raw.completed) ?? 0,
    cancelled: asNumber(raw.cancelled) ?? 0,
    estimatedPipeline,
    quotedPipeline,
    convertedValue: asNumber(raw.convertedValue) ?? 0,
    awaitingQuoteCount:
      asNumber(raw.awaitingQuoteCount) ?? undefined,
    pipelineDisplay: formatPipelineDisplay(quotedPipeline, estimatedPipeline),
  };
}

export async function getBulkProcurementById(
  id: string,
): Promise<BulkProcurementRequest | null> {
  try {
    const raw = await customerExecutiveService.getBulkEnquiryById(id);
    return mapBulkEnquiry(raw);
  } catch {
    return null;
  }
}

export async function getLatestBulkLeads(limit = 5) {
  const result = await customerExecutiveService.getBulkEnquiries({
    page: 1,
    limit,
    status: "NEW",
  });
  return result.data.map((row) => mapBulkEnquiry(row));
}

export async function updateBulkProcurementStatus(
  id: string,
  status: string,
  remarks?: string,
) {
  return customerExecutiveService.updateBulkStatus(id, status, remarks);
}

export async function assignBulkProcurement(
  id: string,
  payload: { executiveId?: string; assignedExecutive?: string },
) {
  return customerExecutiveService.assignBulkEnquiry(id, payload);
}

export async function addBulkFollowUp(
  id: string,
  payload: { followUpAt: string; note: string },
) {
  return customerExecutiveService.addBulkFollowUp(id, payload);
}

export async function updateBulkFollowUpStatus(
  id: string,
  followUpId: string,
  status: string,
) {
  return customerExecutiveService.updateBulkFollowUpStatus(
    id,
    followUpId,
    status,
  );
}

export async function addBulkNote(id: string, note: string) {
  return customerExecutiveService.addBulkNote(id, note);
}

export async function createBulkQuotation(
  id: string,
  payload: {
    materialLabel: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    deliveryCharge?: number;
    gstPercent?: number;
    discountAmount?: number;
    productId?: string;
    notes?: string;
    validUntil?: string;
  },
) {
  return customerExecutiveService.createBulkQuotation(id, payload);
}

export async function updateBulkQuotationStatus(
  id: string,
  quotationId: string,
  status: string,
) {
  return customerExecutiveService.updateBulkQuotationStatus(
    id,
    quotationId,
    status,
  );
}

export async function convertBulkEnquiry(
  id: string,
  payload?: { productId?: string; addressId?: string; quotationId?: string },
) {
  return customerExecutiveService.convertBulkEnquiry(id, payload);
}

export async function rejectBulkEnquiry(id: string, remarks?: string) {
  return customerExecutiveService.rejectBulkEnquiry(id, remarks);
}

export async function cancelBulkEnquiry(id: string, remarks?: string) {
  return customerExecutiveService.cancelBulkEnquiry(id, remarks);
}
