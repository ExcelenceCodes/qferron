import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RULES } from "@/lib/mock/app";

export const Route = createFileRoute("/dashboard/rules")({
  head: () => ({ meta: [{ title: "Automations — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <AppShell
      nav={USER_NAV}
      title="Automations"
      subtitle="Recurring transactions and per-transaction rules."
      headerRight={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> New rule
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Your rules">
            <ul className="space-y-3">
              {RULES.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">IF</span> {r.match} <span className="font-mono">→</span> {r.action}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">{r.hits} hits</Badge>
                        <Badge variant={r.enabled ? "default" : "secondary"}>{r.enabled ? "Active" : "Paused"}</Badge>
                      </div>
                    </div>
                    <Switch defaultChecked={r.enabled} aria-label={`Toggle ${r.name}`} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
        <SectionCard title="Suggested by Ferron">
          <div className="space-y-3">
            <div className="rounded-lg border border-dashed border-border p-3">
              <p className="text-sm font-medium text-foreground">Auto-save 10% of every salary</p>
              <p className="mt-1 text-xs text-muted-foreground">Detected 3 salary deposits.</p>
              <Button size="sm" variant="outline" className="mt-2">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Enable
              </Button>
            </div>
            <div className="rounded-lg border border-dashed border-border p-3">
              <p className="text-sm font-medium text-foreground">Categorize Uber as Transport</p>
              <p className="mt-1 text-xs text-muted-foreground">Applies to 8 past transactions.</p>
              <Button size="sm" variant="outline" className="mt-2">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Enable
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
