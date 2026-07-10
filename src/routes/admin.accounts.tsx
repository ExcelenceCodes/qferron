import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Wallet, TrendingUp, Users2 } from "lucide-react";
import { ACCOUNTS } from "@/lib/mock/app";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/admin/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminAccountsPage,
});

const BY_TYPE = [
  { type: "Bank", count: 24580, share: 36 },
  { type: "Cash", count: 8210, share: 12 },
  { type: "Mobile", count: 18400, share: 27 },
  { type: "Wallet", count: 11220, share: 16 },
  { type: "Card", count: 4900, share: 7 },
  { type: "Shared", count: 1102, share: 2 },
];

const GROWTH = [
  { m: "Feb", accounts: 41200 },
  { m: "Mar", accounts: 46100 },
  { m: "Apr", accounts: 51900 },
  { m: "May", accounts: 57400 },
  { m: "Jun", accounts: 62500 },
  { m: "Jul", accounts: 68412 },
];

const config = {
  count: { label: "Accounts", color: "var(--chart-1)" },
  accounts: { label: "Accounts", color: "var(--chart-2)" },
} satisfies ChartConfig;

function AdminAccountsPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Accounts" subtitle="System-wide account inventory.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total accounts" value="68,412" icon={Wallet} />
        <StatCard label="Shared pools" value="1,204" hint="+18 this week" icon={Users2} tone="positive" />
        <StatCard label="Avg balance (USD est.)" value="$2,140" icon={TrendingUp} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Accounts by type">
          <ChartContainer config={config} className="h-72 w-full">
            <BarChart data={BY_TYPE}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="type" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <p className="mt-2 text-xs text-muted-foreground">
            Distribution across account types — sample of {ACCOUNTS.length} live rows.
          </p>
        </SectionCard>
        <SectionCard title="Account growth (6 months)">
          <ChartContainer config={config} className="h-72 w-full">
            <LineChart data={GROWTH}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="accounts" stroke="var(--color-accounts)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </SectionCard>
      </div>
    </AppShell>
  );
}
