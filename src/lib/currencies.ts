import raw from "@/lib/data/currencies.json";

export interface CurrencyInfo {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

const map = raw as Record<string, CurrencyInfo>;

export const CURRENCIES: CurrencyInfo[] = Object.values(map).sort((a, b) =>
  a.code.localeCompare(b.code),
);

export function getCurrency(code: string): CurrencyInfo | undefined {
  return map[code];
}
