import type { Metadata } from "next";

import { CustomerWalletPageContent } from "@/features/wallet/components/CustomerWalletPageContent";

export const metadata: Metadata = {
  title: "Customer Wallet · Finance & Payments",
};

export default function CustomerWalletPage() {
  return <CustomerWalletPageContent />;
}
