import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Plus, Sparkles, Trash2, Users2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SidePanel } from "@/components/ui/side-panel";
import { LoadingButton } from "@/components/ui/loading-button";
import { useBaseCurrency } from "@/lib/base-currency";
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useTransactions,
  useUpdateAccount,
  type AccountRow,
  type AccountType,
} from "@/lib/queries/finance";
import { accountIcon, balanceSpot } from "@/lib/account-utils";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: AccountsPage,
});

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "bank", label: "Bank" },
  { value: "cash", label: "Cash" },
  { value: "mobile", label: "Mobile money" },
  { value: "wallet", label: "E-wallet" },
  { value: "card", label: "Card" },
  { value: "shared", label: "Shared" },
];

function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const detail = accounts?.find((a) => a.id === detailId) ?? null;
  const total = (accounts ?? []).reduce((s, a) => s + Number(a.balance), 0);
  const { currency } = useBaseCurrency();

  return (
    <AppShell
      nav={USER_NAV}
      title="Accounts"
      subtitle="Bank, cash, mobile money, e-wallets and shared pools."
      headerRight={
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add account
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total balance" value={formatMoney(total, currency)} icon={Landmark} />
        <StatCard label="Accounts" value={String(accounts?.length ?? 0)} icon={Users2} />
        <StatCard
          label="Shared pools"
          value={String((accounts ?? []).filter((a) => a.is_shared).length)}
          icon={Users2}
        />
      </div>

      <SectionCard title="All accounts">
        {isLoading ? (
          <ListSkeleton />
        ) : (accounts ?? []).length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No accounts yet"
            description="Add your first account to start tracking balances and transactions."
            action={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add account
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(accounts ?? []).map((a) => {
              const Icon = accountIcon(a.type);
              const spot = balanceSpot(Number(a.balance));
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => setDetailId(a.id)}
                  className="group relative rounded-lg border border-border bg-background/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{a.name}</p>
                        <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                          {a.type}
                        </p>
                      </div>
                    </div>
                    <span
                      aria-label={spot.label}
                      title={spot.label}
                      className={`mt-1 h-3 w-3 rounded-full shadow-[0_0_0_3px] ${spot.className}`}
                    />
                  </div>
                  <p className="mt-4 font-mono text-xl font-semibold tabular-nums text-foreground">
                    {formatMoney(Number(a.balance), a.currency)}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated {formatDate(a.updated_at)}</span>
                    {a.is_shared && (
                      <Badge variant="secondary" className="gap-1">
                        <Users2 className="h-3 w-3" /> shared
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      <AccountDetailPanel account={detail} onClose={() => setDetailId(null)} />
      <AccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}

function AccountDetailPanel({ account, onClose }: { account: AccountRow | null; onClose: () => void }) {
  const { data: transactions } = useTransactions();
  const del = useDeleteAccount();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const tx = useMemo(
    () => (transactions ?? []).filter((t) => t.account_id === account?.id),
    [transactions, account?.id],
  );

  if (!account) return null;
  const Icon = accountIcon(account.type);
  const inflow = tx.filter((t) => t.direction === "in").reduce((s, t) => s + Number(t.amount), 0);
  const outflow = tx.filter((t) => t.direction === "out").reduce((s, t) => s + Number(t.amount), 0);

  async function handleDelete() {
    try {
      await del.mutateAsync(account!.id);
      toast.success("Account deleted");
      setConfirmOpen(false);
      onClose();
    } catch (e) {
      toast.error("Could not delete account", { description: (e as Error).message });
    }
  }

  return (
    <>
      <SidePanel
        open={!!account}
        onOpenChange={(v) => !v && onClose()}
        title={
          <span className="inline-flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            {account.name}
          </span>
        }
        description={`${account.type.toUpperCase()} · ${account.currency}`}
        footer={
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Balance" value={formatMoney(Number(account.balance), account.currency)} />
          <StatCard label="Inflow" value={formatMoney(inflow, account.currency)} tone="positive" />
          <StatCard label="Outflow" value={formatMoney(outflow, account.currency)} tone="negative" />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">AI account analysis</p>
          <p className="mt-2 text-sm text-foreground/90">
            {tx.length === 0
              ? "No activity yet on this account — add a transaction and Ferron will start analysing it."
              : inflow >= outflow
                ? `Healthy: inflow (${formatMoney(inflow, account.currency)}) exceeds outflow (${formatMoney(outflow, account.currency)}) across ${tx.length} transactions.`
                : `Watch out: outflow (${formatMoney(outflow, account.currency)}) exceeds inflow (${formatMoney(inflow, account.currency)}) across ${tx.length} transactions.`}
          </p>
          <Button size="sm" variant="outline" className="mt-3">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask Ferron about this account
          </Button>
        </div>

        {account.note && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Note</p>
            <p className="mt-1">{account.note}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Recent transactions</h3>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {tx.length === 0 && <li className="p-4 text-sm text-muted-foreground">No transactions yet.</li>}
            {tx.slice(0, 12).map((t) => (
              <li key={t.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.merchant || t.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} · {formatDate(t.occurred_at)}
                  </p>
                </div>
                <span
                  className={`font-mono text-sm tabular-nums ${t.direction === "in" ? "text-success" : "text-foreground"}`}
                >
                  {t.direction === "in" ? "+" : "−"}
                  {formatMoney(Number(t.amount), t.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SidePanel>

      <AccountDialog open={editOpen} onOpenChange={setEditOpen} account={account} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{account.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the account and every transaction recorded against it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={del.isPending}
            >
              {del.isPending ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AccountDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account?: AccountRow;
}) {
  const { currency } = useBaseCurrency();
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const editing = !!account;

  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(account?.type ?? "bank");
  const [balance, setBalance] = useState(account ? String(account.balance) : "0");
  const [note, setNote] = useState(account?.note ?? "");
  const pending = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await update.mutateAsync({ id: account!.id, name, type, note: note || null });
        toast.success("Account updated");
      } else {
        await create.mutateAsync({
          name,
          type,
          balance: Number(balance) || 0,
          currency,
          note: note || null,
          is_shared: type === "shared",
        });
        toast.success("Account created", { description: "Ready to accept transactions." });
        setName("");
        setBalance("0");
        setNote("");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Something went wrong", { description: (err as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit account" : "New account"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the name, type or note for this account."
              : "Add a bank, cash, mobile money, e-wallet, card or shared account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="acct-name">Name</Label>
            <Input
              id="acct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Everyday checking"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Currency</Label>
              <div className="flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">
                  {account?.currency ?? currency}
                </span>
                <span className="text-muted-foreground">Base currency (locked)</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Change your base currency in Settings.</p>
            </div>
          </div>
          {!editing && (
            <div className="grid gap-1.5">
              <Label htmlFor="acct-balance">Starting balance</Label>
              <Input
                id="acct-balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="acct-note">Note (optional)</Label>
            <Textarea
              id="acct-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything you want to remember about this account…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={pending} loadingText="Saving…">
              {editing ? "Save changes" : "Create account"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
