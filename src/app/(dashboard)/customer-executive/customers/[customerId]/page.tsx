import { CeCustomerProfilePage } from "@/features/customer-executive";

export const metadata = {
  title: "Customer Profile | BuildQuick India",
  description: "View customer profile, orders, payments, and complaints.",
};

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function CustomerExecutiveCustomerProfilePage({
  params,
}: PageProps) {
  const { customerId } = await params;
  return <CeCustomerProfilePage customerId={customerId} />;
}
