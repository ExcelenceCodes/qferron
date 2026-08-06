import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";

type Tables = Database["public"]["Tables"];
export type JoinRequestRow = Tables["account_join_requests"]["Row"];

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export interface AccountPreview {
  account_id: string;
  name: string;
  type: string;
  currency: string;
  owner_name: string;
  member_count: number;
  is_shared: boolean;
}

/** Live preview of an account from its 10-digit share code. */
export function useAccountPreview(code: string) {
  const clean = code.replace(/\D/g, "");
  return useQuery({
    queryKey: ["account_preview", clean],
    enabled: clean.length === 10,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("lookup_account_by_code", { _code: clean });
      if (error) throw new Error(error.message);
      const row = (data as AccountPreview[] | null)?.[0];
      return row ?? null;
    },
  });
}

export function useJoinRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["join_requests", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase
          .from("account_join_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ),
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["join_requests"] });
    void qc.invalidateQueries({ queryKey: ["account_members"] });
    void qc.invalidateQueries({ queryKey: ["accounts"] });
  };
}

export function useRequestJoin() {
  const { user, profile } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { account_id: string; message?: string }) =>
      must(
        await supabase
          .from("account_join_requests")
          .insert({
            account_id: input.account_id,
            requester_id: user!.id,
            requester_email: profile?.email ?? user!.email ?? null,
            requester_name: profile?.full_name ?? user!.email ?? "Ferron user",
            message: input.message ?? null,
            status: "pending",
          })
          .select()
          .single(),
      ),
    onSuccess: invalidate,
  });
}

export function useDecideJoinRequest() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { request: JoinRequestRow; approve: boolean }) => {
      const { request, approve } = input;
      const { error } = await supabase
        .from("account_join_requests")
        .update({ status: approve ? "approved" : "denied" })
        .eq("id", request.id);
      if (error) throw new Error(error.message);

      if (approve) {
        const { error: memberError } = await supabase.from("account_members").insert({
          account_id: request.account_id,
          user_id: request.requester_id,
          email: request.requester_email,
          display_name: request.requester_name ?? request.requester_email,
          member_role: "member",
        });
        if (memberError && !memberError.message.includes("duplicate")) {
          throw new Error(memberError.message);
        }
      }
    },
    onSuccess: invalidate,
  });
}

export function useCancelJoinRequest() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("account_join_requests").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function formatShareCode(code: string): string {
  return code.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
}
