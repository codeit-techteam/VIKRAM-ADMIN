import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** Product create/edit lives in CMS catalog. Warehouse stock is managed in Inventory. */
export default function WarehouseProductsRedirectPage() {
  redirect(`${ROUTES.CENTRAL_WAREHOUSE}/inventory`);
}
