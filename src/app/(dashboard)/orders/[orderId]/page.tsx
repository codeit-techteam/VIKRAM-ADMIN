import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { buildFilteredUrl } from "@/utils/navigation-filters";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  redirect(buildFilteredUrl(ROUTES.ORDERS, { order: orderId }));
}
