import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { ACCOUNTS } from "@/lib/mock/app";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminAccountsPage,
});

function AdminAccountsPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Accounts" subtitle="System-wide account inventory.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total accounts" value="68,412" />
        <StatCard label="Shared pools" value="1,204" hint="+18 this week" />
        <StatCard label="Avg balance (USD est.)" value="$2,140" />
      </div>
      <div className="mt-6">
        <SectionCard title="Recent accounts">
          <ul className="divide-y divide-border">
            {ACCOUNTS.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-1.5">{a.type}</Badge>
                    Currency {a.currency}
                  </p>
                </div>
                <p className="font-mono text-sm tabular-nums text-foreground">{formatMoney(a.balance, a.currency)}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
