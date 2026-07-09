import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminAnalyticsPage,
});

const COUNTRIES = [
  { name: "United States", pct: 28 },
  { name: "Kenya", pct: 14 },
  { name: "Nigeria", pct: 11 },
  { name: "India", pct: 10 },
  { name: "Germany", pct: 8 },
  { name: "Mexico", pct: 6 },
  { name: "Others", pct: 23 },
];

function AdminAnalyticsPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Analytics" subtitle="Growth, retention and engagement.">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="MAU" value="42,910" tone="positive" hint="+6.2%" />
        <StatCard label="DAU" value="9,182" hint="+2.1%" tone="positive" />
        <StatCard label="Retention D30" value="61%" />
        <StatCard label="ARPU" value="$4.20" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Signups (weekly)">
          <div className="flex h-56 items-end gap-2">
            {[30, 44, 52, 48, 62, 68, 72, 78, 82, 76, 88, 92].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary" style={{ height: `${h}%` }} />
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Users by country">
          <ul className="space-y-3">
            {COUNTRIES.map((c) => (
              <li key={c.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground">{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">{c.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${c.pct * 3}%`, maxWidth: "100%" }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
