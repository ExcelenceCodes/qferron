import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const KEY = "ferron.base_currency";
const DEFAULT = "USD";

type Ctx = { currency: string; setCurrency: (code: string) => void };
const BaseCurrencyContext = React.createContext<Ctx | null>(null);

export function BaseCurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, refreshProfile } = useAuth();
  const [currency, setCurrencyState] = React.useState<string>(DEFAULT);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setCurrencyState(stored);
    } catch {
      /* noop */
    }
  }, []);

  // The signed-in profile is the source of truth once it loads.
  React.useEffect(() => {
    if (profile?.base_currency) {
      setCurrencyState(profile.base_currency);
      try {
        localStorage.setItem(KEY, profile.base_currency);
      } catch {
        /* noop */
      }
    }
  }, [profile?.base_currency]);

  const setCurrency = React.useCallback(
    (code: string) => {
      setCurrencyState(code);
      try {
        localStorage.setItem(KEY, code);
      } catch {
        /* noop */
      }
      if (user) {
        void supabase
          .from("profiles")
          .update({ base_currency: code })
          .eq("id", user.id)
          .then(() => refreshProfile());
      }
    },
    [user, refreshProfile],
  );

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
