import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function UserManagementPage() {
  redirect(ROUTES.USER_MANAGEMENT_CUSTOMERS);
}
