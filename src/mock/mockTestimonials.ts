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
}

export interface TestimonialDashboardStats {
  totalVideos: number;
  totalImages: number;
  published: number;
  draft: number;
}

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
  {
    id: "test-003",
    type: "VIDEO",
    status: "PUBLISHED",
    customerName: "Sanjay Patel",
    location: "GIFT City",
    city: "Gandhinagar",
    rating: 4,
    review:
      "Great platform for managing multiple site deliveries. The wallet feature makes refunds hassle-free.",
    mediaUrl:
      "https://images.unsplash.com/photo-1581094794329-cd811b82a4a8?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1581094794329-cd811b82a4a8?w=400",
    createdAt: "2026-07-12T14:00:00",
    updatedAt: "2026-07-13T10:00:00",
    publishedAt: "2026-07-13T10:00:00",
    createdBy: "Admin",
  },
  {
    id: "test-004",
    type: "IMAGE",
    status: "DRAFT",
    customerName: "Amit Verma",
    location: "Sector 62",
    city: "Noida",
    rating: 5,
    review:
      "Switching to Bajriwala cut our procurement costs by 12%. The loyalty program rewards are a nice bonus.",
    mediaUrl:
      "https://images.unsplash.com/photo-1590642916989-cadc5f595d0f?w=800",
    createdAt: "2026-07-20T16:00:00",
    updatedAt: "2026-07-20T16:00:00",
    createdBy: "Vikram Singh",
  },
  {
    id: "test-005",
    type: "VIDEO",
    status: "DRAFT",
    customerName: "Lakshmi Narayanan",
    location: "OMR",
    city: "Chennai",
    rating: 4,
    review:
      "First-time user and impressed with the onboarding process. Looking forward to our first bulk order.",
    mediaUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
    createdAt: "2026-07-21T08:00:00",
    updatedAt: "2026-07-21T08:00:00",
    createdBy: "Admin",
  },
  {
    id: "test-006",
    type: "IMAGE",
    status: "PUBLISHED",
    customerName: "Thomas Mathew",
    location: "Willingdon Island",
    city: "Kochi",
    rating: 5,
    review:
      "Reliable partner for our port road project. Quality materials delivered on schedule every time.",
    mediaUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    createdAt: "2026-07-10T11:00:00",
    updatedAt: "2026-07-11T09:00:00",
    publishedAt: "2026-07-11T09:00:00",
    createdBy: "Anita Desai",
  },
  {
    id: "test-007",
    type: "IMAGE",
    status: "PUBLISHED",
    customerName: "Debashish Roy",
    location: "Salt Lake",
    city: "Kolkata",
    rating: 4,
    review:
      "The membership plan gives us great discounts on recurring orders. Customer executive support is top-notch.",
    mediaUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    createdAt: "2026-07-08T13:30:00",
    updatedAt: "2026-07-09T10:00:00",
    publishedAt: "2026-07-09T10:00:00",
    createdBy: "Admin",
  },
  {
    id: "test-008",
    type: "VIDEO",
    status: "PUBLISHED",
    customerName: "Suresh Meena",
    location: "Pink City",
    city: "Jaipur",
    rating: 5,
    review:
      "Even though our project was delayed, the Bajriwala team was patient and helpful throughout.",
    mediaUrl:
      "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=400",
    createdAt: "2026-07-05T10:00:00",
    updatedAt: "2026-07-06T14:00:00",
    publishedAt: "2026-07-06T14:00:00",
    createdBy: "Priya Sharma",
  },
];

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
