import type { Metadata } from "next";

import { TestimonialsPageContent } from "@/features/testimonials/components/TestimonialsPageContent";

export const metadata: Metadata = {
  title: "Customer Testimonials · Customer App CMS",
};

export default function TestimonialsPage() {
  return <TestimonialsPageContent />;
}
