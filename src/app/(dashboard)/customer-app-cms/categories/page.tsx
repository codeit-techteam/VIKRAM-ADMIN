import type { Metadata } from "next";

import { CategoriesPageContent } from "@/features/cms/components/CategoriesPageContent";

export const metadata: Metadata = {
  title: "Categories Management",
};

export default function CategoriesManagementPage() {
  return <CategoriesPageContent />;
}
