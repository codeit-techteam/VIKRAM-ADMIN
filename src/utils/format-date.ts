import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export const formatDate = (
  date: string | Date,
  pattern = "dd MMM yyyy",
): string => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "";
  return format(parsed, pattern);
};

export const formatDateTime = (date: string | Date): string =>
  formatDate(date, "dd MMM yyyy, hh:mm a");

export const formatRelativeDate = (date: string | Date): string => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "";
  return formatDistanceToNow(parsed, { addSuffix: true });
};
