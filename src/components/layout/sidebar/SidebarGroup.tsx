import { SidebarAccordion } from "@/components/layout/sidebar/SidebarAccordion";
import { SidebarItem } from "@/components/layout/sidebar/SidebarItem";
import type { NavItem } from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";

interface SidebarGroupProps {
  label?: string;
  items: NavItem[];
  pathname: string;
  isCollapsed: boolean;
  expandedAccordionId: string | null;
  onAccordionToggle: (id: string) => void;
  onNavigate?: () => void;
}

export function SidebarGroup({
  label,
  items,
  pathname,
  isCollapsed,
  expandedAccordionId,
  onAccordionToggle,
  onNavigate,
}: SidebarGroupProps) {
  return (
    <div className={cn(label && "mt-5 first:mt-0")}>
      {label && !isCollapsed ? (
        <p
          className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase"
          aria-hidden="true"
        >
          {label}
        </p>
      ) : null}

      <nav aria-label={label ?? "Navigation"} className="flex flex-col gap-0.5">
        {items.map((item) => {
          const hasChildren = Boolean(item.children?.length);

          if (hasChildren) {
            return (
              <SidebarAccordion
                key={item.id}
                item={item}
                pathname={pathname}
                isCollapsed={isCollapsed}
                isExpanded={expandedAccordionId === item.id}
                onToggle={() => onAccordionToggle(item.id)}
                onNavigate={onNavigate}
              />
            );
          }

          return (
            <SidebarItem
              key={item.id}
              item={item}
              pathname={pathname}
              isCollapsed={isCollapsed}
              showFavoriteToggle
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>
    </div>
  );
}
