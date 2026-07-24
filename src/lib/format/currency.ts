const money = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatCurrency(value: number | string) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? money.format(parsed) : "—";
}
