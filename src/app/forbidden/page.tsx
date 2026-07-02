import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <ShieldAlert className="text-destructive size-16" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          You do not have permission to access this resource. Contact your
          administrator if you believe this is an error.
        </p>
      </div>
      <Button render={<Link href={ROUTES.DASHBOARD} />}>
        Back to Dashboard
      </Button>
    </div>
  );
}
