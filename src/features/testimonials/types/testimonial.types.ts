export type TestimonialType = "VIDEO" | "IMAGE";
export type TestimonialStatus = "PUBLISHED" | "DRAFT";

export interface CustomerTestimonial {
  id: string;
  type: TestimonialType;
  status: TestimonialStatus;
  customerName: string;
  location: string;
  city: string;
  rating: number;
  review: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: string;
  sortOrder?: number;
}

export interface TestimonialDashboardStats {
  totalVideos: number;
  totalImages: number;
  published: number;
  draft: number;
}

export function computeTestimonialStats(
  testimonials: CustomerTestimonial[],
): TestimonialDashboardStats {
  return {
    totalVideos: testimonials.filter((t) => t.type === "VIDEO").length,
    totalImages: testimonials.filter((t) => t.type === "IMAGE").length,
    published: testimonials.filter((t) => t.status === "PUBLISHED").length,
    draft: testimonials.filter((t) => t.status === "DRAFT").length,
  };
}
