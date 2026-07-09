import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({ meta: [{ title: "Reports — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: ReportsPage,
});

const CATS = [
  { name: "Groceries", pct: 22, amount: 645 },
  { name: "Rent", pct: 34, amount: 1000 },
  { name: "Transport", pct: 12, amount: 350 },
  { name: "Dining", pct: 9, amount: 260 },
  { name: "Software", pct: 6, amount: 175 },
  { name: "Other", pct: 17, amount: 500 },
];

function ReportsPage() {
  return (
    <AppShell
      nav={USER_NAV}
      title="Reports"
      subtitle="Monthly summaries and tax-ready exports."
      headerRight={
        <Button size="sm" variant="outline">
          <Download className="mr-1.5 h-4 w-4" /> Export PDF
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Spend this month" value="$2,930" hint="−7% vs. last month" tone="positive" />
        <StatCard label="Savings rate" value="18%" hint="Target 20%" />
        <StatCard label="Top category" value="Rent" hint="34% of spend" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Spend by category">
          <ul className="space-y-3">
            {CATS.map((c) => (
              <li key={c.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground">{c.name}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">${c.amount}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Monthly cash flow">
          <div className="flex h-52 items-end gap-2">
            {[45, 60, 40, 72, 58, 80, 66].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Last 7 months (mocked)</p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
