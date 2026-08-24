import { customerExecutiveService } from "@/services/customerExecutive";
import type {
  ExpertCallbackRequest,
  ExpertCallbackStats,
  ExpertCallbackStatus,
} from "@/features/expert-callbacks/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function mapCallback(raw: Record<string, unknown>): ExpertCallbackRequest {
  const customer = (raw.customer ?? {}) as Record<string, unknown>;
  const assigned = raw.assignedExecutive as Record<string, unknown> | null | undefined;

  return {
    id: asString(raw.id),
    contactName: asString(raw.contactName),
    needs: asString(raw.needs),
    phoneSnapshot: asNullableString(raw.phoneSnapshot),
    categorySlug: asNullableString(raw.categorySlug),
    categoryName: asNullableString(raw.categoryName),
    status: asString(raw.status, "NEW") as ExpertCallbackStatus,
    executiveNotes: asNullableString(raw.executiveNotes),
    contactedAt: asNullableString(raw.contactedAt),
    closedAt: asNullableString(raw.closedAt),
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt),
    customer: {
      id: asString(customer.id),
      phone: asString(customer.phone),
      fullName: asNullableString(customer.fullName),
    },
    assignedExecutive: assigned
      ? {
          id: asString(assigned.id),
          fullName: asString(assigned.fullName),
        }
      : null,
  };
}

export async function getExpertCallbacks(params: {
  page: number;
  limit: number;
  q?: string;
  status?: ExpertCallbackStatus | "all";
}): Promise<{
  data: ExpertCallbackRequest[];
  total: number;
  totalPages: number;
  stats: ExpertCallbackStats;
}> {
  const result = await customerExecutiveService.getExpertCallbacks({
    page: params.page,
    limit: params.limit,
    q: params.q?.trim() || undefined,
    status: params.status && params.status !== "all" ? params.status : undefined,
  });

  const stats = result.stats ?? {
    total: result.meta.total,
    new: 0,
    contacted: 0,
    closed: 0,
  };

  return {
    data: (result.data ?? []).map((row) =>
      mapCallback(row as Record<string, unknown>),
    ),
    total: result.meta.total,
    totalPages: result.meta.totalPages,
    stats: {
      total: Number(stats.total ?? 0),
      new: Number(stats.new ?? 0),
      contacted: Number(stats.contacted ?? 0),
      closed: Number(stats.closed ?? 0),
    },
  };
}

export async function updateExpertCallbackStatus(
  id: string,
  payload: { status?: ExpertCallbackStatus; executiveNotes?: string },
): Promise<ExpertCallbackRequest> {
  const raw = await customerExecutiveService.updateExpertCallback(id, payload);
  return mapCallback(raw);
}
