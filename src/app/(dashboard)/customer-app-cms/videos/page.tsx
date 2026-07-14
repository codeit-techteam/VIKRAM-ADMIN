import type { Metadata } from "next";

import { VideoManagementPageContent } from "@/features/cms/components/VideoManagementPageContent";

export const metadata: Metadata = {
  title: "Video Management",
};

export default function VideoManagementPage() {
  return <VideoManagementPageContent />;
}
