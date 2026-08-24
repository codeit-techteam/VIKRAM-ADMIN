/**
 * @deprecated Fake delay helper — logistics screens now use React Query `isLoading`.
 * Do not use for new code.
 */
export function useLogisticsLoading() {
  return { isLoading: false };
}
