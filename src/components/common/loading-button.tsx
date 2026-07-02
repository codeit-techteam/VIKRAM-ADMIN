import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" />}
      {isLoading ? (loadingText ?? children) : children}
    </Button>
  );
}
