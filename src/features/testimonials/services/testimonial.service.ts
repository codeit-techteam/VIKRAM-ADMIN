import {
  computeTestimonialStats,
  MOCK_TESTIMONIALS,
  type CustomerTestimonial,
  type TestimonialDashboardStats,
  type TestimonialStatus,
  type TestimonialType,
} from "@/mock/mockTestimonials";

const MOCK_DELAY_MS = 300;

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

let testimonialsStore = structuredClone(MOCK_TESTIMONIALS);

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function filterTestimonials(
  items: CustomerTestimonial[],
  filters: TestimonialFilters,
): CustomerTestimonial[] {
  let result = [...items];

  if (filters.type !== "all") {
    result = result.filter((t) => t.type === filters.type);
  }

  if (filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.customerName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.review.toLowerCase().includes(q),
    );
  }

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/** Future: GET /admin/testimonials */
export async function getTestimonials(
  params: TestimonialQueryParams,
): Promise<TestimonialQueryResult> {
  await delay();
  const filtered = filterTestimonials(testimonialsStore, params.filters);
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

/** Future: GET /admin/testimonials/stats */
export async function getTestimonialStats(): Promise<TestimonialDashboardStats> {
  await delay();
  return computeTestimonialStats(testimonialsStore);
}

/** Future: GET /admin/testimonials/:id */
export async function getTestimonialById(
  id: string,
): Promise<CustomerTestimonial | null> {
  await delay();
  return testimonialsStore.find((t) => t.id === id) ?? null;
}

export interface CreateTestimonialPayload {
  type: TestimonialType;
  customerName: string;
  location: string;
  city: string;
  rating: number;
  review: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  status: TestimonialStatus;
}

/** Future: POST /admin/testimonials */
export async function createTestimonial(
  payload: CreateTestimonialPayload,
): Promise<CustomerTestimonial> {
  await delay();
  const now = new Date().toISOString();
  const testimonial: CustomerTestimonial = {
    id: `test-${Date.now()}`,
    ...payload,
    createdAt: now,
    updatedAt: now,
    publishedAt: payload.status === "PUBLISHED" ? now : undefined,
    createdBy: "Admin",
  };
  testimonialsStore = [testimonial, ...testimonialsStore];
  return structuredClone(testimonial);
}

/** Future: PATCH /admin/testimonials/:id */
export async function updateTestimonial(
  id: string,
  payload: Partial<CreateTestimonialPayload>,
): Promise<CustomerTestimonial> {
  await delay();
  const index = testimonialsStore.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Testimonial not found");

  const now = new Date().toISOString();
  testimonialsStore[index] = {
    ...testimonialsStore[index],
    ...payload,
    updatedAt: now,
    publishedAt:
      payload.status === "PUBLISHED"
        ? (testimonialsStore[index].publishedAt ?? now)
        : testimonialsStore[index].publishedAt,
  };
  return structuredClone(testimonialsStore[index]);
}

/** Future: DELETE /admin/testimonials/:id */
export async function deleteTestimonial(id: string): Promise<void> {
  await delay();
  testimonialsStore = testimonialsStore.filter((t) => t.id !== id);
}

export async function getLatestTestimonials(limit = 4) {
  await delay(120);
  return [...testimonialsStore]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}
