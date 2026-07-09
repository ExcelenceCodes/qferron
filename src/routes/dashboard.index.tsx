import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, TRANSACTIONS } from "@/lib/mock/app";
import { formatMoney, formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const netUSD = ACCOUNTS.reduce(
    (s, a) => s + (a.currency === "USD" ? a.balance : a.balance * 0.0075),
    0,
  );
  const inflow = TRANSACTIONS.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const outflow = TRANSACTIONS.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
  const recent = TRANSACTIONS.slice(0, 6);

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
        <StatCard label="Net worth (USD est.)" value={formatMoney(netUSD)} hint="Across 6 accounts" />
        <StatCard label="Inflow this month" value={formatMoney(inflow)} hint="+3 transactions" tone="positive" />
        <StatCard label="Outflow this month" value={formatMoney(outflow)} hint="5 transactions" tone="negative" />
        <StatCard label="Automation hits" value="51" hint="2 active rules" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent transactions"
            action={
              <Link to="/dashboard/transactions" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            }
          >
            <ul className="divide-y divide-border">
              {recent.map((t) => {
                const acct = ACCOUNTS.find((a) => a.id === t.accountId);
                const positive = t.direction === "in";
                return (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {positive ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.merchant}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.category} · {acct?.name} · {formatDate(t.date)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-mono text-sm tabular-nums ${positive ? "text-success" : "text-foreground"}`}>
                      {positive ? "+" : "−"}
                      {formatMoney(t.amount, t.currency)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>
        <div className="space-y-4">
          <SectionCard title="AI accountant">
            <p className="text-sm text-muted-foreground">
              Ferron finished categorizing 12 transactions and drafted your July report.
            </p>
            <Link to="/dashboard/chat" className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                <Sparkles className="mr-1.5 h-4 w-4" /> Ask Ferron
              </Button>
            </Link>
          </SectionCard>
          <SectionCard title="Accounts">
            <ul className="space-y-2.5">
              {ACCOUNTS.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{a.name}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">{formatMoney(a.balance, a.currency)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
