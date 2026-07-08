import type { Metadata } from "next";

import { TransferDetailClient } from "@/components/transfers/TransferDetailClient";

export const metadata: Metadata = {
  title: "Transfer Details",
};

export default function TransferDetailRoutePage() {
  return <TransferDetailClient />;
}
