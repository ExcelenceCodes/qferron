import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Coins, Plus, Repeat2, Scale, Sparkles, Wallet } from "lucide-react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { useAccounts, useAssets, useDebts, useTransactions } from "@/lib/queries/finance";
import { useInvestments } from "@/lib/queries/investments";
import { useBaseCurrency } from "@/lib/base-currency";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { currency } = useBaseCurrency();
  const { data: accounts } = useAccounts();
  const { data: transactions, isLoading } = useTransactions();
  const { data: assets } = useAssets();
  const { data: debts } = useDebts();
  const { data: investments } = useInvestments();

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthKey = monthStart.toISOString().slice(0, 10);

  const balance = (accounts ?? []).reduce((s, a) => s + Number(a.balance), 0);
  const assetValue = (assets ?? []).reduce((s, a) => s + Number(a.value), 0);
  const investValue = (investments ?? []).reduce((s, i) => s + Number(i.current_value), 0);
  const investProfit = (investments ?? []).reduce(
    (s, i) => s + Number(i.current_value) - Number(i.principal),
    0,
  );
  const owed = (debts ?? [])
    .filter((d) => d.kind === "loan" && d.status !== "settled")
    .reduce((s, d) => s + Number(d.outstanding), 0);
  const netWorth = balance + assetValue + investValue - owed;

  const thisMonth = (transactions ?? []).filter((t) => t.occurred_at >= monthKey);
  const inflow = thisMonth.filter((t) => t.direction === "in").reduce((s, t) => s + Number(t.amount), 0);
  const outflow = thisMonth.filter((t) => t.direction === "out").reduce((s, t) => s + Number(t.amount), 0);
  const recent = (transactions ?? []).slice(0, 6);

  return (
    <AppShell
      nav={USER_NAV}
      title="Overview"
      subtitle="A quiet, complete picture of your money."
      headerRight={
        <Link to="/dashboard/transactions">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> New transaction
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net worth"
          value={formatMoney(netWorth, currency)}
          hint={`${accounts?.length ?? 0} accounts · ${assets?.length ?? 0} assets`}
          icon={Wallet}
        />
        <StatCard
          label="Inflow this month"
          value={formatMoney(inflow, currency)}
          hint={`${thisMonth.filter((t) => t.direction === "in").length} transactions`}
          tone="positive"
          icon={ArrowDownRight}
        />
        <StatCard
          label="Outflow this month"
          value={formatMoney(outflow, currency)}
          hint={`${thisMonth.filter((t) => t.direction === "out").length} transactions`}
          tone="negative"
          icon={ArrowUpRight}
        />
        <StatCard
          label="Outstanding debt"
          value={formatMoney(owed, currency)}
          hint={`${(debts ?? []).filter((d) => d.status === "overdue").length} overdue`}
          tone={owed ? "negative" : "default"}
          icon={Scale}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent transactions"
            action={
              <Link
                to="/dashboard/transactions"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            }
          >
            {isLoading ? (
              <ListSkeleton />
            ) : recent.length === 0 ? (
              <EmptyState
                icon={Repeat2}
                title="No activity yet"
                description="Add your first transaction and your overview will fill up instantly."
                action={
                  <Link to="/dashboard/transactions">
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" /> Add transaction
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((t) => {
                  const acct = accounts?.find((a) => a.id === t.account_id);
                  const positive = t.direction === "in";
                  return (
                    <li key={t.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                        >
                          {positive ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {t.merchant || t.category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.category} · {acct?.name ?? "—"} · {formatDate(t.occurred_at)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-mono text-sm tabular-nums ${positive ? "text-success" : "text-foreground"}`}
                      >
                        {positive ? "+" : "−"}
                        {formatMoney(Number(t.amount), t.currency)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
        <div className="space-y-4">
          <SectionCard title="AI accountant">
            <p className="text-sm text-muted-foreground">
              Ferron is watching {transactions?.length ?? 0} transactions across{" "}
              {accounts?.length ?? 0} accounts. Ask anything about your money.
            </p>
            <Link to="/dashboard/chat" className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                <Sparkles className="mr-1.5 h-4 w-4" /> Ask Ferron
              </Button>
            </Link>
          </SectionCard>
          <SectionCard
            title="Accounts"
            action={
              <Link to="/dashboard/accounts" className="text-xs font-medium text-primary hover:underline">
                Manage
              </Link>
            }
          >
            {(accounts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {(accounts ?? []).slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{a.name}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {formatMoney(Number(a.balance), a.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
          <SectionCard
            title="Assets"
            action={
              <Link to="/dashboard/assets" className="text-xs font-medium text-primary hover:underline">
                View
              </Link>
            }
          >
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4 text-primary" />
              {formatMoney(assetValue, currency)} registered
            </p>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
