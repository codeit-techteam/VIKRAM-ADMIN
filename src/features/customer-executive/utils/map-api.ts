import type { CatalogProduct } from "@/services/catalog.service";
import type {
  ActivityType,
  CeActivity,
  CeComplaint,
  CeCustomer,
  CeDashboardStats,
  CeExecutiveProfile,
  CeOrder,
  CePayment,
  CeProduct,
  ComplaintPriority,
  ComplaintStatus,
  CustomerStatus,
  CustomerType,
  LinkStatus,
  PaymentStatus,
} from "@/features/customer-executive/types";
import {
  mapBackendOrderToCeOrder,
  type BackendAdminOrder,
} from "@/features/customer-executive/utils/map-backend-order";

export type SupportTicketReason =
  | "LATE_DELIVERY"
  | "WRONG_PRODUCT"
  | "DAMAGED_MATERIAL"
  | "OTHER";

export type ApiPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CE";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function mapCustomerType(value?: string | null): CustomerType {
  const slug = (value ?? "").toUpperCase();
  if (slug.includes("BUILDER")) return "BUILDER";
  if (slug.includes("DEALER")) return "DEALER";
  if (slug.includes("ARCHITECT")) return "ARCHITECT";
  if (slug.includes("INDIVIDUAL")) return "INDIVIDUAL";
  return "CONTRACTOR";
}

function mapCustomerStatus(
  status?: string | null,
  isMember?: boolean,
): CustomerStatus {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "SUSPENDED" || normalized === "INACTIVE") {
    return "INACTIVE";
  }
  if (normalized === "VIP" || isMember) return "VIP";
  return "ACTIVE";
}

type ApiAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address?: string | null;
};

function formatAddress(address?: ApiAddress | null): string {
  if (!address) return "";
  return [address.line1 ?? address.address, address.line2, address.city]
    .filter(Boolean)
    .join(", ");
}

export function mapApiCustomer(raw: Record<string, unknown>): CeCustomer {
  const profile = (raw.profile as Record<string, unknown> | null | undefined) ?? {};
  const role = (raw.role as Record<string, unknown> | null | undefined) ?? {};
  const defaultAddress =
    (raw.defaultAddress as ApiAddress | null | undefined) ??
    ((raw.addresses as ApiAddress[] | undefined)?.[0] ?? null);

  const name =
    (raw.fullName as string | null | undefined) ??
    (raw.name as string | null | undefined) ??
    "Customer";

  const company =
    (profile.companyName as string | null | undefined) ??
    (raw.company as string | null | undefined) ??
    "";

  const lastOrder =
    (raw.lastOrderAt as string | undefined) ??
    (raw.lastOrderDate as string | undefined) ??
    ((raw.orders as Array<{ createdAt?: string }> | undefined)?.[0]?.createdAt);

  const assignedHub =
    (raw.assignedHub as { id?: string; name?: string } | undefined) ?? null;

  const count = raw._count as { orders?: number } | undefined;

  return {
    id: String(raw.id ?? ""),
    name,
    company,
    phone: String(raw.phone ?? ""),
    email: String(raw.email ?? ""),
    gst:
      (profile.gstNumber as string | null | undefined) ??
      (raw.gst as string | null | undefined) ??
      undefined,
    city: String(defaultAddress?.city ?? raw.city ?? ""),
    state: String(defaultAddress?.state ?? raw.state ?? ""),
    pincode: String(defaultAddress?.pincode ?? raw.pincode ?? ""),
    address:
      formatAddress(defaultAddress) ||
      String(profile.registeredAddress ?? raw.address ?? ""),
    customerType: mapCustomerType(
      (role.slug as string | undefined) ??
        (raw.customerType as string | undefined),
    ),
    status: mapCustomerStatus(
      raw.status as string | undefined,
      Boolean(raw.isMember),
    ),
    assignedExecutiveId: String(
      raw.assignedExecutiveId ??
        (raw.assignedExecutive as { id?: string } | undefined)?.id ??
        "",
    ),
    assignedHubId: String(
      raw.assignedHubId ?? assignedHub?.id ?? "",
    ),
    assignedHubName:
      (raw.assignedHubName as string | undefined) ?? assignedHub?.name,
    creditLimit: toNumber(raw.creditLimit ?? profile.creditLimit),
    lifetimePurchase: toNumber(
      raw.lifetimePurchase ?? raw.totalSpent ?? raw.ordersTotal ?? 0,
    ),
    createdAt: toIso(raw.createdAt),
    lastOrderAt: lastOrder,
    lastLoginAt:
      (raw.lastLogin as string | undefined) ??
      (raw.lastLoginAt as string | undefined) ??
      undefined,
    orderCount: toNumber(raw.orders ?? count?.orders ?? raw.orderCount),
    adminNotes:
      (profile.adminNotes as string | null | undefined) ??
      (raw.adminNotes as string | undefined) ??
      undefined,
    isMember: Boolean(raw.isMember),
  };
}

export function mapApiProduct(product: CatalogProduct): CeProduct {
  const variants = (product.variants ?? [])
    .filter((variant) => variant.isActive !== false)
    .map((variant) => ({
      id: variant.id,
      label:
        variant.label ||
        [variant.value, variant.size != null ? `${variant.size}${variant.sizeUnit ?? ""}` : null]
          .filter(Boolean)
          .join(" ") ||
        "Default",
      sku: variant.sku ?? product.sku ?? product.id.slice(0, 8).toUpperCase(),
      unit: variant.displayUnit ?? variant.unit ?? product.unit ?? "Unit",
      unitPrice: toNumber(variant.price ?? variant.sellingPrice ?? product.retailPrice ?? 0),
      inStock: variant.inStock !== false && toNumber(variant.stock) !== 0,
    }));

  const defaultVariant =
    variants.find((variant) => variant.id === product.defaultVariantId) ??
    variants[0];
  const imageUrl =
    product.images?.find((img) => img.isPrimary)?.url ??
    product.images?.[0]?.url;

  return {
    id: product.id,
    sku: product.sku ?? product.id.slice(0, 8).toUpperCase(),
    name: product.name,
    unit: defaultVariant?.unit ?? product.unit ?? "Unit",
    unitPrice: defaultVariant?.unitPrice ?? toNumber(product.retailPrice ?? 0),
    imageUrl,
    category: product.category?.name ?? "Uncategorized",
    variants,
  };
}

export function mapApiOrder(raw: Record<string, unknown>): CeOrder {
  return mapBackendOrderToCeOrder(raw as unknown as BackendAdminOrder);
}

function mapLinkStatus(status?: string | null): LinkStatus {
  switch ((status ?? "").toUpperCase()) {
    case "SENT":
      return "SENT";
    case "OPENED":
      return "OPENED";
    case "EXPIRED":
      return "EXPIRED";
    case "CREATED":
    default:
      return "NOT_SENT";
  }
}

function mapPaymentStatus(status?: string | null): PaymentStatus {
  switch ((status ?? "PENDING").toUpperCase()) {
    case "PAID":
      return "PAID";
    case "COLLECTED":
      return "COLLECTED";
    case "PARTIAL":
    case "PARTIALLY_PAID":
      return "PARTIAL";
    case "EXPIRED":
      return "EXPIRED";
    default:
      return "PENDING";
  }
}

export function mapApiPayment(raw: Record<string, unknown>): CePayment {
  const customer = (raw.customer as Record<string, unknown> | null) ?? {};
  const latestLink =
    (raw.latestPaymentLink as Record<string, unknown> | null) ?? null;
  const amount = toNumber(raw.amount ?? raw.grandTotal ?? 0);
  const paidAmount =
    mapPaymentStatus(raw.paymentStatus as string | undefined) === "PAID"
      ? amount
      : toNumber(raw.paidAmount ?? 0);

  return {
    id: String(raw.orderId ?? raw.id ?? ""),
    orderId: String(raw.orderId ?? raw.id ?? ""),
    orderNumber: String(raw.orderNumber ?? ""),
    customerId: String(customer.id ?? raw.customerId ?? ""),
    customerName: String(customer.fullName ?? raw.customerName ?? "Customer"),
    customerPhone: String(customer.phone ?? raw.customerPhone ?? ""),
    amount,
    paidAmount,
    status: mapPaymentStatus(raw.paymentStatus as string | undefined),
    dueDate: toIso(
      raw.dueDate ??
        latestLink?.expiresAt ??
        raw.createdAt ??
        new Date(Date.now() + 7 * 86400000),
    ),
    linkStatus: mapLinkStatus(latestLink?.status as string | undefined),
    linkSentAt: latestLink?.sentAt
      ? toIso(latestLink.sentAt)
      : undefined,
    reminderCount: toNumber(latestLink?.reminderCount ?? raw.reminderCount ?? 0),
    paymentLink: latestLink?.paymentUrl as string | undefined,
    createdAt: toIso(raw.createdAt),
  };
}

function mapTicketStatus(status?: string | null): ComplaintStatus {
  switch ((status ?? "OPEN").toUpperCase()) {
    case "RESOLVED":
    case "CLOSED":
      return "RESOLVED";
    case "IN_PROGRESS":
    case "ASSIGNED":
    case "WAITING_FOR_CUSTOMER":
    case "WAITING_FOR_ADMIN":
      return "IN_PROGRESS";
    case "REOPENED":
      return "ESCALATED";
    default:
      return "OPEN";
  }
}

function mapTicketPriority(priority?: string | null): ComplaintPriority {
  switch ((priority ?? "MEDIUM").toUpperCase()) {
    case "LOW":
      return "LOW";
    case "HIGH":
      return "HIGH";
    case "CRITICAL":
      return "CRITICAL";
    default:
      return "MEDIUM";
  }
}

function mapReasonToIssueType(reason?: string | null): string {
  switch ((reason ?? "").toUpperCase()) {
    case "LATE_DELIVERY":
      return "Delivery Delay";
    case "DAMAGED_MATERIAL":
      return "Damaged Goods";
    case "WRONG_PRODUCT":
      return "Product Inquiry";
    default:
      return "Invoice Issue";
  }
}

export function mapIssueTypeToReason(issueType: string): SupportTicketReason {
  const normalized = issueType.toLowerCase();
  if (normalized.includes("delivery") || normalized.includes("delay")) {
    return "LATE_DELIVERY";
  }
  if (normalized.includes("damage")) {
    return "DAMAGED_MATERIAL";
  }
  if (normalized.includes("product") || normalized.includes("wrong")) {
    return "WRONG_PRODUCT";
  }
  return "OTHER";
}

export function mapComplaintStatusToApi(
  status: ComplaintStatus,
): "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "ASSIGNED" {
  switch (status) {
    case "RESOLVED":
      return "RESOLVED";
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "ESCALATED":
      return "ASSIGNED";
    default:
      return "OPEN";
  }
}

export function mapApiComplaint(raw: Record<string, unknown>): CeComplaint {
  const customer = (raw.customer as Record<string, unknown> | null) ?? {};
  const order = (raw.order as Record<string, unknown> | null) ?? {};
  const notes = Array.isArray(raw.notes) ? raw.notes : [];

  return {
    id: String(raw.id ?? ""),
    ticketNumber: String(raw.ticketNumber ?? raw.id ?? ""),
    customerId: String(raw.customerId ?? customer.id ?? ""),
    customerName: String(customer.fullName ?? raw.customerName ?? "Customer"),
    company: String(
      (customer.profile as { companyName?: string } | undefined)?.companyName ??
        raw.company ??
        "",
    ),
    orderId: (raw.orderId as string | undefined) ?? (order.id as string | undefined),
    orderNumber: order.orderNumber as string | undefined,
    issue: String(raw.description ?? raw.subject ?? ""),
    issueType: mapReasonToIssueType(raw.reason as string | undefined),
    priority: mapTicketPriority(raw.priority as string | undefined),
    status: mapTicketStatus(raw.status as string | undefined),
    assignedExecutiveId: String(raw.assignedToId ?? raw.assignedExecutiveId ?? ""),
    createdAt: toIso(raw.createdAt),
    resolvedAt: raw.resolvedAt ? toIso(raw.resolvedAt) : undefined,
    internalNotes: notes.map((note, index) => {
      const n = note as Record<string, unknown>;
      const admin = (n.admin as Record<string, unknown> | null) ?? {};
      return {
        id: String(n.id ?? `note-${index}`),
        customerId: String(raw.customerId ?? customer.id ?? ""),
        content: String(n.body ?? n.content ?? ""),
        createdAt: toIso(n.createdAt),
        createdBy: String(admin.fullName ?? n.createdBy ?? "Executive"),
      };
    }),
    timeline: [],
  };
}

function mapActivityType(type?: string | null): ActivityType {
  switch ((type ?? "").toUpperCase()) {
    case "ORDER":
      return "ORDER_CREATED";
    case "TICKET":
      return "COMPLAINT_RAISED";
    case "REGISTRATION":
      return "CUSTOMER_REGISTERED";
    case "PAYMENT":
      return "PAYMENT_RECEIVED";
    case "PAYMENT_LINK_SENT":
      return "PAYMENT_LINK_SENT";
    case "COMPLAINT_RESOLVED":
      return "COMPLAINT_RESOLVED";
    case "NOTE_ADDED":
      return "NOTE_ADDED";
    default:
      return "ORDER_CREATED";
  }
}

export function mapApiActivity(raw: Record<string, unknown>): CeActivity {
  const type = mapActivityType(raw.type as string | undefined);
  return {
    id: String(raw.id ?? ""),
    type,
    title: String(raw.title ?? "Activity"),
    description: String(raw.description ?? ""),
    customerId: raw.customerId as string | undefined,
    orderId: raw.orderId as string | undefined,
    paymentId: raw.paymentId as string | undefined,
    complaintId: raw.complaintId as string | undefined,
    createdAt: toIso(raw.createdAt),
    createdBy: raw.createdBy as string | undefined,
  };
}

export function mapApiDashboardStats(raw: Record<string, unknown>): CeDashboardStats {
  return {
    assignedCustomers: toNumber(raw.assignedCustomers),
    openComplaints: toNumber(raw.openComplaints),
    pendingPayments: toNumber(raw.pendingPayments),
    pendingPaymentsAmount: toNumber(raw.pendingPaymentsAmount),
    avgResolutionHours: toNumber(raw.avgResolutionHours),
  };
}

export function mapAuthUserToExecutive(user: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedHubId?: string | null;
  assignedHubName?: string | null;
  isActive?: boolean;
}): CeExecutiveProfile {
  return {
    id: user.id,
    name: user.name,
    role: "Customer Executive",
    email: user.email,
    phone: user.phone ?? "",
    shift: "Day Shift",
    avatarInitials: initialsFromName(user.name),
    assignedHubId: user.assignedHubId,
    assignedHubName: user.assignedHubName,
    isActive: user.isActive,
  };
}

export function mapPaginationMeta(
  meta?: Partial<ApiPaginationMeta> | null,
  fallbackPage = 1,
  fallbackLimit = 10,
): ApiPaginationMeta {
  const page = meta?.page ?? fallbackPage;
  const limit = meta?.limit ?? fallbackLimit;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / limit));

  return { page, limit, total, totalPages };
}

export function mapPaymentMethodToApi(
  method: string,
): "CASH" | "MANUAL" {
  return method === "CASH" ? "CASH" : "MANUAL";
}
