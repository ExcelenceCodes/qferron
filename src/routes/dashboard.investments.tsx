import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LineChart,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
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
import { LoadingButton } from "@/components/ui/loading-button";
import { MoneySourceSelect } from "@/components/app/account-picker";
import { useBaseCurrency } from "@/lib/base-currency";
import { useAccounts } from "@/lib/queries/finance";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import {
  INVESTMENT_KINDS,
  projectValue,
  returnPct,
  useContributions,
  useCreateInvestment,
  useDeleteContribution,
  useDeleteInvestment,
  useInvestments,
  useLogContribution,
  useUpdateInvestment,
  yearsHeld,
  type InvestmentKind,
  type InvestmentRow,
} from "@/lib/queries/investments";

export const Route = createFileRoute("/dashboard/investments")({
  head: () => ({
    meta: [
      { title: "Investments — Ferron" },
      { name: "description", content: "Track investments, top-ups and projected growth in Ferron." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvestmentsPage,
});

const RISKS = ["low", "moderate", "high"];

function InvestmentsPage() {
  const { data: investments, isLoading } = useInvestments();
  const { currency } = useBaseCurrency();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = investments ?? [];
  const selected = rows.find((i) => i.id === selectedId) ?? null;
  const value = rows.reduce((s, i) => s + Number(i.current_value), 0);
  const principal = rows.reduce((s, i) => s + Number(i.principal), 0);
  const profit = value - principal;
  const projected = rows.reduce((s, i) => s + projectValue(i, 1), 0);

  return (
    <AppShell
      nav={USER_NAV}
      title="Investments"
      subtitle="Every position, its profit and where it's heading."
      headerRight={
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New investment
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Portfolio value"
          value={formatMoney(value, currency)}
          hint={`${rows.length} position${rows.length === 1 ? "" : "s"}`}
          icon={LineChart}
        />
        <StatCard label="Capital invested" value={formatMoney(principal, currency)} icon={Wallet} />
        <StatCard
          label="Unrealised profit"
          value={formatMoney(profit, currency)}
          hint={principal > 0 ? formatPercent((profit / principal) * 100) : "—"}
          tone={profit >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
        />
        <StatCard
          label="Projected in 1 year"
          value={formatMoney(projected, currency)}
          hint="Using each position's growth rate"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6">
        <SectionCard title="Your positions">
          {isLoading ? (
            <ListSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={LineChart}
              title="No investments yet"
              description="Add a position, bind it to one of your accounts and Ferron grows it for you."
              action={
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New investment
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((i) => {
                const pct = returnPct(i);
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(i.id)}
                      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-accent/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{i.name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="outline">
                            {INVESTMENT_KINDS.find((k) => k.value === i.kind)?.label ?? i.kind}
                          </Badge>
                          <span>{i.provider || "No provider"}</span>
                          <span>· {i.growth_rate}% / yr</span>
                          <span>· {yearsHeld(i).toFixed(1)} yrs held</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono tabular-nums text-foreground">
                          {formatMoney(Number(i.current_value), i.currency)}
                        </p>
                        <p
                          className={`text-xs tabular-nums ${pct >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {pct >= 0 ? "+" : ""}
                          {pct.toFixed(1)}%
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      <InvestmentPanel investment={selected} onClose={() => setSelectedId(null)} />
      <InvestmentDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}

function InvestmentPanel({
  investment,
  onClose,
}: {
  investment: InvestmentRow | null;
  onClose: () => void;
}) {
  const del = useDeleteInvestment();
  const delContribution = useDeleteContribution();
  const { data: contributions } = useContributions(investment?.id);
  const { data: accounts } = useAccounts();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState<"deposit" | "withdrawal" | null>(null);

  if (!investment) return null;
  const inv = investment;
  const pct = returnPct(inv);

  async function handleDelete() {
    try {
      await del.mutateAsync(inv.id);
      toast.success("Investment removed");
      setConfirmOpen(false);
      onClose();
    } catch (e) {
      toast.error("Could not delete", { description: (e as Error).message });
    }
  }

  return (
    <>
      <SidePanel
        open={!!investment}
        onOpenChange={(v) => !v && onClose()}
        title={inv.name}
        description={`${INVESTMENT_KINDS.find((k) => k.value === inv.kind)?.label ?? inv.kind} · ${inv.risk} risk · ${inv.currency}`}
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
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Current value" value={formatMoney(Number(inv.current_value), inv.currency)} />
          <StatCard label="Capital invested" value={formatMoney(Number(inv.principal), inv.currency)} />
          <StatCard
            label="Profit"
            value={formatMoney(Number(inv.current_value) - Number(inv.principal), inv.currency)}
            hint={`${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`}
            tone={pct >= 0 ? "positive" : "negative"}
          />
          <StatCard
            label="In 5 years"
            value={formatMoney(projectValue(inv, 5), inv.currency)}
            hint={`${inv.growth_rate}% growth`}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => setFlowOpen("deposit")}>
            <ArrowUpFromLine className="mr-1.5 h-3.5 w-3.5" /> Top up
          </Button>
          <Button size="sm" variant="outline" onClick={() => setFlowOpen("withdrawal")}>
            <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" /> Withdraw
          </Button>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Movements</p>
          {(contributions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No top-ups or withdrawals recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(contributions ?? []).map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium capitalize text-foreground">{c.kind}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(c.occurred_at)} ·{" "}
                      {accounts?.find((a) => a.id === c.account_id)?.name ?? "No account"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono tabular-nums ${c.kind === "withdrawal" ? "text-destructive" : "text-success"}`}
                    >
                      {c.kind === "withdrawal" ? "−" : "+"}
                      {formatMoney(Number(c.amount), inv.currency)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={async () => {
                        try {
                          await delContribution.mutateAsync(c.id);
                          toast.success("Movement removed");
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {inv.note && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Note</p>
            <p className="mt-1">{inv.note}</p>
          </div>
        )}
      </SidePanel>

      <InvestmentDialog open={editOpen} onOpenChange={setEditOpen} investment={inv} />
      <FlowDialog
        investment={inv}
        kind={flowOpen}
        onClose={() => setFlowOpen(null)}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove “{inv.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The position and all of its movements will be removed from your portfolio.
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
              {del.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FlowDialog({
  investment,
  kind,
  onClose,
}: {
  investment: InvestmentRow;
  kind: "deposit" | "withdrawal" | null;
  onClose: () => void;
}) {
  const log = useLogContribution();
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const withdrawing = kind === "withdrawal";

  return (
    <Dialog open={!!kind} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{withdrawing ? "Withdraw funds" : "Top up investment"}</DialogTitle>
          <DialogDescription>
            Money rotation: this movement is mirrored as a transaction on the chosen account.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!accountId) {
              toast.error("Choose an account");
              return;
            }
            try {
              await log.mutateAsync({
                investment_id: investment.id,
                amount: Number(amount) || 0,
                kind: withdrawing ? "withdrawal" : "deposit",
                occurred_at: date,
                account_id: accountId,
              });
              toast.success(withdrawing ? "Withdrawal recorded" : "Top-up recorded");
              setAmount("");
              onClose();
            } catch (err) {
              toast.error("Could not record", { description: (err as Error).message });
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="flow-amount">Amount ({investment.currency})</Label>
            <Input
              id="flow-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="flow-date">Date</Label>
            <Input
              id="flow-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <MoneySourceSelect
            id="flow-account"
            direction={withdrawing ? "in" : "out"}
            amount={Number(amount) || 0}
            value={accountId}
            onChange={setAccountId}
            label={withdrawing ? "Send proceeds to" : "Fund from account"}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={log.isPending} loadingText="Saving…">
              {withdrawing ? "Withdraw" : "Top up"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InvestmentDialog({
  open,
  onOpenChange,
  investment,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  investment?: InvestmentRow;
}) {
  const { currency } = useBaseCurrency();
  const create = useCreateInvestment();
  const update = useUpdateInvestment();
  const logContribution = useLogContribution();
  const editing = !!investment;

  const [name, setName] = useState(investment?.name ?? "");
  const [kind, setKind] = useState<InvestmentKind>(investment?.kind ?? "stocks");
  const [provider, setProvider] = useState(investment?.provider ?? "");
  const [amount, setAmount] = useState(investment ? String(investment.current_value) : "");
  const [growth, setGrowth] = useState(investment ? String(investment.growth_rate) : "8");
  const [risk, setRisk] = useState(investment?.risk ?? "moderate");
  const [startedAt, setStartedAt] = useState(
    investment?.started_at ?? new Date().toISOString().slice(0, 10),
  );
  const [maturity, setMaturity] = useState(investment?.maturity_date ?? "");
  const [note, setNote] = useState(investment?.note ?? "");
  const [accountId, setAccountId] = useState("");
  const pending = create.isPending || update.isPending || logContribution.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount) || 0;
    try {
      if (editing) {
        await update.mutateAsync({
          id: investment!.id,
          name,
          kind,
          provider: provider || null,
          current_value: value,
          growth_rate: Number(growth) || 0,
          risk,
          started_at: startedAt,
          maturity_date: maturity || null,
          note: note || null,
        });
        toast.success("Investment updated");
      } else {
        if (!accountId) {
          toast.error("Bind this investment to one of your accounts");
          return;
        }
        const created = await create.mutateAsync({
          name,
          kind,
          provider: provider || null,
          principal: 0,
          current_value: 0,
          growth_rate: Number(growth) || 0,
          currency,
          started_at: startedAt,
          maturity_date: maturity || null,
          risk,
          note: note || null,
        });
        if (value > 0) {
          await logContribution.mutateAsync({
            investment_id: created.id,
            amount: value,
            kind: "deposit",
            occurred_at: startedAt,
            account_id: accountId,
          });
        }
        toast.success("Investment created");
        setName("");
        setAmount("");
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
          <DialogTitle>{editing ? "Edit investment" : "New investment"}</DialogTitle>
          <DialogDescription>
            Bind a position to an account — Ferron rotates the money and grows the value for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="inv-name">Name</Label>
            <Input
              id="inv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Treasury bond 2027"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as InvestmentKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv-provider">Provider (optional)</Label>
              <Input
                id="inv-provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Vanguard"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="inv-amount">
                {editing ? "Current value" : "Initial amount"} ({investment?.currency ?? currency})
              </Label>
              <Input
                id="inv-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv-growth">Growth % / yr</Label>
              <Input
                id="inv-growth"
                type="number"
                step="0.1"
                value={growth}
                onChange={(e) => setGrowth(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Risk</Label>
              <Select value={risk} onValueChange={setRisk}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISKS.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="inv-start">Started</Label>
              <Input
                id="inv-start"
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv-maturity">Maturity (optional)</Label>
              <Input
                id="inv-maturity"
                type="date"
                value={maturity}
                onChange={(e) => setMaturity(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="inv-note">Note (optional)</Label>
            <Textarea id="inv-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {!editing && (
            <MoneySourceSelect
              id="inv-account"
              direction="out"
              amount={Number(amount) || 0}
              value={accountId}
              onChange={setAccountId}
              label="Bound account"
              hint="The initial amount leaves this account and future top-ups default to it."
            />
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={pending} loadingText="Saving…">
              {editing ? "Save changes" : "Create investment"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
