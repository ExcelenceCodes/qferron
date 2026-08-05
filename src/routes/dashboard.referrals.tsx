import { createFileRoute } from "@tanstack/react-router";
import { Copy, Gift, Mail, Trash2, Users } from "lucide-react";
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
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import {
  useDeleteReferral,
  useInviteReferral,
  useReferrals,
  type ReferralRow,
} from "@/lib/queries/platform";

export const Route = createFileRoute("/dashboard/referrals")({
  head: () => ({
    meta: [{ title: "Referrals — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const { profile } = useAuth();
  const { data, isLoading } = useReferrals();
  const invite = useInviteReferral();
  const removeRef = useDeleteReferral();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteFor, setDeleteFor] = useState<ReferralRow | null>(null);

  const rows = data ?? [];
  const activated = rows.filter((r) => r.status === "activated").length;
  const credits = rows.reduce((s, r) => s + r.reward_cents, 0) / 100;
  const link =
    typeof window !== "undefined" && profile?.referral_code
      ? `${window.location.origin}/sign-up?ref=${profile.referral_code}`
      : "Generating your link…";

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Referral link copied");
  };

  return (
    <AppShell
      nav={USER_NAV}
      title="Referrals"
      subtitle="Share Ferron, earn credits."
      headerRight={
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Mail className="mr-1.5 h-4 w-4" /> Invite by email
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Invites sent" value={String(rows.length)} icon={Users} />
        <StatCard
          label="Activated"
          value={String(activated)}
          hint={`${rows.length - activated} pending`}
          tone="positive"
          icon={Gift}
        />
        <StatCard label="Credits earned" value={formatMoney(credits, "USD")} icon={Gift} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Your referral link">
          <div className="flex items-center gap-2 rounded-md bg-muted p-3">
            <code className="flex-1 truncate text-sm">{link}</code>
            <Button variant="ghost" size="sm" onClick={copy} disabled={!profile?.referral_code}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Earn $3 in credits for every friend who activates their first account.
          </p>
        </SectionCard>

        <SectionCard title="How it works">
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                1
              </span>
              Share your link or send an invite.
            </li>
            <li className="flex gap-3">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                2
              </span>
              Friend signs up and connects an account.
            </li>
            <li className="flex gap-3">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                3
              </span>
              Both of you get <Gift className="mx-1 inline h-3.5 w-3.5" />
              $3 in credits.
            </li>
          </ol>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Your invites">
          {isLoading ? (
            <ListSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No invites yet"
              description="Invite a friend by email and track their activation here."
              action={
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <Mail className="mr-1.5 h-4 w-4" /> Invite by email
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.invited_email ?? "Direct signup"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === "activated" ? "default" : "secondary"}>
                      {r.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove invite"
                      onClick={() => setDeleteFor(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a friend</DialogTitle>
            <DialogDescription>We'll track their signup against your link.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await invite.mutateAsync(String(fd.get("email")));
                toast.success("Invite recorded");
                setInviteOpen(false);
              } catch (err) {
                toast.error((err as Error).message);
              }
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="ref-email">Friend's email</Label>
              <Input id="ref-email" name="email" type="email" required placeholder="friend@email.com" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={invite.isPending} loadingText="Sending…">
                Send invite
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteFor} onOpenChange={(v) => !v && setDeleteFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this invite?</AlertDialogTitle>
            <AlertDialogDescription>
              Removing it won't cancel credits already earned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeRef.mutate(deleteFor!.id, {
                  onSuccess: () => toast.success("Invite removed"),
                  onError: (e) => toast.error(e.message),
                });
                setDeleteFor(null);
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
