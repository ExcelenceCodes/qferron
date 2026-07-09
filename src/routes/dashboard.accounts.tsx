import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users2 } from "lucide-react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACCOUNTS } from "@/lib/mock/app";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: AccountsPage,
});

function AccountsPage() {
  return (
    <AppShell
      nav={USER_NAV}
      title="Accounts"
      subtitle="Bank, cash, mobile money, e-wallets and shared pools."
      headerRight={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add account
        </Button>
      }
    >
      <SectionCard title="All accounts">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACCOUNTS.map((a) => (
            <div key={a.id} className="rounded-lg border border-border bg-background/60 p-4 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.name}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{a.type}</p>
                </div>
                {a.shared && (
                  <Badge variant="secondary" className="gap-1">
                    <Users2 className="h-3 w-3" /> {a.members}
                  </Badge>
                )}
              </div>
              <p className="mt-4 font-mono text-xl font-semibold tabular-nums text-foreground">
                {formatMoney(a.balance, a.currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Updated {formatDate(a.updatedAt)}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
