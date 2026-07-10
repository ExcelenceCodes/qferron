import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SidePanel } from "@/components/ui/side-panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RULES, type Rule } from "@/lib/mock/app";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/rules")({
  head: () => ({ meta: [{ title: "Automations — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: RulesPage,
});

function RulesPage() {
  const [selected, setSelected] = useState<Rule | null>(null);
  const [deleteFor, setDeleteFor] = useState<Rule | null>(null);

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
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className="w-full rounded-lg border border-border bg-background/60 p-4 text-left transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-mono">IF</span> {r.match}{" "}
                          <span className="font-mono">→</span> {r.action}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline">{r.hits} hits</Badge>
                          <Badge variant={r.enabled ? "default" : "secondary"}>{r.enabled ? "Active" : "Paused"}</Badge>
                        </div>
                      </div>
                      <Switch defaultChecked={r.enabled} onClick={(e) => e.stopPropagation()} aria-label={`Toggle ${r.name}`} />
                    </div>
                  </button>
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

      <SidePanel
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        title={selected?.name ?? "Rule"}
        description={selected ? `${selected.hits} hits · ${selected.enabled ? "Active" : "Paused"}` : undefined}
        footer={
          selected && (
            <div className="flex justify-between">
              <Button variant="outline" size="sm">Edit rule</Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteFor(selected)}>Delete</Button>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm">
              <p><span className="text-muted-foreground">IF</span> {selected.match}</p>
              <p className="mt-2"><span className="text-muted-foreground">THEN</span> {selected.action}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Recent hits</h4>
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border text-sm">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="flex items-center justify-between p-3">
                    <span>Applied to transaction #{1000 + i}</span>
                    <span className="text-xs text-muted-foreground">2d ago</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </SidePanel>

      <AlertDialog open={!!deleteFor} onOpenChange={(v) => !v && setDeleteFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this automation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the rule from running. Past applications are kept in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("Rule deleted");
                setDeleteFor(null);
                setSelected(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
