import type { PaginationMeta, PaginationParams } from "@/types/api";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const getPaginationParams = (
  params?: PaginationParams,
): Required<Pick<PaginationParams, "page" | "limit">> &
  Omit<PaginationParams, "page" | "limit"> => ({
  page: params?.page ?? DEFAULT_PAGE,
  limit: params?.limit ?? DEFAULT_LIMIT,
  ...params,
});

export const getPageCount = (total: number, limit: number): number =>
  Math.ceil(total / limit) || 1;

export const getPaginationRange = (
  page: number,
  limit: number,
): { from: number; to: number } => ({
  from: (page - 1) * limit + 1,
  to: page * limit,
});

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = getPageCount(total, limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
