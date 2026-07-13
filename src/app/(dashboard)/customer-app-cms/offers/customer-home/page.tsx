import type { Metadata } from "next";

import { CustomerAppHomePreview } from "@/features/cms/components/CustomerAppHomePreview";

export const metadata: Metadata = {
  title: "Customer App Home Preview",
};

export default function CustomerAppHomePreviewPage() {
  return <CustomerAppHomePreview />;
}
