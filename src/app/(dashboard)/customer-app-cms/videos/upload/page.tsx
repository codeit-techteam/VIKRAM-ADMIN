import type { Metadata } from "next";
import { Suspense } from "react";

import { VideoUploadForm } from "@/features/cms/components/VideoUploadForm";

export const metadata: Metadata = {
  title: "Video Management",
};

export default function UploadVideoPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-[#64748B]">
          Loading video form…
        </p>
      }
    >
      <VideoUploadForm />
    </Suspense>
  );
}
