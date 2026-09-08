export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatResolutionHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0h";
  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainingHours = Math.floor((totalMinutes % (60 * 24)) / 60);
  if (days > 0) {
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  if (hours >= 10) return `${Math.round(hours)}h`;
  return `${Math.round(hours * 10) / 10}h`;
}
