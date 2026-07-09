import { createFileRoute } from "@tanstack/react-router";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/chat")({
  head: () => ({ meta: [{ title: "AI Accountant — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: ChatPage,
});

const THREAD = [
  { who: "you", text: "Create a savings account for my Kenya trip in December." },
  { who: "ferron", text: "Done. I created 'Kenya Trip' (USD). I suggest saving $220/month starting Aug 1 to reach $1,320 by Dec 1. Want me to enable it?" },
  { who: "you", text: "Yes and remind me weekly." },
  { who: "ferron", text: "Rule enabled. I'll remind you every Monday at 9am and auto-transfer on the 1st of each month." },
];

function ChatPage() {
  return (
    <AppShell
      nav={USER_NAV}
      title="AI accountant"
      subtitle="Ask, and Ferron acts. No dashboards needed."
    >
      <div className="mx-auto flex h-[calc(100vh-14rem)] max-w-3xl flex-col rounded-xl border border-border bg-card shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {THREAD.map((m, i) => (
            <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.who === "you" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.who === "ferron" && (
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold opacity-80">
                    <Sparkles className="h-3 w-3" /> Ferron
                  </p>
                )}
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <form className="flex items-center gap-2 border-t border-border p-3">
          <Input placeholder="Ask about spending, create a rule, register an asset…" className="flex-1" />
          <Button type="submit" size="icon" aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
