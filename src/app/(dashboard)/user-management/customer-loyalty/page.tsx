import type { Metadata } from "next";

import { CustomerLoyaltyPageContent } from "@/features/loyalty/components/CustomerLoyaltyPageContent";

export const metadata: Metadata = {
  title: "Customer Loyalty · User Management",
};

export default function CustomerLoyaltyPage() {
  return <CustomerLoyaltyPageContent />;
}
