/**
 * Centralized URL filter helpers for enterprise ERP deep-linking.
 */

export type FilterParams = Record<string, string | undefined | null>;

export function buildFilteredUrl(
  basePath: string,
  filters: FilterParams,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (
      value != null &&
      value !== "" &&
      value.toLowerCase() !== "all" &&
      value !== "ALL"
    ) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function parseFilterParams(
  searchParams: URLSearchParams,
  keys: string[],
): FilterParams {
  const result: FilterParams = {};

  for (const key of keys) {
    const value = searchParams.get(key);
    if (value != null) {
      result[key] = value;
    }
  }

  return result;
}

export function mergeFiltersFromUrl<T extends Record<string, unknown>>(
  defaults: T,
  searchParams: URLSearchParams,
  mapping: Partial<Record<keyof T, string>>,
): T {
  const merged = { ...defaults };

  for (const [filterKey, paramKey] of Object.entries(mapping) as Array<
    [keyof T, string]
  >) {
    const value = searchParams.get(paramKey);
    if (value != null && value !== "") {
      merged[filterKey] = value as T[keyof T];
    }
  }

  return merged;
}
