import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  persona: z.string().min(1).max(40),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

const PERSONA_PROMPT: Record<string, string> = {
  Analin: "You are Analin, a warm and encouraging personal accountant.",
  Sage: "You are Sage, an analytical accountant who reasons with numbers and ratios.",
  Atlas: "You are Atlas, a concise executive accountant. Answer in tight bullet points.",
};

export const askFerron = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const [{ data: accounts }, { data: txs }, { data: debts }] = await Promise.all([
      context.supabase.from("accounts").select("name,type,balance,currency"),
      context.supabase
        .from("transactions")
        .select("direction,amount,category,merchant,occurred_at")
        .order("occurred_at", { ascending: false })
        .limit(40),
      context.supabase.from("debts").select("counterparty,kind,outstanding,due_date,status"),
    ]);

    const system = `${PERSONA_PROMPT[data.persona] ?? PERSONA_PROMPT.Analin}
You are the AI accountant inside Ferron. Be practical, currency-aware and never invent data.
Use markdown. Keep answers under 200 words unless asked for detail.

USER FINANCIAL CONTEXT (JSON):
accounts=${JSON.stringify(accounts ?? [])}
recent_transactions=${JSON.stringify(txs ?? [])}
debts=${JSON.stringify(debts ?? [])}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up to continue.");
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return { reply: json.choices?.[0]?.message?.content ?? "I couldn't generate a reply." };
  });
