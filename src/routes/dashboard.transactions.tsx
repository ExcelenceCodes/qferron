import { createFileRoute } from "@tanstack/react-router";
import { Filter, Plus, Search } from "lucide-react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ACCOUNTS, TRANSACTIONS } from "@/lib/mock/app";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <AppShell
      nav={USER_NAV}
      title="Transactions"
      subtitle="Search, filter and review every movement."
      headerRight={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add
        </Button>
      }
    >
      <SectionCard
        title="All transactions"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search merchants…" className="h-8 pl-8 w-56" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-1.5 h-3.5 w-3.5" /> Filter
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Merchant</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 pr-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TRANSACTIONS.map((t) => {
                const a = ACCOUNTS.find((x) => x.id === t.accountId);
                const positive = t.direction === "in";
                return (
                  <tr key={t.id} className="hover:bg-accent/40">
                    <td className="py-3 text-muted-foreground">{formatDate(t.date)}</td>
                    <td className="py-3 font-medium text-foreground">{t.merchant}</td>
                    <td className="py-3">
                      <Badge variant="outline">{t.category}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{a?.name}</td>
                    <td className={`py-3 pr-2 text-right font-mono tabular-nums ${positive ? "text-success" : "text-foreground"}`}>
                      {positive ? "+" : "−"}
                      {formatMoney(t.amount, t.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
