import type { Metadata } from "next";

import { CatalogPageContent } from "@/features/catalog/components/CatalogPageContent";

export const metadata: Metadata = {
  title: "Product Catalog",
};

export default function ProductCatalogPage() {
  return <CatalogPageContent />;
}
