import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";

type Tables = Database["public"]["Tables"];
export type RuleRow = Tables["rules"]["Row"];
export type NotificationRow = Tables["notifications"]["Row"];
export type AccountMemberRow = Tables["account_members"]["Row"];
export type ReferralRow = Tables["referrals"]["Row"];
export type NotificationCategory = Database["public"]["Enums"]["notification_category"];

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ------------------------------ rules ------------------------------- */

export function useRules() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rules", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("rules").select("*").order("created_at", { ascending: false })),
  });
}

export interface RuleInput {
  name: string;
  match_expr: string;
  action_expr: string;
  enabled?: boolean;
}

export function useCreateRule() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RuleInput) =>
      must(await supabase.from("rules").insert({ ...input, user_id: user!.id }).select().single()),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

export function useUpdateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<RuleInput> & { id: string }) =>
      must(await supabase.from("rules").update(patch).eq("id", id).select().single()),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rules").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

/* -------------------------- notifications --------------------------- */

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useCreateNotification() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      body?: string | null;
      category?: NotificationCategory;
      href?: string | null;
    }) =>
      must(
        await supabase
          .from("notifications")
          .insert({ ...input, user_id: user!.id })
          .select()
          .single(),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useSetNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) =>
      must(
        await supabase
          .from("notifications")
          .update({ read_at: read ? new Date().toISOString() : null })
          .eq("id", id)
          .select()
          .single(),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user!.id)
        .is("read_at", null);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useClearNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").delete().eq("user_id", user!.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/* ----------------------------- members ------------------------------ */

export function useAccountMembers(accountIds: string[]) {
  const key = [...accountIds].sort().join(",");
  return useQuery({
    queryKey: ["account_members", key],
    enabled: accountIds.length > 0,
    queryFn: async () =>
      must(
        await supabase
          .from("account_members")
          .select("*")
          .in("account_id", accountIds)
          .order("created_at", { ascending: true }),
      ),
  });
}

export function useAddAccountMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      account_id: string;
      email: string;
      display_name: string;
      member_role: string;
      share_pct?: number | null;
    }) => must(await supabase.from("account_members").insert(input).select().single()),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["account_members"] }),
  });
}

export function useUpdateAccountMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; member_role?: string; display_name?: string; share_pct?: number | null }) =>
      must(await supabase.from("account_members").update(patch).eq("id", id).select().single()),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["account_members"] }),
  });
}

export function useRemoveAccountMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("account_members").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["account_members"] }),
  });
}

/* ---------------------------- referrals ----------------------------- */

export function useReferrals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["referrals", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("referrals").select("*").order("created_at", { ascending: false })),
  });
}

export function useInviteReferral() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invited_email: string) =>
      must(
        await supabase
          .from("referrals")
          .insert({ referrer_id: user!.id, invited_email, status: "pending" })
          .select()
          .single(),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["referrals"] }),
  });
}

export function useDeleteReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("referrals").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["referrals"] }),
  });
}
