import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Moderation — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminModerationPage,
});

const ITEMS = [
  { id: "r1", who: "sara@ferron.app", what: "Reported comment in shared account 'Roommates'", severity: "low" },
  { id: "r2", who: "jonas@ferron.app", what: "Suspicious login attempts (5)", severity: "high" },
  { id: "r3", who: "diego@ferron.app", what: "Blog comment flagged as spam", severity: "medium" },
];

function AdminModerationPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Moderation" subtitle="Reports, flags and safety actions.">
      <SectionCard title="Open reports">
        <ul className="divide-y divide-border">
          {ITEMS.map((i) => (
            <li key={i.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{i.what}</p>
                <p className="text-xs text-muted-foreground">By {i.who}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={i.severity === "high" ? "destructive" : i.severity === "medium" ? "default" : "outline"}
                >
                  {i.severity}
                </Badge>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </AppShell>
  );
}
