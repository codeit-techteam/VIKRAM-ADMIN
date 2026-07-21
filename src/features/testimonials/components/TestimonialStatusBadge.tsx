import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type {
  TestimonialStatus,
  TestimonialType,
} from "@/mock/mockTestimonials";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        PUBLISHED: "bg-green-100 text-green-700",
        DRAFT: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: { variant: "DRAFT" },
  },
);

const typeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        VIDEO: "bg-purple-100 text-purple-700",
        IMAGE: "bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: { variant: "IMAGE" },
  },
);

export function TestimonialStatusBadge({
  status,
  className,
}: {
  status: TestimonialStatus;
  className?: string;
}) {
  return (
    <span className={cn(statusVariants({ variant: status }), className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function TestimonialTypeBadge({
  type,
  className,
}: {
  type: TestimonialType;
  className?: string;
}) {
  return (
    <span className={cn(typeVariants({ variant: type }), className)}>
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </span>
  );
}
