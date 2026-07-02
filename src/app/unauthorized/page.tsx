import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <ShieldX className="text-muted-foreground size-16" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="text-muted-foreground max-w-md">
          You need to be signed in to access this page.
        </p>
      </div>
      <Button render={<Link href={ROUTES.LOGIN} />}>Sign in</Button>
    </div>
  );
}
