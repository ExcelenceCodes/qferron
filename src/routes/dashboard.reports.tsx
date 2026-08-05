import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Download, Mail, PieChart, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAuth } from "@/lib/auth";
import { useBaseCurrency } from "@/lib/base-currency";
import { formatMoney } from "@/lib/format";
import { useTransactions } from "@/lib/queries/finance";
import { useCreateNotification } from "@/lib/queries/platform";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({
    meta: [{ title: "Reports — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: ReportsPage,
});

function monthKey(d: string) {
  return d.slice(0, 7);
}

function ReportsPage() {
  const { data: txs, isLoading } = useTransactions();
  const { currency } = useBaseCurrency();
  const [mailOpen, setMailOpen] = useState(false);

  const rows = useMemo(() => txs ?? [], [txs]);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const report = useMemo(() => {
    const current = rows.filter((t) => monthKey(t.occurred_at) === thisMonth);
    const spend = current
      .filter((t) => t.direction === "out")
      .reduce((s, t) => s + Number(t.amount), 0);
    const income = current
      .filter((t) => t.direction === "in")
      .reduce((s, t) => s + Number(t.amount), 0);

    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevKey = prevDate.toISOString().slice(0, 7);
    const prevSpend = rows
      .filter((t) => monthKey(t.occurred_at) === prevKey && t.direction === "out")
      .reduce((s, t) => s + Number(t.amount), 0);

    const byCategory = new Map<string, number>();
    for (const t of current) {
      if (t.direction !== "out") continue;
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Number(t.amount));
    }
    const cats = [...byCategory.entries()]
      .map(([name, amount]) => ({ name, amount, pct: spend > 0 ? (amount / spend) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    // last 7 months cash flow (net)
    const months: { key: string; net: number; out: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const m = rows.filter((t) => monthKey(t.occurred_at) === key);
      months.push({
        key,
        net: m.reduce((s, t) => s + (t.direction === "in" ? 1 : -1) * Number(t.amount), 0),
        out: m.filter((t) => t.direction === "out").reduce((s, t) => s + Number(t.amount), 0),
      });
    }

    const savingsRate = income > 0 ? ((income - spend) / income) * 100 : 0;
    const delta = prevSpend > 0 ? ((spend - prevSpend) / prevSpend) * 100 : 0;
    return { spend, income, cats, months, savingsRate, delta, count: current.length };
  }, [rows, thisMonth]);

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error("Nothing to export yet");
      return;
    }
    const header = "date,direction,amount,currency,category,merchant,note";
    const body = rows
      .map((t) =>
        [
          t.occurred_at,
          t.direction,
          t.amount,
          t.currency,
          `"${(t.category ?? "").replace(/"/g, '""')}"`,
          `"${(t.merchant ?? "").replace(/"/g, '""')}"`,
          `"${(t.note ?? "").replace(/"/g, '""')}"`,
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ferron-report-${thisMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  const maxOut = Math.max(...report.months.map((m) => m.out), 1);

  return (
    <AppShell
      nav={USER_NAV}
      title="Reports"
      subtitle="Monthly summaries and tax-ready exports."
      headerRight={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setMailOpen(true)}>
            <Mail className="mr-1.5 h-4 w-4" /> Mail me
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Spend this month"
          value={formatMoney(report.spend, currency)}
          hint={
            report.delta === 0
              ? "No prior month data"
              : `${report.delta > 0 ? "+" : ""}${report.delta.toFixed(0)}% vs. last month`
          }
          tone={report.delta > 0 ? "negative" : "positive"}
          icon={ArrowDownRight}
        />
        <StatCard
          label="Income this month"
          value={formatMoney(report.income, currency)}
          hint={`${report.count} transactions`}
          tone="positive"
          icon={ArrowUpRight}
        />
        <StatCard
          label="Savings rate"
          value={`${report.savingsRate.toFixed(0)}%`}
          hint="Target 20%"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Spend by category">
          {isLoading ? (
            <ListSkeleton />
          ) : report.cats.length === 0 ? (
            <EmptyState
              icon={PieChart}
              title="No spending this month"
              description="Record transactions and your category breakdown appears here."
            />
          ) : (
            <ul className="space-y-3">
              {report.cats.map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground">{c.name}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {formatMoney(c.amount, currency)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Monthly cash flow">
          <div className="flex h-52 items-end gap-2">
            {report.months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/70"
                  style={{ height: `${Math.max((m.out / maxOut) * 170, 4)}px` }}
                  title={`${m.key}: ${formatMoney(m.out, currency)} out`}
                />
                <span className="text-[10px] text-muted-foreground">{m.key.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Outflow across the last 7 months, from your live transactions.
          </p>
        </SectionCard>
      </div>

      <MailMeDialog open={mailOpen} onOpenChange={setMailOpen} month={thisMonth} />
    </AppShell>
  );
}

function MailMeDialog({
  open,
  onOpenChange,
  month,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  month: string;
}) {
  const { profile } = useAuth();
  const notify = useCreateNotification();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> Mail me this report
          </DialogTitle>
          <DialogDescription>We'll queue a summary and confirm it in your inbox.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            try {
              await notify.mutateAsync({
                title: "Report requested",
                body: `Your ${month} report was queued for ${String(fd.get("email"))}.`,
                category: "system",
                href: "/dashboard/reports",
              });
              toast.success("Report queued", {
                description: "You'll be notified when it's ready.",
              });
              onOpenChange(false);
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="mail-to">Email</Label>
            <Input
              id="mail-to"
              name="email"
              type="email"
              required
              defaultValue={profile?.email ?? ""}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mail-subject">Subject</Label>
            <Input id="mail-subject" name="subject" defaultValue={`Your Ferron report — ${month}`} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={notify.isPending} loadingText="Sending…">
              <Mail className="mr-1.5 h-4 w-4" /> Send report
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
