import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Money } from "@/components/ui/money";
import { formatMoney, formatMoneyExact, formatMonth } from "@/lib/format";
import type { AccountRow, AssetRow, DebtRow, TransactionRow } from "@/lib/queries/finance";
import type { InvestmentRow } from "@/lib/queries/investments";
import { cn } from "@/lib/utils";

interface GrowthChartProps {
  accounts: AccountRow[];
  transactions: TransactionRow[];
  assets: AssetRow[];
  debts: DebtRow[];
  investments: InvestmentRow[];
  currency: string;
  months?: number;
}

interface Point {
  month: string;
  label: string;
  netWorth: number;
  inflow: number;
  outflow: number;
  net: number;
}

function monthKeys(count: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    keys.push(m.toISOString().slice(0, 7));
  }
  return keys;
}

/**
 * Reconstructs a monthly series by walking current balances backwards through
 * the transaction ledger, so the last point always equals today's real figures.
 */
export function buildGrowthSeries(
  { accounts, transactions, assets, debts, investments }: Omit<GrowthChartProps, "currency" | "months">,
  months: number,
): Point[] {
  const keys = monthKeys(months);
  const cash = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const assetValue = assets.reduce((s, a) => s + Number(a.value), 0);
  const investValue = investments.reduce((s, i) => s + Number(i.current_value), 0);
  const owed = debts
    .filter((d) => d.kind === "loan" && d.status !== "settled")
    .reduce((s, d) => s + Number(d.outstanding), 0);

  const flows = new Map<string, { inflow: number; outflow: number }>();
  for (const key of keys) flows.set(key, { inflow: 0, outflow: 0 });
  for (const t of transactions) {
    const key = t.occurred_at.slice(0, 7);
    const bucket = flows.get(key);
    if (!bucket) continue;
    if (t.direction === "in") bucket.inflow += Number(t.amount);
    else bucket.outflow += Number(t.amount);
  }

  // Walk backwards: net worth at the end of month N = current − flows after N.
  const points: Point[] = [];
  let running = cash + assetValue + investValue - owed;
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i]!;
    const f = flows.get(key)!;
    points[i] = {
      month: key,
      label: formatMonth(`${key}-01`),
      netWorth: Math.round(running),
      inflow: Math.round(f.inflow),
      outflow: Math.round(f.outflow),
      net: Math.round(f.inflow - f.outflow),
    };
    running -= f.inflow - f.outflow;
  }
  return points;
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}:{" "}
          <span className="font-mono font-medium text-foreground tabular-nums">
            {formatMoneyExact(Number(p.value ?? 0), currency)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function GrowthChart({ currency, months = 12, ...data }: GrowthChartProps) {
  const points = React.useMemo(() => buildGrowthSeries(data, months), [data, months]);
  const first = points[0]?.netWorth ?? 0;
  const last = points[points.length - 1]?.netWorth ?? 0;
  const delta = last - first;
  const pct = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
  const up = delta >= 0;

  const axis = (v: number) => formatMoney(v, currency);

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
      <Tabs defaultValue="networth">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Growth</h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                <Money amount={last} currency={currency} />
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {pct === 0 ? "flat" : `${up ? "+" : ""}${pct.toFixed(1)}%`}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Last {months} months</p>
          </div>
          <TabsList>
            <TabsTrigger value="networth">Net worth</TabsTrigger>
            <TabsTrigger value="cashflow">Cash flow</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="networth" className="mt-4">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickFormatter={axis}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <RTooltip content={<ChartTooltip currency={currency} />} />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  name="Net worth"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#nwFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickFormatter={axis}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <RTooltip content={<ChartTooltip currency={currency} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="inflow" name="In" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Out" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="net" name="Net" stroke="var(--foreground)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
