import { Skeleton } from "@/components/ui/skeleton";

export default function CentralWarehouseLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[132px] rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="mt-6 h-64 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-32" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[88px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-6 h-72 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-36" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
