import type { Metadata } from "next";

import { ProductForm } from "@/features/catalog/components/ProductForm";

export const metadata: Metadata = {
  title: "Add New Product",
};

export default function AddNewProductPage() {
  return <ProductForm />;
}
