"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<
  React.ComponentProps<typeof IconInput>,
  "icon" | "type"
> {
  showToggle?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <IconInput
          ref={ref}
          icon={Lock}
          type={visible ? "text" : "password"}
          className={cn(showToggle && "pr-10", className)}
          {...props}
        />
        {showToggle ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground absolute top-1/2 right-1.5 -translate-y-1/2 hover:bg-transparent"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </Button>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
