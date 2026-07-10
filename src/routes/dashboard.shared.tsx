import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Copy, Plus, Users2 } from "lucide-react";
import { useState } from "react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ACCOUNTS } from "@/lib/mock/app";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/shared")({
  head: () => ({ meta: [{ title: "Shared accounts — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: SharedPage,
});

const MEMBERS_BY_ACCOUNT: Record<string, { name: string; role: string; contribution: number }[]> = {
  a6: [
    { name: "Alex (you)", role: "Manager", contribution: 1200 },
    { name: "Priya", role: "Contributor", contribution: 800 },
    { name: "Diego", role: "Viewer", contribution: 600 },
    { name: "Sara", role: "Viewer", contribution: 600 },
  ],
};

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
        {shared.map((a) => {
          const members = MEMBERS_BY_ACCOUNT[a.id] ?? [];
          return (
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
              <Collapsible className="mt-4">
                <CollapsibleTrigger asChild>
                  <button className="group flex w-full items-center justify-between rounded-md border border-border p-3 text-left text-sm hover:bg-accent/50">
                    <span className="font-medium">Members ({members.length})</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-2 space-y-2 rounded-md border border-border p-3 text-sm">
                    {members.map((m) => (
                      <li key={m.name}>
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <button className="flex w-full items-center justify-between rounded-md py-1.5 text-left hover:bg-accent/30">
                              <span className="flex items-center gap-2">
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                                {m.name}
                              </span>
                              <Badge variant={m.role === "Manager" ? "default" : "outline"}>{m.role}</Badge>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-6 mt-2 space-y-1 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                              <div className="flex justify-between"><span>Contribution</span><span className="font-mono text-foreground">{formatMoney(m.contribution, a.currency)}</span></div>
                              <div className="flex justify-between"><span>Last activity</span><span>2 days ago</span></div>
                              <div className="flex justify-between"><span>Comments</span><span>{Math.floor(Math.random() * 12) + 1}</span></div>
                              <div className="flex justify-between"><span>Joined</span><span>Mar 12, 2026</span></div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </SectionCard>
          );
        })}
      </div>
    </AppShell>
  );
}
