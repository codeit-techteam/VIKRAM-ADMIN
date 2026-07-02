export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
