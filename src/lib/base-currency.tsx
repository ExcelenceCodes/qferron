import * as React from "react";

const KEY = "ferron.base_currency";
const DEFAULT = "USD";

type Ctx = { currency: string; setCurrency: (code: string) => void };
const BaseCurrencyContext = React.createContext<Ctx | null>(null);

export function BaseCurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<string>(DEFAULT);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setCurrencyState(stored);
    } catch {
      /* noop */
    }
  }, []);

  const setCurrency = React.useCallback((code: string) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* noop */
    }
  }, []);

  const value = React.useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);
  return (
    <BaseCurrencyContext.Provider value={value}>{children}</BaseCurrencyContext.Provider>
  );
}

export function useBaseCurrency() {
  const ctx = React.useContext(BaseCurrencyContext);
  if (!ctx) {
    // Fallback for routes that don't wrap in the provider (SSR / marketing pages).
    return { currency: DEFAULT, setCurrency: () => {} } satisfies Ctx;
  }
  return ctx;
}
