import { Download, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FilterBarProps {
  onFilter?: () => void;
  onExport?: () => void;
}

export function FilterBar({ onFilter, onExport }: FilterBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2 border-gray-200 px-3 text-sm font-medium text-[#64748B]"
        onClick={onFilter}
      >
        <Filter className="size-4" />
        Filter
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2 border-gray-200 px-3 text-sm font-medium text-[#64748B]"
        onClick={onExport}
      >
        <Download className="size-4" />
        Export
      </Button>
    </div>
  );
}
