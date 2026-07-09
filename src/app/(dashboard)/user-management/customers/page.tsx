import type { Metadata } from "next";

import { CustomersPageContent } from "@/features/user-management";

export const metadata: Metadata = {
  title: "Customers · User Management",
};

export default function CustomersPage() {
  return <CustomersPageContent />;
}
