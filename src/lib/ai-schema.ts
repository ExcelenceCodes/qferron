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
