import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/shared/Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Alias for `subtitle` used by some page layouts. */
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  titleClassName?: string;
}

export function PageHeader({
  title,
  subtitle,
  description,
  actions,
  breadcrumbs,
  className,
  titleClassName,
}: PageHeaderProps) {
  const resolvedSubtitle = subtitle ?? description;
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} />
        ) : null}
        <div>
          <h1
            className={cn(
              "text-2xl font-bold tracking-tight text-[#1A1A1A]",
              titleClassName,
            )}
          >
            {title}
          </h1>
          {resolvedSubtitle && (
            <p className="mt-1 text-sm text-[#64748B]">{resolvedSubtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
