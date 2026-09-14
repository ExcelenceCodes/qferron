import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { NotificationCategory } from "@/lib/queries/platform";

export interface NotifyInput {
  title: string;
  body?: string | null;
  category?: NotificationCategory;
  href?: string | null;
  /** Target another user (shared pools). Defaults to the signed-in user. */
  userId?: string;
}

/**
 * Reusable, fire-and-forget action notification.
 * Never throws: a failed notification must never break the primary action.
 * Do NOT call this from notification-management mutations (avoids loops).
 */
export function useNotify() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return (input: NotifyInput) => {
    const target = input.userId ?? user?.id;
    if (!target) return;
    void (async () => {
      const { error } = await supabase.from("notifications").insert({
        user_id: target,
        title: input.title,
        body: input.body ?? null,
        category: input.category ?? "system",
        href: input.href ?? null,
      });
      if (!error) void qc.invalidateQueries({ queryKey: ["notifications"] });
    })();
  };
}
