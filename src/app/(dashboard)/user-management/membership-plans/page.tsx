import type { Metadata } from "next";

import { MembershipPlansPageContent } from "@/features/membership/components/MembershipPlansPageContent";

export const metadata: Metadata = {
  title: "Membership Plans · User Management",
};

export default function MembershipPlansPage() {
  return <MembershipPlansPageContent />;
}
