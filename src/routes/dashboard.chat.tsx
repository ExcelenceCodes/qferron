import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, ChevronDown, Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { askFerron } from "@/lib/ai.functions";

export const Route = createFileRoute("/dashboard/chat")({
  head: () => ({
    meta: [{ title: "AI Accountant — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: ChatPage,
});

const PERSONAS = [
  { id: "analin", name: "Analin", img: "/media/accountants/analin.jpg", style: "Warm & guiding" },
  { id: "sage", name: "Sage", img: "/media/accountants/sage.jpg", style: "Analytical" },
  { id: "atlas", name: "Atlas", img: "/media/accountants/atlas.jpg", style: "Concise executive" },
];

const QUICK = [
  "Summarise my spending this month",
  "Where can I cut costs?",
  "How are my debts trending?",
];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

function ChatPage() {
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const ask = useServerFn(askFerron);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || pending) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await ask({ data: { persona: persona.name, messages: next.slice(-20) } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (err) {
      toast.error((err as Error).message || "Ferron couldn't answer right now");
      setMessages(next);
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell
      nav={USER_NAV}
      title="AI accountant"
      subtitle="Ask, and Ferron answers with your real numbers."
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
            {messages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <img src={persona.img} alt="" className="mx-auto h-14 w-14 rounded-full object-cover" />
                <p className="mt-3 text-sm font-semibold text-foreground">Hi, I'm {persona.name}.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  I can see your accounts, transactions and debts. Ask me anything.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {QUICK.map((q) => (
                    <Button key={q} size="sm" variant="outline" onClick={() => void send(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {m.role === "assistant" && (
                    <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
                      <Sparkles className="h-3 w-3" /> {persona.name}
                    </p>
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {persona.name} is thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background/95 py-3 backdrop-blur">
          <form
            className="mx-auto flex max-w-3xl items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about spending, debts, savings…"
              className="min-h-[44px] flex-1 resize-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Suggest"
              disabled={pending}
              onClick={() => void send("Give me one high-impact suggestion for this month.")}
            >
              <Bot className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" aria-label="Send" disabled={pending || !input.trim()}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
