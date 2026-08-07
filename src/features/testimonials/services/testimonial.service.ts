import type {
  CustomerTestimonial,
  TestimonialDashboardStats,
  TestimonialStatus,
  TestimonialType,
} from "@/features/testimonials/types/testimonial.types";
import {
  testimonialsService,
  toUiTestimonial,
  type CreateTestimonialPayload,
} from "@/services/cms-testimonials.service";

export type { CreateTestimonialPayload };
export type {
  CustomerTestimonial,
  TestimonialDashboardStats,
  TestimonialStatus,
  TestimonialType,
};

export const TESTIMONIAL_PAGE_SIZE = 8;

export type TestimonialTypeFilter = "all" | TestimonialType;
export type TestimonialStatusFilter = "all" | TestimonialStatus;

export interface TestimonialFilters {
  search: string;
  type: TestimonialTypeFilter;
  status: TestimonialStatusFilter;
}

export const EMPTY_TESTIMONIAL_FILTERS: TestimonialFilters = {
  search: "",
  type: "all",
  status: "all",
};

export interface TestimonialQueryParams {
  page: number;
  limit: number;
  filters: TestimonialFilters;
}

export interface TestimonialQueryResult {
  data: CustomerTestimonial[];
  total: number;
  totalPages: number;
  page: number;
}

function applyClientFilters(
  items: CustomerTestimonial[],
  filters: TestimonialFilters,
): CustomerTestimonial[] {
  let result = [...items];

  if (filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.customerName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.review.toLowerCase().includes(q),
    );
  }

  return result;
}

/** GET /admin/testimonials */
export async function getTestimonials(
  params: TestimonialQueryParams,
): Promise<TestimonialQueryResult> {
  const typeParam =
    params.filters.type !== "all" ? params.filters.type : undefined;

  // When status/search filters are applied client-side, fetch a wider page then slice.
  const needsClientFilter =
    params.filters.status !== "all" || Boolean(params.filters.search.trim());

  if (needsClientFilter) {
    const { data } = await testimonialsService.listForUi({
      page: 1,
      limit: 200,
      type: typeParam,
    });
    const filtered = applyClientFilters(data, params.filters);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / params.limit));
    const page = Math.min(params.page, totalPages);
    const start = (page - 1) * params.limit;

    return {
      data: filtered.slice(start, start + params.limit),
      total,
      totalPages,
      page,
    };
  }

  return testimonialsService.listForUi({
    page: params.page,
    limit: params.limit,
    type: typeParam,
  });
}

/** Derived from list — backend has no dedicated stats endpoint */
export async function getTestimonialStats(): Promise<TestimonialDashboardStats> {
  return testimonialsService.getStats();
}

/** GET /admin/testimonials/:id */
export async function getTestimonialById(
  id: string,
): Promise<CustomerTestimonial | null> {
  try {
    const row = await testimonialsService.get(id);
    return toUiTestimonial(row);
  } catch {
    return null;
  }
}

/** POST /admin/testimonials (+ publish if needed) */
export async function createTestimonial(
  payload: CreateTestimonialPayload,
): Promise<CustomerTestimonial> {
  return testimonialsService.createFromUi(payload);
}

/** PATCH /admin/testimonials/:id (+ publish/unpublish) */
export async function updateTestimonial(
  id: string,
  payload: Partial<CreateTestimonialPayload>,
  currentStatus?: TestimonialStatus,
): Promise<CustomerTestimonial> {
  return testimonialsService.updateFromUi(id, payload, currentStatus);
}

/** DELETE /admin/testimonials/:id */
export async function deleteTestimonial(id: string): Promise<void> {
  await testimonialsService.remove(id);
}

export async function publishTestimonial(
  id: string,
): Promise<CustomerTestimonial> {
  const row = await testimonialsService.publish(id);
  return toUiTestimonial(row);
}

export async function unpublishTestimonial(
  id: string,
): Promise<CustomerTestimonial> {
  const row = await testimonialsService.unpublish(id);
  return toUiTestimonial(row);
}

export async function reorderTestimonials(
  items: Array<{ id: string; sortOrder: number }>,
): Promise<void> {
  await testimonialsService.reorder(items);
}

export async function getLatestTestimonials(limit = 4) {
  const { data } = await testimonialsService.listForUi({
    page: 1,
    limit,
  });
  return data
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}
