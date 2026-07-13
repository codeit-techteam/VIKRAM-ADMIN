import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { ProductsPage } from "@/components/warehouse/products/ProductsPage";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Product Management",
};

export default function WarehouseProductsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Product Management"
        subtitle="Manage central warehouse products, categories, and stock levels."
        breadcrumbs={getNavBreadcrumbsFromPath(
          ROUTES.CENTRAL_WAREHOUSE_PRODUCTS,
        )}
      />

      <ProductsPage />
    </div>
  );
}
