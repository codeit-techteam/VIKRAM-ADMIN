import type { Metadata } from "next";

import { VideoUploadForm } from "@/features/cms/components/VideoUploadForm";

export const metadata: Metadata = {
  title: "Upload New Video",
};

export default function UploadVideoPage() {
  return <VideoUploadForm />;
}
