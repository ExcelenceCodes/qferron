import { createFileRoute } from "@tanstack/react-router";
import { Filter, Plus, Repeat2, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
  type TransactionRow,
  type TxDirection,
} from "@/lib/queries/finance";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({
    meta: [{ title: "Transactions — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: TransactionsPage,
});

const CATEGORIES = [
  "Uncategorized",
  "Salary",
  "Groceries",
  "Rent",
  "Transport",
  "Utilities",
  "Dining",
  "Health",
  "Education",
  "Savings",
  "Transfer",
  "Other",
];

const PAGE_SIZE = 25;

function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const [q, setQ] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionRow | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (transactions ?? []).filter((t) => {
      if (accountFilter !== "all" && t.account_id !== accountFilter) return false;
      if (!needle) return true;
      return (
        (t.merchant ?? "").toLowerCase().includes(needle) ||
        t.category.toLowerCase().includes(needle) ||
        (t.note ?? "").toLowerCase().includes(needle)
      );
    });
  }, [transactions, q, accountFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const accountName = (id: string) => accounts?.find((a) => a.id === id)?.name ?? "—";

  return (
    <AppShell
      nav={USER_NAV}
      title="Transactions"
      subtitle="Search, filter and review every movement."
      headerRight={
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={!accounts?.length}>
          <Plus className="mr-1.5 h-4 w-4" /> Add
        </Button>
      }
    >
      <SectionCard
        title="All transactions"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                placeholder="Search merchants…"
                className="h-8 w-56 pl-8"
              />
            </div>
            <Select
              value={accountFilter}
              onValueChange={(v) => {
                setAccountFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-44">
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {(accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Repeat2}
            title={transactions?.length ? "No matches" : "No transactions yet"}
            description={
              transactions?.length
                ? "Try a different search term or account filter."
                : "Record your first movement — Ferron updates your balances automatically."
            }
            action={
              !transactions?.length ? (
                <Button size="sm" onClick={() => setAddOpen(true)} disabled={!accounts?.length}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add transaction
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Merchant</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Account</th>
                    <th className="pb-3 pr-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((t) => {
                    const positive = t.direction === "in";
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className="cursor-pointer hover:bg-accent/40"
                      >
                        <td className="py-3 text-muted-foreground">{formatDate(t.occurred_at)}</td>
                        <td className="py-3 font-medium text-foreground">{t.merchant || "—"}</td>
                        <td className="py-3">
                          <Badge variant="outline">{t.category}</Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{accountName(t.account_id)}</td>
                        <td
                          className={`py-3 pr-2 text-right font-mono tabular-nums ${positive ? "text-success" : "text-foreground"}`}
                        >
                          {positive ? "+" : "−"}
                          {formatMoney(Number(t.amount), t.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {filtered.length} record{filtered.length === 1 ? "" : "s"} · page {current + 1} of{" "}
                {pageCount}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current >= pageCount - 1}
                  onClick={() => setPage(current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      <TransactionDialog open={addOpen} onOpenChange={setAddOpen} />
      <TransactionPanel transaction={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}

function TransactionPanel({
  transaction,
  onClose,
}: {
  transaction: TransactionRow | null;
  onClose: () => void;
}) {
  const { data: accounts } = useAccounts();
  const del = useDeleteTransaction();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!transaction) return null;
  const account = accounts?.find((a) => a.id === transaction.account_id);

  async function handleDelete() {
    try {
      await del.mutateAsync(transaction!.id);
      toast.success("Transaction deleted");
      setConfirmOpen(false);
      onClose();
    } catch (e) {
      toast.error("Could not delete", { description: (e as Error).message });
    }
  }

  return (
    <>
      <SidePanel
        open={!!transaction}
        onOpenChange={(v) => !v && onClose()}
        title={transaction.merchant || transaction.category}
        description={`${transaction.direction === "in" ? "Money in" : "Money out"} · ${formatDate(transaction.occurred_at)}`}
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
        <dl className="divide-y divide-border rounded-lg border border-border text-sm">
          <DetailRow label="Amount">
            <span
              className={`font-mono tabular-nums ${transaction.direction === "in" ? "text-success" : "text-foreground"}`}
            >
              {transaction.direction === "in" ? "+" : "−"}
              {formatMoney(Number(transaction.amount), transaction.currency)}
            </span>
          </DetailRow>
          <DetailRow label="Account">{account?.name ?? "—"}</DetailRow>
          <DetailRow label="Category">
            <Badge variant="outline">{transaction.category}</Badge>
          </DetailRow>
          <DetailRow label="Date">{formatDate(transaction.occurred_at)}</DetailRow>
          <DetailRow label="Note">{transaction.note || "—"}</DetailRow>
        </dl>
      </SidePanel>

      <TransactionDialog open={editOpen} onOpenChange={setEditOpen} transaction={transaction} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              The account balance will be adjusted back automatically.
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
              {del.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function TransactionDialog({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transaction?: TransactionRow;
}) {
  const { data: accounts } = useAccounts();
  const { currency } = useBaseCurrency();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const editing = !!transaction;

  const [accountId, setAccountId] = useState(transaction?.account_id ?? "");
  const [direction, setDirection] = useState<TxDirection>(transaction?.direction ?? "out");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [category, setCategory] = useState(transaction?.category ?? "Uncategorized");
  const [merchant, setMerchant] = useState(transaction?.merchant ?? "");
  const [date, setDate] = useState(
    transaction?.occurred_at ?? new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState(transaction?.note ?? "");

  const effectiveAccount = accountId || accounts?.[0]?.id || "";
  const pending = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      account_id: effectiveAccount,
      direction,
      amount: Number(amount),
      currency: transaction?.currency ?? currency,
      category,
      merchant: merchant || null,
      note: note || null,
      occurred_at: date,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: transaction!.id, ...payload });
        toast.success("Transaction updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Transaction recorded", { description: "Balance updated." });
        setAmount("");
        setMerchant("");
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
          <DialogTitle>{editing ? "Edit transaction" : "New transaction"}</DialogTitle>
          <DialogDescription>Balances update automatically when you save.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Account</Label>
              <Select value={effectiveAccount} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {(accounts ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Direction</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as TxDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Money in</SelectItem>
                  <SelectItem value="out">Money out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="tx-amount">Amount ({transaction?.currency ?? currency})</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tx-date">Date</Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tx-merchant">Merchant</Label>
              <Input
                id="tx-merchant"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Naivas Supermarket"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tx-note">Note (optional)</Label>
            <Textarea id="tx-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={pending}
              loadingText="Saving…"
              disabled={!effectiveAccount}
            >
              {editing ? "Save changes" : "Add transaction"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
