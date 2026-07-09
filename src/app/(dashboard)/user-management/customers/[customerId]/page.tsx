import type { Metadata } from "next";

import { CustomerProfileContent } from "@/features/user-management";
import { getCustomerDetail } from "@/mock/customer-service";
import { CUSTOMER_ORDERS_SEED, CUSTOMER_SEED } from "@/mock/customers";

interface CustomerProfilePageProps {
  params: Promise<{ customerId: string }>;
}

export async function generateMetadata({
  params,
}: CustomerProfilePageProps): Promise<Metadata> {
  const { customerId } = await params;
  const customer = getCustomerDetail(
    customerId,
    CUSTOMER_SEED,
    CUSTOMER_ORDERS_SEED,
  );

  return {
    title: customer
      ? `${customer.name} · Customer Profile`
      : "Customer Profile",
  };
}

export default async function CustomerProfilePage({
  params,
}: CustomerProfilePageProps) {
  const { customerId } = await params;

  return <CustomerProfileContent customerId={customerId} />;
}
