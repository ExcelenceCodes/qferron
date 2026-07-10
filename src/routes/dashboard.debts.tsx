import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Plus, Scale } from "lucide-react";
import { useState } from "react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidePanel } from "@/components/ui/side-panel";
import { DEBTS, type DebtRecord } from "@/lib/mock/debts";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/debts")({
  head: () => ({ meta: [{ title: "Debts & Credits — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: DebtsPage,
});

function DebtsPage() {
  const [selected, setSelected] = useState<DebtRecord | null>(null);

  const owed = DEBTS.filter((d) => d.kind === "debt" && d.status !== "paid").reduce((s, d) => s + d.outstanding, 0);
  const owing = DEBTS.filter((d) => d.kind === "credit" && d.status !== "paid").reduce((s, d) => s + d.outstanding, 0);
  const overdue = DEBTS.filter((d) => d.status === "overdue").length;

  return (
    <AppShell
      nav={USER_NAV}
      title="Debts & Credits"
      subtitle="Loans you owe, money owed to you, and overdue detection."
      headerRight={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> New record
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="You owe" value={formatMoney(owed)} tone="negative" icon={ArrowUpRight} />
        <StatCard label="Owed to you" value={formatMoney(owing)} tone="positive" icon={ArrowDownLeft} />
        <StatCard label="Overdue records" value={String(overdue)} tone={overdue ? "negative" : "default"} icon={AlertTriangle} />
      </div>

      <div className="mt-6">
        <SectionCard title="All debts & credits">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Kind</th>
                  <th className="pb-3 font-medium">Counterparty</th>
                  <th className="pb-3 font-medium">Outstanding</th>
                  <th className="pb-3 font-medium">Due</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 pr-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEBTS.map((d) => (
                  <tr key={d.id} className="hover:bg-accent/40">
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                        <Scale className="h-3.5 w-3.5" /> {d.kind}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-foreground">{d.counterparty}</td>
                    <td className="py-3 font-mono tabular-nums text-foreground">{formatMoney(d.outstanding, d.currency)}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(d.dueDate)}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          d.status === "overdue"
                            ? "destructive"
                            : d.status === "paid"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(d)}>Open</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SidePanel
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        title={selected?.counterparty ?? ""}
        description={selected ? `${selected.kind.toUpperCase()} · ${selected.status}` : undefined}
        footer={
          selected && (
            <div className="flex justify-between">
              <Button variant="outline" size="sm">Log payment</Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Principal" value={formatMoney(selected.principal, selected.currency)} />
              <StatCard label="Outstanding" value={formatMoney(selected.outstanding, selected.currency)} tone={selected.status === "paid" ? "positive" : "default"} />
              <StatCard label="Interest" value={selected.interestPct ? `${selected.interestPct}%` : "—"} />
            </div>
            {selected.status === "overdue" && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="h-5 w-5" /> Payment is overdue since {formatDate(selected.dueDate)}.
              </div>
            )}
            {selected.note && (
              <div className="rounded-lg border border-border bg-card p-4 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Note</p>
                <p className="mt-1">{selected.note}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold">Payment history</h4>
              <ul className="mt-2 divide-y divide-border rounded-lg border border-border text-sm">
                <li className="flex items-center justify-between p-3"><span>Initial disbursement</span><span className="font-mono">{formatMoney(selected.principal, selected.currency)}</span></li>
                {selected.outstanding < selected.principal && (
                  <li className="flex items-center justify-between p-3"><span>Payment received</span><span className="font-mono text-success">−{formatMoney(selected.principal - selected.outstanding, selected.currency)}</span></li>
                )}
              </ul>
            </div>
          </div>
        )}
      </SidePanel>
    </AppShell>
  );
}
