import type { Metadata } from "next";

import { CategoryForm } from "@/features/cms/components/CategoryForm";

export const metadata: Metadata = {
  title: "Add New Category",
};

export default function AddNewCategoryPage() {
  return <CategoryForm mode="create" />;
}
