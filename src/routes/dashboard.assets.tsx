import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ASSETS } from "@/lib/mock/app";
import { formatMoney, formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/assets")({
  head: () => ({ meta: [{ title: "Assets — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: AssetsPage,
});

function AssetsPage() {
  const total = ASSETS.reduce((s, a) => s + a.value, 0);
  return (
    <AppShell
      nav={USER_NAV}
      title="Assets"
      subtitle="Everything you own, including a Smart Buy check."
      headerRight={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Register asset
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total asset value" value={formatMoney(total)} hint={`${ASSETS.length} assets`} />
        <StatCard label="Appreciating" value="2" hint="Property + ETF" tone="positive" />
        <StatCard label="Depreciating" value="1" hint="Vehicle" tone="negative" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Your assets">
            <ul className="divide-y divide-border">
              {ASSETS.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-1.5">{a.kind}</Badge>
                      Acquired {formatDate(a.acquiredAt)}
                    </p>
                  </div>
                  <p className="font-mono tabular-nums text-foreground">{formatMoney(a.value, a.currency)}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
        <SectionCard title="Smart Buy">
          <p className="text-sm text-muted-foreground">
            Thinking of a purchase? Ferron scores affordability against your accounts, upcoming bills and savings goals.
          </p>
          <Button className="mt-4" size="sm">
            <Sparkles className="mr-1.5 h-4 w-4" /> Run a Smart Buy check
          </Button>
        </SectionCard>
      </div>
    </AppShell>
  );
}
