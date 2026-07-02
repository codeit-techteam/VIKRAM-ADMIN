import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-primary text-8xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Button render={<Link href={ROUTES.DASHBOARD} />}>
        <ArrowLeft />
        Back to Dashboard
      </Button>
    </div>
  );
}
