import { z } from "zod";

export const askFerronSchema = z.object({
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

export type AskFerronInput = z.infer<typeof askFerronSchema>;

export const PERSONA_PROMPT: Record<string, string> = {
  Analin: "You are Analin, a warm and encouraging personal accountant.",
  Sage: "You are Sage, an analytical accountant who reasons with numbers and ratios.",
  Atlas: "You are Atlas, a concise executive accountant. Answer in tight bullet points.",
};

/* ------------------------- automation builder ------------------------ */

export const RULE_FIELDS = ["merchant", "category", "note", "amount", "direction"] as const;
export const RULE_OPERATORS = [
  "contains",
  "equals",
  "starts_with",
  "greater_than",
  "less_than",
] as const;
export const RULE_ACTIONS = [
  "set_category",
  "add_note",
  "flag",
  "notify",
  "move_to_account",
] as const;

export const draftRuleSchema = z.object({
  name: z.string().min(2).max(80),
  condition_field: z.enum(RULE_FIELDS),
  operator: z.enum(RULE_OPERATORS),
  condition_value: z.string().max(120),
  action_type: z.enum(RULE_ACTIONS),
  action_value: z.string().max(120),
});

export type DraftRule = z.infer<typeof draftRuleSchema>;

export const describeRuleSchema = z.object({
  description: z.string().min(5).max(600),
});

/* --------------------------- insight prompts ------------------------- */

export const insightSchema = z.object({
  topic: z.enum(["debts", "assets", "growth", "investments"]),
  question: z.string().max(600).optional(),
});
