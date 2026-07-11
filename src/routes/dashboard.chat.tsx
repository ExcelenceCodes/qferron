import { createFileRoute } from "@tanstack/react-router";
import { Bot, ChevronDown, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const analin = { url: "/media/accountants/analin.jpg" };
const sage = { url: "/media/accountants/sage.jpg" };
const atlas = { url: "/media/accountants/atlas.jpg" };

export const Route = createFileRoute("/dashboard/chat")({
  head: () => ({ meta: [{ title: "AI Accountant — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: ChatPage,
});

const PERSONAS = [
  { id: "analin", name: "Analin", img: analin.url, style: "Warm & guiding" },
  { id: "sage", name: "Sage", img: sage.url, style: "Analytical" },
  { id: "atlas", name: "Atlas", img: atlas.url, style: "Concise executive" },
];

const THREAD = [
  { who: "you", text: "Create a savings account for my Kenya trip in December." },
  { who: "ferron", text: "Done. I created 'Kenya Trip' (USD). I suggest saving $220/month starting Aug 1 to reach $1,320 by Dec 1. Want me to enable it?" },
  { who: "you", text: "Yes and remind me weekly." },
  { who: "ferron", text: "Rule enabled. I'll remind you every Monday at 9am and auto-transfer on the 1st of each month." },
];

function ChatPage() {
  const [persona, setPersona] = useState(PERSONAS[0]);

  return (
    <AppShell
      nav={USER_NAV}
      title="AI accountant"
      subtitle="Ask, and Ferron acts. No dashboards needed."
      headerRight={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <img src={persona.img} alt="" className="h-5 w-5 rounded-full object-cover" />
              {persona.name}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PERSONAS.map((p) => (
              <DropdownMenuItem key={p.id} onSelect={() => setPersona(p)} className="gap-2">
                <img src={p.img} alt="" className="h-6 w-6 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.style}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="flex h-[calc(100vh-12rem)] flex-col">
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mx-auto max-w-3xl space-y-4 py-4">
            {THREAD.map((m, i) => (
              <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.who === "you" ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {m.who === "ferron" && (
                    <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
                      <Sparkles className="h-3 w-3" /> {persona.name}
                    </p>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 border-t border-border bg-background/95 py-3 backdrop-blur">
          <form className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea rows={1} placeholder="Ask about spending, create a rule, register an asset…" className="min-h-[44px] flex-1 resize-none" />
            <Button type="button" variant="outline" size="icon" aria-label="Suggest">
              <Bot className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
