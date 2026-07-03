import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  itemLabel = "items",
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-[#64748B]">
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-8 border-gray-200"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <span aria-hidden="true">&lt;</span>
          <span className="sr-only">Previous page</span>
        </Button>

        {paginationItems.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-8 items-center justify-center text-sm text-[#64748B]"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              type="button"
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={cn(
                "size-8 min-w-8 px-0",
                page === currentPage
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "border-gray-200 text-[#64748B]",
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="size-8 border-gray-200"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span aria-hidden="true">&gt;</span>
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}
