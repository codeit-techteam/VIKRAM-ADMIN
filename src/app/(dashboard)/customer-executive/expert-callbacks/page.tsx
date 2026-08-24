import type { Metadata } from "next";

import { ExpertCallbacksPageContent } from "@/features/expert-callbacks/components/ExpertCallbacksPageContent";

export const metadata: Metadata = {
  title: "Expert Callbacks · Customer Executive",
};

export default function ExpertCallbacksPage() {
  return <ExpertCallbacksPageContent />;
}
