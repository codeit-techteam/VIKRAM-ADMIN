import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IconInputProps extends React.ComponentProps<typeof Input> {
  icon: LucideIcon;
  containerClassName?: string;
}

const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ icon: Icon, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <Icon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          ref={ref}
          className={cn(
            "focus-visible:border-primary focus-visible:ring-primary/20 h-11 rounded-lg border-gray-200 bg-gray-50/80 pl-10 text-sm transition-[border-color,box-shadow,background-color] focus-visible:bg-white",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

IconInput.displayName = "IconInput";

export { IconInput };
