import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { ACCOUNTS, TRANSACTIONS } from "@/lib/mock/app";
import { formatDate, formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminTxPage,
});

function AdminTxPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Transactions" subtitle="Global transaction stream.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Transactions today" value="38,910" />
        <StatCard label="Total value moved (USD)" value="$1.42M" />
        <StatCard label="Flagged for review" value="12" tone="negative" />
      </div>
      <div className="mt-6">
        <SectionCard title="Recent activity">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Merchant</th>
                  <th className="pb-3 font-medium">Account</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 pr-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TRANSACTIONS.map((t) => {
                  const a = ACCOUNTS.find((x) => x.id === t.accountId);
                  return (
                    <tr key={t.id}>
                      <td className="py-3 text-muted-foreground">{formatDate(t.date)}</td>
                      <td className="py-3 font-medium text-foreground">{t.merchant}</td>
                      <td className="py-3 text-muted-foreground">{a?.name}</td>
                      <td className="py-3"><Badge variant="outline">{t.category}</Badge></td>
                      <td className="py-3 pr-2 text-right font-mono tabular-nums">{formatMoney(t.amount, t.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
