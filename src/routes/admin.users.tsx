import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_USERS, type AdminUser } from "@/lib/mock/app";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsersPage,
});

// Simulate a larger table.
const EXTENDED: AdminUser[] = Array.from({ length: 120 }).flatMap((_, i) =>
  ADMIN_USERS.map((u) => ({ ...u, id: `${u.id}-${i}`, email: `${u.email.split("@")[0]}+${i}@ferron.app` })),
);

const PAGE_SIZE = 25;

function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? EXTENDED.filter((u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle) || u.country.toLowerCase().includes(needle))
      : EXTENDED;
  }, [q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell nav={ADMIN_NAV} title="Users" subtitle={`${filtered.length.toLocaleString()} users · Page ${page} of ${pages}`}>
      <SectionCard
        title="All users"
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email or country…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="h-8 w-72 pl-8"
            />
          </div>
        }
      >
        <div className="max-h-[65vh] overflow-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Country</th>
                <th className="p-3 font-medium">Plan</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 pr-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((u) => (
                <tr key={u.id} className="hover:bg-accent/40">
                  <td className="p-3 font-medium text-foreground">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 text-muted-foreground">{u.country}</td>
                  <td className="p-3"><Badge variant="outline">{u.plan}</Badge></td>
                  <td className="p-3">
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(u.joinedAt)}</td>
                  <td className="p-3 pr-3 text-right">
                    <Button variant="ghost" size="sm">Inspect</Button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-sm text-muted-foreground">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Prev
            </Button>
            <span className="text-xs tabular-nums">{page} / {pages}</span>
            <Button size="sm" variant="outline" disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
