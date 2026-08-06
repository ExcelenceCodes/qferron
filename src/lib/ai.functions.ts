import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  askFerronSchema,
  describeRuleSchema,
  draftRuleSchema,
  insightSchema,
  PERSONA_PROMPT,
  RULE_ACTIONS,
  RULE_FIELDS,
  RULE_OPERATORS,
} from "@/lib/ai-schema";

const MODEL = "google/gemini-3.6-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGateway(messages: ChatMessage[], jsonMode = false): Promise<string> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please top up to continue.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

interface FinanceContext {
  accounts: unknown;
  transactions: unknown;
  debts: unknown;
  assets: unknown;
  investments: unknown;
}

async function loadContext(supabase: {
  from: (t: string) => {
    select: (c: string) => {
      order?: unknown;
      limit?: unknown;
      then?: unknown;
    };
  };
}): Promise<FinanceContext> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [accounts, transactions, debts, assets, investments] = await Promise.all([
    sb.from("accounts").select("name,type,balance,currency,is_shared"),
    sb
      .from("transactions")
      .select("direction,amount,category,merchant,occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(60),
    sb.from("debts").select("counterparty,kind,principal,outstanding,interest_rate,due_date,status,currency"),
    sb.from("assets").select("name,kind,value,currency,acquired_at"),
    sb.from("investments").select("name,kind,principal,current_value,growth_rate,started_at,risk,currency"),
  ]);
  return {
    accounts: accounts.data ?? [],
    transactions: transactions.data ?? [],
    debts: debts.data ?? [],
    assets: assets.data ?? [],
    investments: investments.data ?? [],
  };
}

function contextBlock(ctx: FinanceContext): string {
  return `USER FINANCIAL CONTEXT (JSON):
accounts=${JSON.stringify(ctx.accounts)}
recent_transactions=${JSON.stringify(ctx.transactions)}
debts=${JSON.stringify(ctx.debts)}
assets=${JSON.stringify(ctx.assets)}
investments=${JSON.stringify(ctx.investments)}`;
}

/* ------------------------------ chat -------------------------------- */

export const askFerron = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => askFerronSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = await loadContext(context.supabase as never);

    const system = `${PERSONA_PROMPT[data.persona] ?? PERSONA_PROMPT["Analin"]}
You are the AI accountant inside Ferron. Be practical, currency-aware and never invent data.
Reply in clean markdown: short paragraphs, bold key numbers, bullet lists where useful.
Keep answers under 220 words unless asked for detail.

${contextBlock(ctx)}`;

    const reply = await callGateway([{ role: "system", content: system }, ...data.messages]);
    return { reply: reply || "I couldn't generate a reply." };
  });

/* --------------------- describe-to-rule automation -------------------- */

export const draftRuleFromDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => describeRuleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: categories } = await context.supabase
      .from("transactions")
      .select("category")
      .limit(200);
    const known = [...new Set((categories ?? []).map((c) => c.category))].slice(0, 40);

    const system = `You turn a plain-English description into ONE Ferron automation rule.
Return ONLY JSON with exactly these keys:
{"name":string,"condition_field":one of ${JSON.stringify(RULE_FIELDS)},"operator":one of ${JSON.stringify(RULE_OPERATORS)},"condition_value":string,"action_type":one of ${JSON.stringify(RULE_ACTIONS)},"action_value":string}
Rules of thumb: text matching uses contains/equals/starts_with; amounts use greater_than/less_than with a plain number.
Existing categories the user already uses: ${JSON.stringify(known)}.
Give the rule a short human name like "Coffee runs → Dining".`;

    const raw = await callGateway(
      [
        { role: "system", content: system },
        { role: "user", content: data.description },
      ],
      true,
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "").trim());
    } catch {
      throw new Error("Ferron couldn't turn that into a rule. Try rephrasing it.");
    }
    const result = draftRuleSchema.safeParse(parsed);
    if (!result.success) throw new Error("Ferron couldn't turn that into a rule. Try rephrasing it.");
    return result.data;
  });

/* --------------------------- page insights --------------------------- */

const TOPIC_PROMPT: Record<string, string> = {
  debts: `Analyse the user's debts. Do three things, in markdown:
1. **Pay this first** — rank the debts by urgency using interest rate, outstanding amount and due date (avalanche vs snowball — say which you used and why).
2. **Safe borrowing ceiling** — estimate the maximum new monthly repayment and total loan the user can responsibly take, using their monthly inflow and existing repayments. Show the debt-to-income ratio.
3. **Watch out** — overdue or expensive items, one concrete next action.`,
  assets: `Review the user's assets. In markdown: what the portfolio is concentrated in, how it compares to their cash and debts, whether anything is idle or depreciating, and two concrete moves to strengthen net worth.`,
  investments: `Review the user's investments. In markdown: overall return, best and worst performer, risk concentration, projected value in 5 years at current growth rates, and two concrete rebalancing suggestions.`,
  growth: `Assess the user's financial growth trend from balances, transactions, assets, investments and debts. In markdown: direction of travel, savings rate, and the single highest-impact change this month.`,
};

export const ferronInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => insightSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = await loadContext(context.supabase as never);
    const system = `You are Ferron, an AI accountant. Be specific, use the user's real numbers and currency, never invent data. If a section has no data, say so in one line instead of guessing.

${TOPIC_PROMPT[data.topic]}

${contextBlock(ctx)}`;

    const reply = await callGateway([
      { role: "system", content: system },
      { role: "user", content: data.question || "Give me the insight now." },
    ]);
    return { reply: reply || "Not enough data yet — add a few records and ask again." };
  });
