import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Plus, Scale, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { MoneySourceSelect } from "@/components/app/account-picker";
import { LoadingButton } from "@/components/ui/loading-button";
import { useBaseCurrency } from "@/lib/base-currency";
import {
  useCreateDebt,
  useDebtPayments,
  useDebts,
  useDeleteDebt,
  useLogDebtPayment,
  useUpdateDebt,
  type DebtKind,
  type DebtRow,
} from "@/lib/queries/finance";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/debts")({
  head: () => ({
    meta: [{ title: "Debts & Credits — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: DebtsPage,
});

function DebtsPage() {
  const { data: debts, isLoading } = useDebts();
  const { currency } = useBaseCurrency();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const rows = debts ?? [];
  const selected = rows.find((d) => d.id === selectedId) ?? null;
  const owed = rows
    .filter((d) => d.kind === "loan" && d.status !== "settled")
    .reduce((s, d) => s + Number(d.outstanding), 0);
  const owing = rows
    .filter((d) => d.kind === "credit" && d.status !== "settled")
    .reduce((s, d) => s + Number(d.outstanding), 0);
  const overdue = rows.filter((d) => d.status === "overdue").length;

  return (
    <AppShell
      nav={USER_NAV}
      title="Debts & Credits"
      subtitle="Loans you owe, money owed to you, and overdue detection."
      headerRight={
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New record
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="You owe" value={formatMoney(owed, currency)} tone="negative" icon={ArrowUpRight} />
        <StatCard
          label="Owed to you"
          value={formatMoney(owing, currency)}
          tone="positive"
          icon={ArrowDownLeft}
        />
        <StatCard
          label="Overdue records"
          value={String(overdue)}
          tone={overdue ? "negative" : "default"}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-6">
        <SectionCard title="All debts & credits">
          {isLoading ? (
            <ListSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="Nothing tracked yet"
              description="Record a loan you owe or money owed to you — Ferron flags overdue records automatically."
              action={
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New record
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 font-medium">Kind</th>
                    <th className="pb-3 font-medium">Counterparty</th>
                    <th className="pb-3 font-medium">Outstanding</th>
                    <th className="pb-3 font-medium">Due</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 pr-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((d) => (
                    <tr key={d.id} className="hover:bg-accent/40">
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                          <Scale className="h-3.5 w-3.5" /> {d.kind === "loan" ? "you owe" : "owed to you"}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-foreground">{d.counterparty}</td>
                      <td className="py-3 font-mono tabular-nums text-foreground">
                        {formatMoney(Number(d.outstanding), d.currency)}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {d.due_date ? formatDate(d.due_date) : "—"}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            d.status === "overdue"
                              ? "destructive"
                              : d.status === "settled"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {d.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedId(d.id)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      <DebtPanel debt={selected} onClose={() => setSelectedId(null)} />
      <DebtDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}

function DebtPanel({ debt, onClose }: { debt: DebtRow | null; onClose: () => void }) {
  const { data: payments } = useDebtPayments(debt?.id);
  const del = useDeleteDebt();
  const logPayment = useLogDebtPayment();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payAccount, setPayAccount] = useState("");

  if (!debt) return null;

  async function handleDelete() {
    try {
      await del.mutateAsync(debt!.id);
      toast.success("Record deleted");
      setConfirmOpen(false);
      onClose();
    } catch (e) {
      toast.error("Could not delete", { description: (e as Error).message });
    }
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payAccount) {
      toast.error(
        debt!.kind === "loan"
          ? "Choose the account you are paying from"
          : "Choose the account receiving the money",
      );
      return;
    }
    try {
      await logPayment.mutateAsync({
        debt_id: debt!.id,
        amount: Number(payAmount),
        paid_at: payDate,
        account_id: payAccount,
      });
      toast.success("Payment logged", { description: "Outstanding balance updated." });
      setPayAmount("");
      setPayAccount("");
      setPayOpen(false);
    } catch (err) {
      toast.error("Could not log payment", { description: (err as Error).message });
    }
  }

  return (
    <>
      <SidePanel
        open={!!debt}
        onOpenChange={(v) => !v && onClose()}
        title={debt.counterparty}
        description={`${debt.kind === "loan" ? "YOU OWE" : "OWED TO YOU"} · ${debt.status}`}
        footer={
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setPayOpen(true)}>
              Log payment
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Principal" value={formatMoney(Number(debt.principal), debt.currency)} />
            <StatCard
              label="Outstanding"
              value={formatMoney(Number(debt.outstanding), debt.currency)}
              tone={debt.status === "settled" ? "positive" : "default"}
            />
            <StatCard
              label="Interest"
              value={Number(debt.interest_rate) ? `${debt.interest_rate}%` : "—"}
            />
          </div>

          {debt.status === "overdue" && debt.due_date && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5" /> Payment is overdue since {formatDate(debt.due_date)}.
            </div>
          )}

          {debt.note && (
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Note</p>
              <p className="mt-1">{debt.note}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold">Payment history</h4>
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border text-sm">
              <li className="flex items-center justify-between p-3">
                <span>Initial amount</span>
                <span className="font-mono">{formatMoney(Number(debt.principal), debt.currency)}</span>
              </li>
              {(payments ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between p-3">
                  <span>Payment · {formatDate(p.paid_at)}</span>
                  <span className="font-mono text-success">
                    −{formatMoney(Number(p.amount), debt.currency)}
                  </span>
                </li>
              ))}
              {(payments ?? []).length === 0 && (
                <li className="p-3 text-muted-foreground">No payments logged yet.</li>
              )}
            </ul>
          </div>
        </div>
      </SidePanel>

      <DebtDialog open={editOpen} onOpenChange={setEditOpen} debt={debt} />

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log a payment</DialogTitle>
            <DialogDescription>
              Outstanding for {debt.counterparty} updates automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPayment} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="pay-amount">Amount ({debt.currency})</Label>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
              />
            </div>
            <MoneySourceSelect
              id="pay-account"
              direction={debt.kind === "loan" ? "out" : "in"}
              amount={Number(payAmount) || 0}
              value={payAccount}
              onChange={setPayAccount}
              label={debt.kind === "loan" ? "Pay from account" : "Receive into account"}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="pay-date">Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayOpen(false)}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={logPayment.isPending} loadingText="Saving…">
                Log payment
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              The record and all its logged payments will be permanently removed.
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

function DebtDialog({
  open,
  onOpenChange,
  debt,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  debt?: DebtRow;
}) {
  const { currency } = useBaseCurrency();
  const create = useCreateDebt();
  const update = useUpdateDebt();
  const editing = !!debt;

  const [counterparty, setCounterparty] = useState(debt?.counterparty ?? "");
  const [kind, setKind] = useState<DebtKind>(debt?.kind ?? "loan");
  const [principal, setPrincipal] = useState(debt ? String(debt.principal) : "");
  const [interest, setInterest] = useState(debt ? String(debt.interest_rate) : "0");
  const [dueDate, setDueDate] = useState(debt?.due_date ?? "");
  const [note, setNote] = useState(debt?.note ?? "");
  const [accountId, setAccountId] = useState(debt?.account_id ?? "");
  const pending = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(principal);
    try {
      if (editing) {
        await update.mutateAsync({
          id: debt!.id,
          counterparty,
          kind,
          principal: amount,
          interest_rate: Number(interest) || 0,
          due_date: dueDate || null,
          note: note || null,
        });
        toast.success("Record updated");
      } else {
        if (!accountId) {
          toast.error(
            kind === "loan"
              ? "Choose the account receiving the borrowed money"
              : "Choose the account the money is lent from",
          );
          return;
        }
        await create.mutateAsync({
          account_id: accountId,
          counterparty,
          kind,
          principal: amount,
          outstanding: amount,
          currency,
          interest_rate: Number(interest) || 0,
          due_date: dueDate || null,
          note: note || null,
        });
        toast.success("Record created");
        setCounterparty("");
        setPrincipal("");
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
          <DialogTitle>{editing ? "Edit record" : "New debt or credit"}</DialogTitle>
          <DialogDescription>
            Track a loan you owe or money someone owes you. Overdue status is detected automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="debt-party">Counterparty</Label>
              <Input
                id="debt-party"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="e.g. Equity Bank / Jane"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as DebtKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan">Loan — you owe</SelectItem>
                  <SelectItem value="credit">Credit — owed to you</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="debt-principal">Amount ({debt?.currency ?? currency})</Label>
              <Input
                id="debt-principal"
                type="number"
                step="0.01"
                min="0"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="debt-interest">Interest %</Label>
              <Input
                id="debt-interest"
                type="number"
                step="0.001"
                min="0"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="debt-due">Due date</Label>
              <Input
                id="debt-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          {!editing && (
            <MoneySourceSelect
              id="debt-account"
              direction={kind === "loan" ? "in" : "out"}
              amount={Number(principal) || 0}
              value={accountId}
              onChange={setAccountId}
              label={kind === "loan" ? "Borrowed money lands in" : "Lend the money from"}
              hint="Money rotation: a matching transaction is created automatically."
            />
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="debt-note">Note (optional)</Label>
            <Textarea
              id="debt-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={pending} loadingText="Saving…">
              {editing ? "Save changes" : "Create record"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
