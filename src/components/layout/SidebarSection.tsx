import type { NavItem } from "@/constants/navigation.constants";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  label?: string;
  items: NavItem[];
  pathname: string;
  isCollapsed: boolean;
}

export function SidebarSection({
  label,
  items,
  pathname,
  isCollapsed,
}: SidebarSectionProps) {
  return (
    <div className={cn(label && "mt-6")}>
      {label && !isCollapsed && (
        <p className="mb-2 px-3 text-xs font-medium tracking-wide text-gray-400 uppercase">
          {label}
        </p>
      )}
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </div>
  );
}
