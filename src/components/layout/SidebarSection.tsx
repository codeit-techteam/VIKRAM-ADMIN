import type { NavItem } from "@/constants/navigation.constants";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  label?: string;
  items: NavItem[];
  pathname: string;
  isCollapsed: boolean;
  expandedHref?: string | null;
  onToggleExpand?: (href: string) => void;
}

export function SidebarSection({
  label,
  items,
  pathname,
  isCollapsed,
  expandedHref = null,
  onToggleExpand,
}: SidebarSectionProps) {
  return (
    <div className={cn(label && "mt-7")}>
      {label && !isCollapsed && (
        <p className="mb-2.5 px-3 text-xs font-medium tracking-wide text-gray-400 uppercase">
          {label}
        </p>
      )}
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            pathname={pathname}
            isCollapsed={isCollapsed}
            expandedHref={expandedHref}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </nav>
    </div>
  );
}
