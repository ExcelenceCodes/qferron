import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";

type Tables = Database["public"]["Tables"];
export type InvestmentRow = Tables["investments"]["Row"];
export type ContributionRow = Tables["investment_contributions"]["Row"];
export type InvestmentKind = Database["public"]["Enums"]["investment_kind"];

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const INVESTMENT_KINDS: { value: InvestmentKind; label: string }[] = [
  { value: "stocks", label: "Stocks & shares" },
  { value: "bonds", label: "Bonds / treasury" },
  { value: "mutual_fund", label: "Mutual fund" },
  { value: "real_estate", label: "Real estate" },
  { value: "business", label: "Business stake" },
  { value: "crypto", label: "Crypto" },
  { value: "savings_plan", label: "Savings plan" },
  { value: "other", label: "Other" },
];

export function useInvestments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["investments", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("investments").select("*").order("created_at", { ascending: false })),
  });
}

export function useContributions(investmentId?: string) {
  return useQuery({
    queryKey: ["investment_contributions", investmentId],
    enabled: !!investmentId,
    queryFn: async () =>
      must(
        await supabase
          .from("investment_contributions")
          .select("*")
          .eq("investment_id", investmentId!)
          .order("occurred_at", { ascending: false }),
      ),
  });
}

export interface InvestmentInput {
  name: string;
  kind: InvestmentKind;
  provider?: string | null;
  principal: number;
  current_value: number;
  growth_rate: number;
  currency: string;
  started_at: string;
  maturity_date?: string | null;
  risk: string;
  note?: string | null;
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["investments"] });
    void qc.invalidateQueries({ queryKey: ["investment_contributions"] });
  };
}

export function useCreateInvestment() {
  const { user } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: InvestmentInput) =>
      must(await supabase.from("investments").insert({ ...input, user_id: user!.id }).select().single()),
    onSuccess: invalidate,
  });
}

export function useUpdateInvestment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<InvestmentInput> & { id: string }) =>
      must(await supabase.from("investments").update(patch).eq("id", id).select().single()),
    onSuccess: invalidate,
  });
}

export function useDeleteInvestment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("investments").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useLogContribution() {
  const { user } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      investment_id: string;
      amount: number;
      kind: string;
      occurred_at: string;
      note?: string | null;
      /** Money rotation: account the contribution moves through. */
      account_id?: string | null;
    }) =>
      must(
        await supabase
          .from("investment_contributions")
          .insert({ ...input, user_id: user!.id })
          .select()
          .single(),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteContribution() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("investment_contributions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/* --------------------------- projections ---------------------------- */

export function yearsHeld(inv: InvestmentRow): number {
  const start = new Date(inv.started_at).getTime();
  return Math.max((Date.now() - start) / (365.25 * 24 * 3600 * 1000), 0);
}

export function projectValue(inv: InvestmentRow, years: number): number {
  const rate = Number(inv.growth_rate) / 100;
  return Number(inv.current_value) * Math.pow(1 + rate, years);
}

export function returnPct(inv: InvestmentRow): number {
  const p = Number(inv.principal);
  if (!p) return 0;
  return ((Number(inv.current_value) - p) / p) * 100;
}
