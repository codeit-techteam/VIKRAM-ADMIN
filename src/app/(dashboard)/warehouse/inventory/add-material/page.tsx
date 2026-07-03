import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function WarehouseAddMaterialRedirectPage() {
  redirect(`${ROUTES.CENTRAL_WAREHOUSE}/inventory/add-material`);
}
