/**
 * Centralised money + number formatting for Ferron.
 *
 * Every money value in the product goes through `formatMoney`, which shortens
 * large numbers to K / M / B. The exact value is always available through
 * `formatMoneyExact` — the <Money /> component shows it on hover.
 */

export interface MoneyOptions {
  /** Force the long form (no K/M/B shortening). */
  exact?: boolean;
  locale?: string;
}

function symbolFor(currency: string, locale: string): string {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

/** Exact, fully written out: "TZS 1,240,500.00" */
export function formatMoneyExact(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(locale, { minimumFractionDigits: 2 })}`;
  }
}

/**
 * Compact and readable: 940 → "$940", 12_400 → "$12.4K",
 * 3_200_000 → "$3.2M", 1_750_000_000 → "$1.75B".
 */
export function formatMoney(
  amount: number,
  currency: string = "USD",
  options: MoneyOptions | string = {},
): string {
  const opts: MoneyOptions = typeof options === "string" ? { locale: options } : options;
  const locale = opts.locale ?? "en-US";
  if (opts.exact) return formatMoneyExact(amount, currency, locale);

  const abs = Math.abs(amount);
  if (abs < 10_000) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: abs >= 1000 || Number.isInteger(amount) ? 0 : 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString(locale)}`;
    }
  }

  const units: { limit: number; suffix: string }[] = [
    { limit: 1_000_000_000_000, suffix: "T" },
    { limit: 1_000_000_000, suffix: "B" },
    { limit: 1_000_000, suffix: "M" },
    { limit: 1_000, suffix: "K" },
  ];
  const unit = units.find((u) => abs >= u.limit)!;
  const scaled = amount / unit.limit;
  const digits = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
  const num = scaled
    .toFixed(digits)
    .replace(/\.?0+$/, (m) => (m.includes(".") ? "" : m));
  return `${symbolFor(currency, locale)}${num}${unit.suffix}`;
}

/** Compact plain number: 12_400 → "12.4K" */
export function formatCompact(n: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

export function formatDate(d: string | Date, locale = "en-US"): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dt);
}

export function formatMonth(d: string | Date, locale = "en-US"): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, { month: "short", year: "2-digit" }).format(dt);
}
