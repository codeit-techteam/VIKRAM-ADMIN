import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
