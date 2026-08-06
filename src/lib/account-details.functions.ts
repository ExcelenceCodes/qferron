import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  accountDetailsSchema,
  maskHint,
  saveAccountDetailsSchema,
  type AccountDetails,
} from "@/lib/account-details-schema";
import { z } from "zod";

/** Store optional bank / mobile-money details for an account, encrypted at rest. */
export const saveAccountDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveAccountDetailsSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: account, error } = await context.supabase
      .from("accounts")
      .select("id,user_id")
      .eq("id", data.account_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!account || account.user_id !== context.userId) throw new Error("Account not found");

    const { encryptDetails } = await import("@/lib/account-details-crypto.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload_ciphertext = encryptDetails(JSON.stringify(data.details));
    const { error: upsertError } = await supabaseAdmin.from("account_details").upsert(
      {
        account_id: data.account_id,
        user_id: context.userId,
        detail_kind: data.details.kind,
        payload_ciphertext,
        masked_hint: maskHint(data.details),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" },
    );
    if (upsertError) throw new Error(upsertError.message);
    return { ok: true, hint: maskHint(data.details) };
  });

/** Read back the decrypted details — owner only. */
export const getAccountDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ account_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: account } = await context.supabase
      .from("accounts")
      .select("id,user_id")
      .eq("id", data.account_id)
      .maybeSingle();
    if (!account || account.user_id !== context.userId) throw new Error("Account not found");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("account_details")
      .select("payload_ciphertext,masked_hint")
      .eq("account_id", data.account_id)
      .maybeSingle();
    if (!row) return { details: null as AccountDetails | null, hint: null as string | null };

    const { decryptDetails } = await import("@/lib/account-details-crypto.server");
    const parsed = accountDetailsSchema.safeParse(JSON.parse(decryptDetails(row.payload_ciphertext)));
    return {
      details: parsed.success ? parsed.data : null,
      hint: row.masked_hint,
    };
  });

export const deleteAccountDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ account_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: account } = await context.supabase
      .from("accounts")
      .select("id,user_id")
      .eq("id", data.account_id)
      .maybeSingle();
    if (!account || account.user_id !== context.userId) throw new Error("Account not found");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("account_details").delete().eq("account_id", data.account_id);
    return { ok: true };
  });
