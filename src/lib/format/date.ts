const dateTime = new Intl.DateTimeFormat("th-TH", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Bangkok",
  year: "numeric",
});

export function formatDate(value: Date | string) {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.valueOf()) ? "—" : dateTime.format(parsed);
}
