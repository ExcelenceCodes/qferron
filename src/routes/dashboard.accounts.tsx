import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles, Users2 } from "lucide-react";
import { useState } from "react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SidePanel } from "@/components/ui/side-panel";
import { CurrencySelect } from "@/components/ui/currency-select";
import { LoadingButton, useAsyncAction } from "@/components/ui/loading-button";
import { ACCOUNTS, TRANSACTIONS, type Account, type AccountType } from "@/lib/mock/app";
import { accountIcon, balanceSpot } from "@/lib/account-utils";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "sonner";

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
  const [detail, setDetail] = useState<Account | null>(null);
  const [addOpen, setAddOpen] = useState(false);

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
      <SectionCard title="All accounts">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACCOUNTS.map((a) => {
            const Icon = accountIcon(a.type);
            const spot = balanceSpot(a.currency === "USD" ? a.balance : a.balance * 0.0075);
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => setDetail(a)}
                className="group relative rounded-lg border border-border bg-background/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.name}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{a.type}</p>
                    </div>
                  </div>
                  <span
                    aria-label={spot.label}
                    title={spot.label}
                    className={`mt-1 h-3 w-3 rounded-full shadow-[0_0_0_3px] ${spot.className}`}
                  />
                </div>
                <p className="mt-4 font-mono text-xl font-semibold tabular-nums text-foreground">
                  {formatMoney(a.balance, a.currency)}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated {formatDate(a.updatedAt)}</span>
                  {a.shared && (
                    <Badge variant="secondary" className="gap-1">
                      <Users2 className="h-3 w-3" /> {a.members}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <AccountDetailPanel account={detail} onOpenChange={(v) => !v && setDetail(null)} />
      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}

function AccountDetailPanel({
  account,
  onOpenChange,
}: {
  account: Account | null;
  onOpenChange: (v: boolean) => void;
}) {
  if (!account) return <SidePanel open={false} onOpenChange={onOpenChange} title="Account" />;
  const Icon = accountIcon(account.type);
  const tx = TRANSACTIONS.filter((t) => t.accountId === account.id);
  const inflow = tx.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const outflow = tx.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);

  return (
    <SidePanel
      open={!!account}
      onOpenChange={onOpenChange}
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
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="destructive" size="sm">Delete</Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Balance" value={formatMoney(account.balance, account.currency)} />
        <StatCard label="Inflow (period)" value={formatMoney(inflow, account.currency)} tone="positive" />
        <StatCard label="Outflow (period)" value={formatMoney(outflow, account.currency)} tone="negative" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">AI account analysis</p>
        <p className="mt-2 text-sm text-foreground/90">
          Ferron notes: this account's outflow ({formatMoney(outflow, account.currency)}) is below its
          inflow ({formatMoney(inflow, account.currency)}) — healthy. Consider setting an
          auto-transfer rule for the surplus.
        </p>
        <Button size="sm" variant="outline" className="mt-3">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask Ferron about this account
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Recent transactions</h3>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {tx.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">No transactions yet.</li>
          )}
          {tx.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{t.merchant}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {formatDate(t.date)}</p>
              </div>
              <span className={`font-mono text-sm tabular-nums ${t.direction === "in" ? "text-success" : "text-foreground"}`}>
                {t.direction === "in" ? "+" : "−"}{formatMoney(t.amount, t.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SidePanel>
  );
}

function AddAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [type, setType] = useState<AccountType>("bank");
  const [currency, setCurrency] = useState("USD");
  const { loading, run } = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Account created", { description: "Ready to accept transactions." });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New account</DialogTitle>
          <DialogDescription>Add a bank, cash, mobile money, e-wallet, card or shared account.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          className="space-y-4"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="acct-name">Name</Label>
            <Input id="acct-name" placeholder="e.g. Everyday checking" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Currency</Label>
              <CurrencySelect value={currency} onChange={setCurrency} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="acct-balance">Starting balance</Label>
            <Input id="acct-balance" type="number" step="0.01" placeholder="0.00" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="acct-note">Note (optional)</Label>
            <Textarea id="acct-note" rows={3} placeholder="Anything you want to remember about this account…" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <LoadingButton type="submit" loading={loading} loadingText="Creating…">Create account</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
