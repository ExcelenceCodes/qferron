import { createFileRoute } from "@tanstack/react-router";
import { Copy, Plus, Users2 } from "lucide-react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACCOUNTS } from "@/lib/mock/app";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/shared")({
  head: () => ({ meta: [{ title: "Shared accounts — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: SharedPage,
});

function SharedPage() {
  const shared = ACCOUNTS.filter((a) => a.shared);
  return (
    <AppShell
      nav={USER_NAV}
      title="Shared accounts"
      subtitle="Groups, roles and six-digit join codes."
      headerRight={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> New shared account
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {shared.map((a) => (
          <SectionCard
            key={a.id}
            title={a.name}
            action={
              <Badge variant="secondary" className="gap-1">
                <Users2 className="h-3 w-3" /> {a.members} members
              </Badge>
            }
          >
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-xl font-semibold text-foreground">{formatMoney(a.balance, a.currency)}</p>
              <p className="text-xs text-muted-foreground">Pool balance</p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md bg-muted p-3">
              <div>
                <p className="text-xs text-muted-foreground">Join code</p>
                <p className="font-mono text-lg tracking-widest text-foreground">482 019</p>
              </div>
              <Button variant="ghost" size="sm">
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Members</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                <li className="flex justify-between"><span>Alex (you)</span><Badge>Manager</Badge></li>
                <li className="flex justify-between"><span>Priya</span><Badge variant="outline">Contributor</Badge></li>
                <li className="flex justify-between"><span>Diego</span><Badge variant="outline">Viewer</Badge></li>
                <li className="flex justify-between"><span>Sara</span><Badge variant="outline">Viewer</Badge></li>
              </ul>
            </div>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
