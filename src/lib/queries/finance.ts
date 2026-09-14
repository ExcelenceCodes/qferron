import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { useNotify } from "@/lib/notify";

type Tables = Database["public"]["Tables"];
export type AccountRow = Tables["accounts"]["Row"];
export type TransactionRow = Tables["transactions"]["Row"];
export type AssetRow = Tables["assets"]["Row"];
export type DebtRow = Tables["debts"]["Row"];
export type DebtPaymentRow = Tables["debt_payments"]["Row"];
export type AccountType = Database["public"]["Enums"]["account_type"];
export type AssetKind = Database["public"]["Enums"]["asset_kind"];
export type DebtKind = Database["public"]["Enums"]["debt_kind"];
export type TxDirection = Database["public"]["Enums"]["tx_direction"];

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/** Invalidate every finance surface — balances cascade across pages. */
export function useFinanceInvalidate() {
  const qc = useQueryClient();
  return () => {
    for (const key of ["accounts", "transactions", "assets", "debts", "debt_payments"]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };
}

/* ----------------------------- accounts ----------------------------- */

export function useAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase
          .from("accounts")
          .select("*")
          .order("created_at", { ascending: true }),
      ),
  });
}

export interface AccountInput {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  note?: string | null;
  is_shared?: boolean;
}

export function useCreateAccount() {
  const { user } = useAuth();
  const invalidate = useFinanceInvalidate();
  const notify = useNotify();
  return useMutation({
    mutationFn: async (input: AccountInput) =>
      must(
        await supabase
          .from("accounts")
          .insert({ ...input, user_id: user!.id })
          .select()
          .single(),
      ),
    onSuccess: (row) => {
      invalidate();
      notify({
        title: "Account created",
        body: `${row.name} is now part of your Ferron money map.`,
        category: "money",
        href: "/dashboard/accounts",
      });
    },
  });
}

export function useUpdateAccount() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<AccountInput> & { id: string }) =>
      must(await supabase.from("accounts").update(patch).eq("id", id).select().single()),
    onSuccess: invalidate,
  });
}

export function useDeleteAccount() {
  const invalidate = useFinanceInvalidate();
  const notify = useNotify();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      notify({
        title: "Account removed",
        body: "An account was deleted from your workspace.",
        category: "money",
        href: "/dashboard/accounts",
      });
    },
  });
}

/* --------------------------- transactions --------------------------- */

export function useTransactions(limit?: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id, limit ?? "all"],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("transactions")
        .select("*")
        .order("occurred_at", { ascending: false })
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return must(await q);
    },
  });
}

export interface TransactionInput {
  account_id: string;
  direction: TxDirection;
  amount: number;
  currency: string;
  category: string;
  merchant?: string | null;
  note?: string | null;
  occurred_at: string;
}

export function useCreateTransaction() {
  const { user } = useAuth();
  const invalidate = useFinanceInvalidate();
  const notify = useNotify();
  return useMutation({
    mutationFn: async (input: TransactionInput) =>
      must(
        await supabase
          .from("transactions")
          .insert({ ...input, user_id: user!.id })
          .select()
          .single(),
      ),
    onSuccess: (row) => {
      invalidate();
      notify({
        title: row.direction === "in" ? "Money in recorded" : "Money out recorded",
        body: `${row.currency} ${Number(row.amount).toLocaleString()} · ${row.category}`,
        category: "money",
        href: "/dashboard/transactions",
      });
    },
  });
}

export function useUpdateTransaction() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<TransactionInput> & { id: string }) =>
      must(await supabase.from("transactions").update(patch).eq("id", id).select().single()),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/* ------------------------------ assets ------------------------------ */

export function useAssets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["assets", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("assets").select("*").order("created_at", { ascending: false })),
  });
}

export interface AssetInput {
  name: string;
  kind: AssetKind;
  value: number;
  currency: string;
  acquired_at?: string | null;
  note?: string | null;
  /** Money rotation: the Ferron account the purchase is paid from. */
  funding_account_id?: string | null;
}

export function useCreateAsset() {
  const { user } = useAuth();
  const invalidate = useFinanceInvalidate();
  const notify = useNotify();
  return useMutation({
    mutationFn: async (input: AssetInput) =>
      must(
        await supabase
          .from("assets")
          .insert({ ...input, user_id: user!.id })
          .select()
          .single(),
      ),
    onSuccess: (row) => {
      invalidate();
      notify({
        title: "Asset registered",
        body: `${row.name} added at ${row.currency} ${Number(row.value).toLocaleString()}.`,
        category: "money",
        href: "/dashboard/assets",
      });
    },
  });
}

export function useUpdateAsset() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<AssetInput> & { id: string }) =>
      must(await supabase.from("assets").update(patch).eq("id", id).select().single()),
    onSuccess: invalidate,
  });
}

export function useDeleteAsset() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assets").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/* ------------------------------ debts ------------------------------- */

export function useDebts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["debts", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("debts").select("*").order("created_at", { ascending: false })),
  });
}

export function useDebtPayments(debtId?: string) {
  return useQuery({
    queryKey: ["debt_payments", debtId],
    enabled: !!debtId,
    queryFn: async () =>
      must(
        await supabase
          .from("debt_payments")
          .select("*")
          .eq("debt_id", debtId!)
          .order("paid_at", { ascending: false }),
      ),
  });
}

export interface DebtInput {
  counterparty: string;
  kind: DebtKind;
  principal: number;
  outstanding: number;
  currency: string;
  interest_rate?: number;
  due_date?: string | null;
  note?: string | null;
  /** Money rotation: account the loan lands in / the lent money leaves. */
  account_id?: string | null;
}

export function useCreateDebt() {
  const { user } = useAuth();
  const invalidate = useFinanceInvalidate();
  const notify = useNotify();
  return useMutation({
    mutationFn: async (input: DebtInput) =>
      must(
        await supabase
          .from("debts")
          .insert({ ...input, user_id: user!.id })
          .select()
          .single(),
      ),
    onSuccess: (row) => {
      invalidate();
      notify({
        title: row.kind === "loan" ? "Debt recorded" : "Credit recorded",
        body: `${row.counterparty} · ${row.currency} ${Number(row.outstanding).toLocaleString()} outstanding.`,
        category: "money",
        href: "/dashboard/debts",
      });
    },
  });
}

export function useUpdateDebt() {
  const invalidate = useFinanceInvalidate();
  const notify = useNotify();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<DebtInput> & { id: string }) =>
      must(await supabase.from("debts").update(patch).eq("id", id).select().single()),
    onSuccess: (row) => {
      invalidate();
      if (row.status === "settled") {
        notify({
          title: "Debt settled",
          body: `Nothing left owing with ${row.counterparty}.`,
          category: "money",
          href: "/dashboard/debts",
        });
      }
    },
  });
}

export function useDeleteDebt() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useLogDebtPayment() {
  const { user } = useAuth();
  const invalidate = useFinanceInvalidate();
  const notify = useNotify();
  return useMutation({
    mutationFn: async (input: {
      debt_id: string;
      amount: number;
      paid_at: string;
      note?: string | null;
      account_id?: string | null;
    }) =>
      must(
        await supabase
          .from("debt_payments")
          .insert({ ...input, user_id: user!.id })
          .select()
          .single(),
      ),
    onSuccess: (row) => {
      invalidate();
      notify({
        title: "Payment logged",
        body: `${Number(row.amount).toLocaleString()} paid on ${row.paid_at}.`,
        category: "money",
        href: "/dashboard/debts",
      });
    },
  });
}

/* ----------------------------- profile ------------------------------ */

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (patch: Partial<Tables["profiles"]["Update"]>) =>
      must(await supabase.from("profiles").update(patch).eq("id", user!.id).select().single()),
    onSuccess: async () => {
      await refreshProfile();
    },
  });
}
