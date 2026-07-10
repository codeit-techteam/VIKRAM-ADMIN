import type { Metadata } from "next";

import { CmsDashboardPage } from "@/features/cms/components/CmsDashboardPage";

export const metadata: Metadata = {
  title: "CMS Dashboard",
};

export default function CustomerAppCmsPage() {
  return <CmsDashboardPage />;
}
