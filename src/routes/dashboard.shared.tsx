import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Plus, Trash2, UserPlus, Users2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { LoadingButton } from "@/components/ui/loading-button";
import { useBaseCurrency } from "@/lib/base-currency";
import { formatDate, formatMoney } from "@/lib/format";
import { useAccounts, useCreateAccount } from "@/lib/queries/finance";
import {
  useAccountMembers,
  useAddAccountMember,
  useRemoveAccountMember,
  type AccountMemberRow,
} from "@/lib/queries/platform";

export const Route = createFileRoute("/dashboard/shared")({
  head: () => ({
    meta: [{ title: "Shared accounts — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: SharedPage,
});

const ROLES = ["Manager", "Contributor", "Viewer"];

function SharedPage() {
  const { data: accounts, isLoading } = useAccounts();
  const { currency } = useBaseCurrency();
  const createAccount = useCreateAccount();
  const addMember = useAddAccountMember();
  const removeMember = useRemoveAccountMember();

  const shared = (accounts ?? []).filter((a) => a.is_shared && !a.archived);
  const { data: members } = useAccountMembers(shared.map((a) => a.id));
  const memberRows = members ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [inviteFor, setInviteFor] = useState<string | null>(null);
  const [removeFor, setRemoveFor] = useState<AccountMemberRow | null>(null);

  const pooled = shared.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <AppShell
      nav={USER_NAV}
      title="Shared accounts"
      subtitle="Groups, roles and pooled contributions."
      headerRight={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New shared account
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Shared accounts" value={String(shared.length)} icon={Users2} />
        <StatCard label="Pooled balance" value={formatMoney(pooled, currency)} icon={Wallet} />
        <StatCard label="Members" value={String(memberRows.length)} icon={UserPlus} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <div className="lg:col-span-2">
            <ListSkeleton />
          </div>
        ) : shared.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState
              icon={Users2}
              title="No shared accounts yet"
              description="Create a shared pool for family, roommates or a project team, then invite members."
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New shared account
                </Button>
              }
            />
          </div>
        ) : (
          shared.map((a) => {
            const list = memberRows.filter((m) => m.account_id === a.id);
            return (
              <SectionCard
                key={a.id}
                title={a.name}
                action={
                  <Badge variant="secondary" className="gap-1">
                    <Users2 className="h-3 w-3" /> {list.length} members
                  </Badge>
                }
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-xl font-semibold text-foreground">
                    {formatMoney(Number(a.balance), a.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pool balance</p>
                </div>

                <Collapsible className="mt-4">
                  <CollapsibleTrigger asChild>
                    <button className="group flex w-full items-center justify-between rounded-md border border-border p-3 text-left text-sm hover:bg-accent/50">
                      <span className="font-medium">Members ({list.length})</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="mt-2 space-y-2 rounded-md border border-border p-3 text-sm">
                      {list.length === 0 && (
                        <li className="py-2 text-xs text-muted-foreground">
                          No members yet — invite someone below.
                        </li>
                      )}
                      {list.map((m) => (
                        <li key={m.id}>
                          <Collapsible>
                            <div className="flex items-center gap-2">
                              <CollapsibleTrigger asChild>
                                <button className="group flex flex-1 items-center justify-between rounded-md py-1.5 text-left hover:bg-accent/30">
                                  <span className="flex items-center gap-2">
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                                    {m.display_name ?? m.email}
                                  </span>
                                  <Badge variant={m.member_role === "Manager" ? "default" : "outline"}>
                                    {m.member_role}
                                  </Badge>
                                </button>
                              </CollapsibleTrigger>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Remove member"
                                onClick={() => setRemoveFor(m)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <CollapsibleContent>
                              <div className="ml-6 mt-2 space-y-1 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Email</span>
                                  <span className="text-foreground">{m.email ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Share</span>
                                  <span className="font-mono text-foreground">
                                    {m.share_pct != null ? `${m.share_pct}%` : "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Joined</span>
                                  <span>{formatDate(m.created_at)}</span>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setInviteFor(a.id)}
                    >
                      <UserPlus className="mr-1.5 h-4 w-4" /> Add member
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </SectionCard>
            );
          })
        )}
      </div>

      {/* Create shared account */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New shared account</DialogTitle>
            <DialogDescription>
              Pooled money in your base currency ({currency}).
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await createAccount.mutateAsync({
                  name: String(fd.get("name")),
                  type: "shared",
                  balance: Number(fd.get("balance") || 0),
                  currency,
                  note: String(fd.get("note") || "") || null,
                  is_shared: true,
                });
                toast.success("Shared account created");
                setCreateOpen(false);
              } catch (err) {
                toast.error((err as Error).message);
              }
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="sa-name">Name</Label>
              <Input id="sa-name" name="name" required placeholder="Family pool" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sa-balance">Starting balance</Label>
              <Input id="sa-balance" name="balance" type="number" step="0.01" defaultValue={0} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sa-note">Note</Label>
              <Input id="sa-note" name="note" placeholder="What is this pool for?" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={createAccount.isPending} loadingText="Creating…">
                Create account
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add member */}
      <Dialog open={!!inviteFor} onOpenChange={(v) => !v && setInviteFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>They'll appear in the members tree immediately.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await addMember.mutateAsync({
                  account_id: inviteFor!,
                  email: String(fd.get("email")),
                  display_name: String(fd.get("display_name")),
                  member_role: String(fd.get("role")),
                  share_pct: fd.get("share") ? Number(fd.get("share")) : null,
                });
                toast.success("Member added");
                setInviteFor(null);
              } catch (err) {
                toast.error((err as Error).message);
              }
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="m-name">Display name</Label>
              <Input id="m-name" name="display_name" required placeholder="Priya" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="m-email">Email</Label>
              <Input id="m-email" name="email" type="email" required placeholder="priya@email.com" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="m-role">Role</Label>
              <Select name="role" defaultValue="Contributor">
                <SelectTrigger id="m-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="m-share">Share %</Label>
              <Input id="m-share" name="share" type="number" min={0} max={100} placeholder="25" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteFor(null)}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={addMember.isPending} loadingText="Adding…">
                Add member
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeFor} onOpenChange={(v) => !v && setRemoveFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this member?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to the shared account immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeMember.mutate(removeFor!.id, {
                  onSuccess: () => toast.success("Member removed"),
                  onError: (e) => toast.error(e.message),
                });
                setRemoveFor(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
