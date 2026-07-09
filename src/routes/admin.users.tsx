import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_USERS } from "@/lib/mock/app";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Users" subtitle="Search, inspect and manage users.">
      <SectionCard
        title="All users"
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users…" className="h-8 pl-8 w-64" />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Country</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 pr-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ADMIN_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-accent/40">
                  <td className="py-3 font-medium text-foreground">{u.name}</td>
                  <td className="py-3 text-muted-foreground">{u.email}</td>
                  <td className="py-3 text-muted-foreground">{u.country}</td>
                  <td className="py-3"><Badge variant="outline">{u.plan}</Badge></td>
                  <td className="py-3">
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{formatDate(u.joinedAt)}</td>
                  <td className="py-3 pr-2 text-right">
                    <Button variant="ghost" size="sm">Inspect</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
