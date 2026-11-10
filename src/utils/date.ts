export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns the last `count` date keys ending with `endKey` (oldest first). */
export function getLastNDays(count: number, endKey: string = toDateKey()): string[] {
  const end = fromDateKey(endKey);
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

export function msUntilNextMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

export function formatLongDate(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatWeekdayShort(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, { weekday: "narrow" });
}
