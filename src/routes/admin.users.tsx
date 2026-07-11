import { createFileRoute } from "@tanstack/react-router";
import { Ban, ChevronLeft, ChevronRight, KeyRound, Mail, Search, Shield, Trash2, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidePanel } from "@/components/ui/side-panel";
import { LoadingButton, useAsyncAction } from "@/components/ui/loading-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ADMIN_USERS, type AdminUser } from "@/lib/mock/app";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsersPage,
});

const EXTENDED: AdminUser[] = Array.from({ length: 120 }).flatMap((_, i) =>
  ADMIN_USERS.map((u) => ({ ...u, id: `${u.id}-${i}`, email: `${u.email.split("@")[0]}+${i}@ferron.app` })),
);

const PAGE_SIZE = 25;

function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminUser | null>(null);

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
                <tr
                  key={u.id}
                  onClick={() => setDetail(u)}
                  className="cursor-pointer hover:bg-accent/40"
                >
                  <td className="p-3 font-medium text-foreground">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 text-muted-foreground">{u.country}</td>
                  <td className="p-3"><Badge variant="outline">{u.plan}</Badge></td>
                  <td className="p-3">
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(u.joinedAt)}</td>
                  <td className="p-3 pr-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetail(u);
                      }}
                    >
                      Inspect
                    </Button>
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

      <UserDetailPanel user={detail} onOpenChange={(v) => !v && setDetail(null)} />
    </AppShell>
  );
}

function UserDetailPanel({
  user,
  onOpenChange,
}: {
  user: AdminUser | null;
  onOpenChange: (v: boolean) => void;
}) {
  const [confirm, setConfirm] = useState<null | "suspend" | "delete" | "reset" | "email">(null);

  const suspend = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`${user?.name} suspended`);
    setConfirm(null);
    onOpenChange(false);
  });
  const del = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`${user?.name} deleted`);
    setConfirm(null);
    onOpenChange(false);
  });
  const reset = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Password reset email sent");
    setConfirm(null);
  });
  const email = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success(`Email sent to ${user?.email}`);
    setConfirm(null);
  });

  if (!user) return null;

  return (
    <>
      <SidePanel
        open={!!user}
        onOpenChange={onOpenChange}
        title={
          <span className="inline-flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-4 w-4" />
            </span>
            {user.name}
          </span>
        }
        description={`${user.email} · ${user.country}`}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Plan" value={user.plan} />
          <StatCard label="Status" value={user.status} tone={user.status === "active" ? "positive" : "negative"} />
          <StatCard label="Joined" value={formatDate(user.joinedAt)} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setConfirm("email")}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Email user</p>
              <p className="text-xs text-muted-foreground">Send a message from admin</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setConfirm("reset")}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Reset password</p>
              <p className="text-xs text-muted-foreground">Send reset link</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setConfirm("suspend")}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-destructive/40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-destructive/10 text-destructive">
              <Ban className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Suspend account</p>
              <p className="text-xs text-muted-foreground">Temporarily disable access</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setConfirm("delete")}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-destructive/40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Delete permanently</p>
              <p className="text-xs text-muted-foreground">Irreversible</p>
            </div>
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Shield className="h-3.5 w-3.5" /> Recent activity
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Signed in from Nairobi · 2h ago</li>
            <li>Created transaction "Uber" · 4h ago</li>
            <li>Added shared member to "Family Rent Pool" · 1d ago</li>
          </ul>
        </div>
      </SidePanel>

      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "suspend" && `Suspend ${user.name}?`}
              {confirm === "delete" && `Delete ${user.name} permanently?`}
              {confirm === "reset" && `Send password reset to ${user.email}?`}
              {confirm === "email" && `Email ${user.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "suspend" && "The user won't be able to sign in until reactivated."}
              {confirm === "delete" && "This action cannot be undone. All user data will be removed."}
              {confirm === "reset" && "A reset link will be delivered to the user's inbox."}
              {confirm === "email" && "You'll be able to compose the message in the next step."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <LoadingButton
                loading={suspend.loading || del.loading || reset.loading || email.loading}
                loadingText="Working…"
                variant={confirm === "delete" || confirm === "suspend" ? "destructive" : "default"}
                onClick={() => {
                  if (confirm === "suspend") suspend.run();
                  else if (confirm === "delete") del.run();
                  else if (confirm === "reset") reset.run();
                  else if (confirm === "email") email.run();
                }}
              >
                Confirm
              </LoadingButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
