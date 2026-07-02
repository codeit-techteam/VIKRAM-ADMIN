import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Search orders, products, or users...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="focus-visible:ring-primary/20 h-11 rounded-full border-transparent bg-[#EEF4FF] pl-10 text-sm placeholder:text-gray-400 focus-visible:border-transparent"
      />
    </div>
  );
}
