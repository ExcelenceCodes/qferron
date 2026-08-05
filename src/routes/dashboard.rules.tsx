import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Sparkles, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { SidePanel } from "@/components/ui/side-panel";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  useCreateRule,
  useDeleteRule,
  useRules,
  useUpdateRule,
  type RuleRow,
} from "@/lib/queries/platform";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/rules")({
  head: () => ({
    meta: [{ title: "Automations — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: RulesPage,
});

const SUGGESTIONS = [
  {
    name: "Auto-save 10% of every salary",
    match_expr: "category = 'Salary' AND direction = 'in'",
    action_expr: "transfer 10% to Savings",
  },
  {
    name: "Categorize Uber as Transport",
    match_expr: "merchant contains 'Uber'",
    action_expr: "set category = 'Transport'",
  },
];

function RulesPage() {
  const { data: rules, isLoading } = useRules();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RuleRow | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteFor, setDeleteFor] = useState<RuleRow | null>(null);

  const rows = rules ?? [];
  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const active = rows.filter((r) => r.enabled).length;
  const hits = rows.reduce((s, r) => s + r.hits, 0);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <AppShell
      nav={USER_NAV}
      title="Automations"
      subtitle="Recurring transactions and per-transaction rules."
      headerRight={
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> New rule
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Rules" value={String(rows.length)} icon={Sparkles} />
        <StatCard label="Active" value={String(active)} tone="positive" icon={Zap} />
        <StatCard label="Total hits" value={String(hits)} icon={Sparkles} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Your rules">
            {isLoading ? (
              <ListSkeleton />
            ) : rows.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No automations yet"
                description="Create a rule to categorize, tag or move money automatically."
                action={
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="mr-1.5 h-4 w-4" /> New rule
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {rows.map((r) => (
                  <li key={r.id}>
                    <div className="rounded-lg border border-border bg-background/60 p-4 transition-colors hover:border-primary/40">
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedId(r.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="text-sm font-semibold text-foreground">{r.name}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            <span className="font-mono">IF</span> {r.match_expr}{" "}
                            <span className="font-mono">→</span> {r.action_expr}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">{r.hits} hits</Badge>
                            <Badge variant={r.enabled ? "default" : "secondary"}>
                              {r.enabled ? "Active" : "Paused"}
                            </Badge>
                          </div>
                        </button>
                        <Switch
                          checked={r.enabled}
                          aria-label={`Toggle ${r.name}`}
                          onCheckedChange={(v) =>
                            updateRule.mutate(
                              { id: r.id, enabled: v },
                              {
                                onSuccess: () => toast.success(v ? "Rule activated" : "Rule paused"),
                                onError: (e) => toast.error(e.message),
                              },
                            )
                          }
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Suggested by Ferron">
          <div className="space-y-3">
            {SUGGESTIONS.map((s) => (
              <div key={s.name} className="rounded-lg border border-dashed border-border p-3">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-mono">IF</span> {s.match_expr}
                </p>
                <LoadingButton
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  loading={createRule.isPending}
                  onClick={() =>
                    createRule.mutate(
                      { ...s, enabled: true },
                      {
                        onSuccess: () => toast.success("Rule enabled"),
                        onError: (e) => toast.error(e.message),
                      },
                    )
                  }
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Enable
                </LoadingButton>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <RuleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        rule={editing}
        onSubmit={async (values) => {
          if (editing) {
            await updateRule.mutateAsync({ id: editing.id, ...values });
            toast.success("Rule updated");
          } else {
            await createRule.mutateAsync(values);
            toast.success("Rule created");
          }
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <SidePanel
        open={!!selected}
        onOpenChange={(v) => !v && setSelectedId(null)}
        title={selected?.name ?? "Rule"}
        description={
          selected
            ? `${selected.hits} hits · ${selected.enabled ? "Active" : "Paused"} · created ${formatDate(selected.created_at)}`
            : undefined
        }
        footer={
          selected && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(selected);
                  setFormOpen(true);
                }}
              >
                <Pencil className="mr-1.5 h-4 w-4" /> Edit rule
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteFor(selected)}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm">
              <p>
                <span className="text-muted-foreground">IF</span> {selected.match_expr}
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground">THEN</span> {selected.action_expr}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Enabled</p>
                <p className="text-xs text-muted-foreground">Pause without deleting history.</p>
              </div>
              <Switch
                checked={selected.enabled}
                onCheckedChange={(v) => updateRule.mutate({ id: selected.id, enabled: v })}
              />
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
                const id = deleteFor!.id;
                deleteRule.mutate(id, {
                  onSuccess: () => toast.success("Rule deleted"),
                  onError: (e) => toast.error(e.message),
                });
                setDeleteFor(null);
                setSelectedId(null);
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

function RuleFormDialog({
  open,
  onOpenChange,
  rule,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule: RuleRow | null;
  onSubmit: (values: { name: string; match_expr: string; action_expr: string }) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rule ? "Edit rule" : "New automation"}</DialogTitle>
          <DialogDescription>
            Describe what to match and what Ferron should do about it.
          </DialogDescription>
        </DialogHeader>
        <form
          key={rule?.id ?? "new"}
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setSaving(true);
            try {
              await onSubmit({
                name: String(fd.get("name")),
                match_expr: String(fd.get("match_expr")),
                action_expr: String(fd.get("action_expr")),
              });
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="rule-name">Rule name</Label>
            <Input id="rule-name" name="name" required defaultValue={rule?.name ?? ""} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rule-match">If (match)</Label>
            <Input
              id="rule-match"
              name="match_expr"
              required
              placeholder="merchant contains 'Uber'"
              defaultValue={rule?.match_expr ?? ""}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rule-action">Then (action)</Label>
            <Input
              id="rule-action"
              name="action_expr"
              required
              placeholder="set category = 'Transport'"
              defaultValue={rule?.action_expr ?? ""}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={saving} loadingText="Saving…">
              {rule ? "Save changes" : "Create rule"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
