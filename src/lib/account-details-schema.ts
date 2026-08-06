import { z } from "zod";

export const bankDetailsSchema = z.object({
  kind: z.literal("bank"),
  bank_name: z.string().max(80).optional().default(""),
  account_name: z.string().max(80).optional().default(""),
  account_number: z.string().max(40).optional().default(""),
  card_number: z.string().max(25).optional().default(""),
  expiry: z.string().max(7).optional().default(""),
  cvv: z.string().max(4).optional().default(""),
  swift: z.string().max(20).optional().default(""),
  branch: z.string().max(80).optional().default(""),
});

export const mobileDetailsSchema = z.object({
  kind: z.literal("mobile"),
  carrier: z.string().max(60).optional().default(""),
  mobile_number: z.string().max(25).optional().default(""),
  registered_name: z.string().max(80).optional().default(""),
  wallet_id: z.string().max(40).optional().default(""),
});

export const otherDetailsSchema = z.object({
  kind: z.literal("other"),
  reference: z.string().max(80).optional().default(""),
  holder: z.string().max(80).optional().default(""),
});

export const accountDetailsSchema = z.discriminatedUnion("kind", [
  bankDetailsSchema,
  mobileDetailsSchema,
  otherDetailsSchema,
]);

export type AccountDetails = z.infer<typeof accountDetailsSchema>;

export const saveAccountDetailsSchema = z.object({
  account_id: z.string().uuid(),
  details: accountDetailsSchema,
});

/** Short, non-sensitive hint stored in clear so lists can show something. */
export function maskHint(details: AccountDetails): string {
  if (details.kind === "bank") {
    const num = details.card_number || details.account_number || "";
    const tail = num.replace(/\s+/g, "").slice(-4);
    return [details.bank_name, tail ? `•••• ${tail}` : ""].filter(Boolean).join(" · ");
  }
  if (details.kind === "mobile") {
    const tail = (details.mobile_number || "").slice(-4);
    return [details.carrier, tail ? `•••• ${tail}` : ""].filter(Boolean).join(" · ");
  }
  return details.reference || "";
}
