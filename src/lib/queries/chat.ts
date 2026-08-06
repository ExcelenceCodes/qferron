import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";

type Tables = Database["public"]["Tables"];
export type ChatThreadRow = Tables["chat_threads"]["Row"];
export type ChatMessageRow = Tables["chat_messages"]["Row"];

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function useChatThreads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chat_threads", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase.from("chat_threads").select("*").order("updated_at", { ascending: false }),
      ),
  });
}

export function useChatMessages(threadId?: string) {
  return useQuery({
    queryKey: ["chat_messages", threadId],
    enabled: !!threadId,
    queryFn: async () =>
      must(
        await supabase
          .from("chat_messages")
          .select("*")
          .eq("thread_id", threadId!)
          .order("created_at", { ascending: true }),
      ),
  });
}

export function useCreateThread() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title?: string; persona?: string }) =>
      must(
        await supabase
          .from("chat_threads")
          .insert({
            user_id: user!.id,
            title: input.title ?? "New conversation",
            persona: input.persona ?? "Analin",
          })
          .select()
          .single(),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chat_threads"] }),
  });
}

export function useUpdateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; title?: string; persona?: string }) =>
      must(
        await supabase
          .from("chat_threads")
          .update({ ...patch, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single(),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chat_threads"] }),
  });
}

export function useDeleteThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chat_threads").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chat_threads"] }),
  });
}

export function useAppendMessages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      thread_id: string;
      messages: { role: "user" | "assistant"; content: string }[];
    }) => {
      const rows = input.messages.map((m) => ({
        thread_id: input.thread_id,
        user_id: user!.id,
        role: m.role,
        content: m.content,
      }));
      const { error } = await supabase.from("chat_messages").insert(rows);
      if (error) throw new Error(error.message);
      await supabase
        .from("chat_threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", input.thread_id);
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["chat_messages", vars.thread_id] });
      void qc.invalidateQueries({ queryKey: ["chat_threads"] });
    },
  });
}
