import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Download,
  LineChart as LineChartIcon,
  Mail,
  PieChart,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Sankey,
  Tooltip,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAuth } from "@/lib/auth";
import { useBaseCurrency } from "@/lib/base-currency";
import { formatMoney } from "@/lib/format";
import { useAccounts, useAssets, useDebts, useTransactions } from "@/lib/queries/finance";
import { useInvestments } from "@/lib/queries/investments";
import { useCreateNotification } from "@/lib/queries/platform";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Ferron" },
      { name: "description", content: "Money flow, categories and net worth at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportsPage,
});

const RANGES = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 6 months" },
  { value: "365", label: "Last 12 months" },
  { value: "all", label: "All time" },
] as const;

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "#f59e0b",
  "#0ea5e9",
  "#22c55e",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
];

function monthKey(d: string) {
  return d.slice(0, 7);
}

function ReportsPage() {
  const { data: txs, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: assets } = useAssets();
  const { data: debts } = useDebts();
  const { data: investments } = useInvestments();
  const { currency } = useBaseCurrency();
  const [mailOpen, setMailOpen] = useState(false);
  const [range, setRange] = useState<string>("90");
  const [accountId, setAccountId] = useState<string>("all");

  const thisMonth = new Date().toISOString().slice(0, 7);

  const rows = useMemo(() => {
    let list = txs ?? [];
    if (accountId !== "all") list = list.filter((t) => t.account_id === accountId);
    if (range !== "all") {
      const from = new Date();
      from.setDate(from.getDate() - Number(range));
      const key = from.toISOString().slice(0, 10);
      list = list.filter((t) => t.occurred_at >= key);
    }
    return list;
  }, [txs, accountId, range]);

  const report = useMemo(() => {
    const spend = rows.filter((t) => t.direction === "out").reduce((s, t) => s + Number(t.amount), 0);
    const income = rows.filter((t) => t.direction === "in").reduce((s, t) => s + Number(t.amount), 0);

    const group = (dir: "in" | "out") => {
      const m = new Map<string, number>();
      for (const t of rows) {
        if (t.direction !== dir) continue;
        m.set(t.category, (m.get(t.category) ?? 0) + Number(t.amount));
      }
      const total = dir === "out" ? spend : income;
      return [...m.entries()]
        .map(([name, amount]) => ({ name, amount, pct: total > 0 ? (amount / total) * 100 : 0 }))
        .sort((a, b) => b.amount - a.amount);
    };

    const outCats = group("out");
    const inCats = group("in");

    const months: { key: string; in: number; out: number; net: number }[] = [];
    const span = range === "all" ? 12 : Math.max(Math.ceil(Number(range) / 30), 2);
    for (let i = span - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const m = rows.filter((t) => monthKey(t.occurred_at) === key);
      const mi = m.filter((t) => t.direction === "in").reduce((s, t) => s + Number(t.amount), 0);
      const mo = m.filter((t) => t.direction === "out").reduce((s, t) => s + Number(t.amount), 0);
      months.push({ key: key.slice(2), in: mi, out: mo, net: mi - mo });
    }

    const savingsRate = income > 0 ? ((income - spend) / income) * 100 : 0;
    return { spend, income, outCats, inCats, months, savingsRate, count: rows.length };
  }, [rows, range]);

  const sankey = useMemo(() => {
    const inTop = report.inCats.slice(0, 6);
    const outTop = report.outCats.slice(0, 8);
    if (inTop.length === 0 && outTop.length === 0) return null;
    const hub = { name: accountId === "all" ? "All accounts" : accounts?.find((a) => a.id === accountId)?.name ?? "Account" };
    const nodes = [...inTop.map((c) => ({ name: c.name })), hub, ...outTop.map((c) => ({ name: c.name }))];
    const hubIndex = inTop.length;
    const links = [
      ...inTop.map((c, i) => ({ source: i, target: hubIndex, value: Math.max(c.amount, 0.01) })),
      ...outTop.map((c, i) => ({
        source: hubIndex,
        target: hubIndex + 1 + i,
        value: Math.max(c.amount, 0.01),
      })),
    ];
    if (links.length === 0) return null;
    return { nodes, links };
  }, [report.inCats, report.outCats, accountId, accounts]);

  const cash = (accounts ?? []).reduce((s, a) => s + Number(a.balance), 0);
  const assetValue = (assets ?? []).reduce((s, a) => s + Number(a.value), 0);
  const investValue = (investments ?? []).reduce((s, i) => s + Number(i.current_value), 0);
  const investProfit = (investments ?? []).reduce(
    (s, i) => s + Number(i.current_value) - Number(i.principal),
    0,
  );
  const owed = (debts ?? [])
    .filter((d) => d.kind === "loan" && d.status !== "settled")
    .reduce((s, d) => s + Number(d.outstanding), 0);
  const netWorth = cash + assetValue + investValue - owed;

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error("Nothing to export yet");
      return;
    }
    const header = "date,direction,amount,currency,category,merchant,note";
    const body = rows
      .map((t) =>
        [
          t.occurred_at,
          t.direction,
          t.amount,
          t.currency,
          `"${(t.category ?? "").replace(/"/g, '""')}"`,
          `"${(t.merchant ?? "").replace(/"/g, '""')}"`,
          `"${(t.note ?? "").replace(/"/g, '""')}"`,
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ferron-report-${thisMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <AppShell
      nav={USER_NAV}
      title="Reports"
      subtitle="Where your money comes from, where it goes, and what you're worth."
      headerRight={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setMailOpen(true)}>
            <Mail className="mr-1.5 h-4 w-4" /> Mail me
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-44">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-56">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
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
        <p className="text-xs text-muted-foreground">{report.count} transactions in range</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Money in"
          value={formatMoney(report.income, currency)}
          hint={`${report.inCats.length} sources`}
          tone="positive"
          icon={ArrowUpRight}
        />
        <StatCard
          label="Money out"
          value={formatMoney(report.spend, currency)}
          hint={`${report.outCats.length} categories`}
          tone="negative"
          icon={ArrowDownRight}
        />
        <StatCard
          label="Savings rate"
          value={`${report.savingsRate.toFixed(0)}%`}
          hint="Target 20%"
          icon={TrendingUp}
        />
        <StatCard
          label="Net worth"
          value={formatMoney(netWorth, currency)}
          hint={`${formatMoney(owed, currency)} owed`}
          icon={Wallet}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Cash across accounts" value={formatMoney(cash, currency)} icon={Wallet} />
        <StatCard
          label="Assets registered"
          value={formatMoney(assetValue, currency)}
          hint={`${assets?.length ?? 0} assets`}
          icon={Coins}
        />
        <StatCard
          label="Investments"
          value={formatMoney(investValue, currency)}
          hint={`${investProfit >= 0 ? "+" : ""}${formatMoney(investProfit, currency)} profit`}
          tone={investProfit >= 0 ? "positive" : "negative"}
          icon={LineChartIcon}
        />
      </div>

      <div className="mt-6">
        <SectionCard title="Cash flow trend">
          {isLoading ? (
            <ListSkeleton />
          ) : report.count === 0 ? (
            <EmptyState
              icon={Scale}
              title="No activity in this range"
              description="Record income and spending and the trend builds itself."
            />
          ) : (
            <div
              className="h-[320px] w-full"
              role="img"
              aria-label="Monthly money in, money out and running balance"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={report.months} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="inFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="key" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={52} />
                  <ReTooltip
                    formatter={(v: number) => formatMoney(Number(v), currency)}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="in"
                    name="Money in"
                    stroke="#22c55e"
                    fill="url(#inFill)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="out"
                    name="Money out"
                    stroke="hsl(var(--primary))"
                    fill="url(#outFill)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="running"
                    name="Running balance"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Money in and out per month across{" "}
            {accountId === "all" ? "all accounts" : "the selected account"}, with the running balance
            of the range.
          </p>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Spend by category">
          {report.outCats.length === 0 ? (
            <EmptyState
              icon={PieChart}
              title="No spending in this range"
              description="Adjust the range or record transactions to see the breakdown."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={report.outCats.slice(0, 8)}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {report.outCats.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v: number) => formatMoney(Number(v), currency)} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2.5">
                {report.outCats.slice(0, 8).map((c, i) => (
                  <li key={c.name} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        {c.name}
                      </span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {c.pct.toFixed(0)}% · {formatMoney(c.amount, currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Monthly in vs out">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="key" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={48} />
                <ReTooltip formatter={(v: number) => formatMoney(Number(v), currency)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="in" name="In" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Out" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <MailMeDialog open={mailOpen} onOpenChange={setMailOpen} month={thisMonth} />
    </AppShell>
  );
}

function MailMeDialog({
  open,
  onOpenChange,
  month,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  month: string;
}) {
  const { profile } = useAuth();
  const notify = useCreateNotification();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> Mail me this report
          </DialogTitle>
          <DialogDescription>We'll queue a summary and confirm it in your inbox.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            try {
              await notify.mutateAsync({
                title: "Report requested",
                body: `Your ${month} report was queued for ${String(fd.get("email"))}.`,
                category: "system",
                href: "/dashboard/reports",
              });
              toast.success("Report queued", {
                description: "You'll be notified when it's ready.",
              });
              onOpenChange(false);
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="mail-to">Email</Label>
            <Input
              id="mail-to"
              name="email"
              type="email"
              required
              defaultValue={profile?.email ?? ""}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mail-subject">Subject</Label>
            <Input id="mail-subject" name="subject" defaultValue={`Your Ferron report — ${month}`} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={notify.isPending} loadingText="Sending…">
              <Mail className="mr-1.5 h-4 w-4" /> Send report
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
