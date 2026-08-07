/**
 * Legacy mock data retained for executive dashboard aggregates only.
 * Testimonials CMS uses live API via `@/services/cms-testimonials.service`.
 */
export type {
  CustomerTestimonial,
  TestimonialDashboardStats,
  TestimonialStatus,
  TestimonialType,
} from "@/features/testimonials/types/testimonial.types";
export { computeTestimonialStats } from "@/features/testimonials/types/testimonial.types";

import type { CustomerTestimonial } from "@/features/testimonials/types/testimonial.types";

export const MOCK_TESTIMONIALS: CustomerTestimonial[] = [
  {
    id: "test-001",
    type: "VIDEO",
    status: "PUBLISHED",
    customerName: "Ravi Teja",
    location: "Andheri East",
    city: "Mumbai",
    rating: 5,
    review:
      "Bajriwala has transformed how we procure construction materials. Same-day delivery and competitive pricing have saved us weeks on our project timeline.",
    mediaUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    createdAt: "2026-07-18T10:00:00",
    updatedAt: "2026-07-18T12:00:00",
    publishedAt: "2026-07-18T12:00:00",
    createdBy: "Admin",
  },
  {
    id: "test-002",
    type: "IMAGE",
    status: "PUBLISHED",
    customerName: "Rajesh Kumar",
    location: "Hinjewadi",
    city: "Pune",
    rating: 5,
    review:
      "Excellent quality cement and steel. The bulk procurement team understood our project needs perfectly. Highly recommended for large projects.",
    mediaUrl:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    createdAt: "2026-07-15T09:30:00",
    updatedAt: "2026-07-16T11:00:00",
    publishedAt: "2026-07-16T11:00:00",
    createdBy: "Priya Sharma",
  },
];
