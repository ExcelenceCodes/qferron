import { createFileRoute } from "@tanstack/react-router";
import { Bot, ChevronDown, Plus, Sparkles, Wand2 } from "lucide-react";
import { useRef } from "react";
import { useState } from "react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AI_FUNCTIONS, type AIFunctionMap } from "@/lib/mock/ai-prompts";
import { LoadingButton, useAsyncAction } from "@/components/ui/loading-button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ai-settings")({
  head: () => ({ meta: [{ title: "AI Settings — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminAiSettingsPage,
});

function AdminAiSettingsPage() {
  return (
    <AppShell
      nav={ADMIN_NAV}
      title="AI Settings"
      subtitle="Endpoints, prompts, data injections and markup — per AI feature."
    >
      <SectionCard title="Mapped AI functionality">
        <p className="mb-4 text-sm text-muted-foreground">
          Every AI button in the app is mapped below. Configure endpoint, system prompt, data injections and
          which markup formats each function is allowed to return.
        </p>
        <div className="space-y-3">
          {AI_FUNCTIONS.map((fn) => (
            <AiFunctionRow key={fn.id} fn={fn} />
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}

function AiFunctionRow({ fn }: { fn: AIFunctionMap }) {
  const [systemPrompt, setSystemPrompt] = useState(fn.systemPrompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const save = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`Updated "${fn.buttonLabel}" configuration`);
  });
  const compose = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 900));
    const tokens = fn.dataInjections.map((d) => `[[${d}]]`).join(", ");
    setSystemPrompt(
      `You are Ferron for "${fn.location}". Respond with concise ${fn.markupSupport.join(" or ")}. Use provided data: ${tokens}.`,
    );
    toast.success("Perfect prompt generated");
  });

  function insertToken(token: string) {
    const el = textareaRef.current;
    const snippet = `[[${token}]]`;
    if (!el) {
      setSystemPrompt((p) => `${p}${p.endsWith(" ") || p.length === 0 ? "" : " "}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + snippet + el.value.slice(end);
    setSystemPrompt(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <Collapsible className="rounded-lg border border-border bg-background/50">
      <CollapsibleTrigger asChild>
        <button className="group flex w-full items-center justify-between p-4 text-left hover:bg-accent/30">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {fn.location} · <span className="text-primary">{fn.buttonLabel}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">Showing prompt: "{fn.showingPrompt}"</p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Endpoint</Label>
            <Input defaultValue={fn.endpoint} />
          </div>
          <div className="grid gap-1.5">
            <Label>Markup support</Label>
            <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2">
              {fn.markupSupport.map((m) => (
                <Badge key={m} variant="secondary">{m}</Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>System prompt</Label>
              <LoadingButton
                type="button"
                variant="outline"
                size="sm"
                loading={compose.loading}
                loadingText="Composing…"
                onClick={compose.run}
              >
                <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Compose with AI
              </LoadingButton>
            </div>
            <Textarea
              ref={textareaRef}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Reference injected data with <code className="rounded bg-muted px-1">[[token]]</code> — click a
              token below to insert it at the cursor.
            </p>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Data injections / contextualisations</Label>
            <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2">
              {fn.dataInjections.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => insertToken(d)}
                  className="group inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                  title={`Insert [[${d}]] at cursor`}
                >
                  <Plus className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  [[{d}]]
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="outline" size="sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Test prompt
            </Button>
            <LoadingButton size="sm" loading={save.loading} loadingText="Saving…" onClick={save.run}>
              Save changes
            </LoadingButton>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
