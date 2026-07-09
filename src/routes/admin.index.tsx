import { createFileRoute } from "@tanstack/react-router";
import { Activity, TrendingUp, Users2, Wallet } from "lucide-react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin overview — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

function AdminHome() {
  return (
    <AppShell nav={ADMIN_NAV} title="Admin overview" subtitle="Real-time stats and operational health.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active users (24h)" value="4,218" hint="+3.4% vs. yesterday" tone="positive" />
        <StatCard label="Total accounts" value="68,412" hint="+82 today" />
        <StatCard label="Transactions / min" value="27" hint="Steady" />
        <StatCard label="Support tickets" value="6" hint="2 new" tone="negative" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Traffic (last 14 days)">
            <div className="flex h-56 items-end gap-1.5">
              {[40, 52, 48, 60, 66, 72, 68, 75, 80, 78, 82, 90, 88, 92].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-secondary" style={{ height: `${h}%` }} />
              ))}
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Live activity">
          <ul className="space-y-3 text-sm">
            <Live icon={Users2} text="New signup — sara@…" ago="2m" />
            <Live icon={Wallet} text="Account created — Bank" ago="4m" />
            <Live icon={Activity} text="Rule triggered — 500 hits" ago="9m" />
            <Live icon={TrendingUp} text="Upgrade to Pro — diego@…" ago="14m" />
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}

function Live({ icon: Icon, text, ago }: { icon: any; text: string; ago: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" /> {text}
      </span>
      <span className="text-xs text-muted-foreground">{ago}</span>
    </li>
  );
}
