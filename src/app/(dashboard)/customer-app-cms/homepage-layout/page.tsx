import type { Metadata } from "next";

import { HomepageLayoutPageContent } from "@/features/cms/components/HomepageLayoutPageContent";

export const metadata: Metadata = {
  title: "Homepage Layout Manager",
};

export default function HomepageLayoutPage() {
  return <HomepageLayoutPageContent />;
}
