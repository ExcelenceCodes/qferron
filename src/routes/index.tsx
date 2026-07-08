import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  ChartBar,
  Landmark,
  Lock,
  PiggyBank,
  Repeat2,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCompact, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ferron — All your transactions in 1 place" },
      {
        name: "description",
        content:
          "The global AI-powered personal accountant. Track accounts, automate rules, share safely and get clear reports — for individuals, freelancers and small groups.",
      },
      { property: "og:title", content: "Ferron — All your transactions in 1 place" },
      {
        property: "og:description",
        content:
          "The global AI-powered personal accountant for individuals and groups.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

const STATS = [
  { value: 4_120_000, label: "Transactions tracked", format: "count" },
  { value: 68_400, label: "Active users", format: "count" },
  { value: 132, label: "Countries served", format: "count" },
  { value: 92_500_000, label: "Money moved (USD)", format: "money" },
] as const;

const FEATURES = [
  {
    icon: Wallet,
    title: "Every account in one place",
    body: "Bank, cash, mobile money and e-wallets — reconciled on one clean ledger you actually enjoy opening.",
  },
  {
    icon: Users,
    title: "Shared accounts with roles",
    body: "Six-digit join codes, manager and viewer roles, public and private comments. Group money without the fights.",
  },
  {
    icon: Repeat2,
    title: "Automation that pays",
    body: "Recurring rules, per-transaction cuts, scheduled transfers. Small automations, big monthly recovery.",
  },
  {
    icon: Bot,
    title: "AI accountant, on-call",
    body: "Ask, create, analyze. Your accountant persona knows your books and gets to the answer without spreadsheets.",
  },
  {
    icon: PiggyBank,
    title: "Assets & smart-buy",
    body: "Register assets and let Ferron buy from the right account when funds are enough — money rotation, tracked.",
  },
  {
    icon: ChartBar,
    title: "Reports you can send",
    body: "Range-based reports, exportable to premium email or PDF, always beautifully typeset.",
  },
] as const;

function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-[-10%] top-40 h-[380px] w-[420px] rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="container-page pt-16 pb-14 md:pt-24 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Now with your own AI accountant persona
            </span>
            <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              All your transactions in <span className="text-primary">one place</span>,
              with your professional personal accountant.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Ferron unifies every account you own — bank, cash, mobile, e-wallet —
              and pairs it with an AI accountant that quietly does the boring work.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/sign-up">
                <Button size="lg" className="h-12 px-6 text-base">
                  Get Ferron free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg" className="h-12 px-6 text-base">
                  See how it works
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-success" />
              Bank-level security · No credit card · Cancel anytime
            </p>
          </motion.div>

          {/* Preview card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/5"
          >
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[220px_1fr]">
              <aside className="hidden border-r border-border bg-sidebar p-5 md:block">
                <div className="mb-6 flex items-center gap-2">
                  <img
                    src="/assets/brand/favicon.webp"
                    alt=""
                    width={22}
                    height={22}
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-semibold">Ferron</span>
                </div>
                <nav className="space-y-1 text-sm">
                  {[
                    "Dashboard",
                    "Accounts",
                    "Transactions",
                    "Automation",
                    "Assets",
                    "Reports",
                    "Settings",
                  ].map((it, i) => (
                    <div
                      key={it}
                      className={`rounded-md px-2 py-1.5 ${
                        i === 0
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {it}
                    </div>
                  ))}
                </nav>
              </aside>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      This month
                    </p>
                    <h3 className="mt-1 text-2xl font-bold">Welcome back, Amina</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Books balanced
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { l: "Net worth", v: "$42,180", accent: "primary" },
                    { l: "Cash in", v: "$8,240", accent: "success" },
                    { l: "Cash out", v: "$3,190", accent: "secondary" },
                    { l: "Savings rate", v: "38%", accent: "chart-4" },
                  ].map((c) => (
                    <div
                      key={c.l}
                      className="rounded-xl border border-border bg-background/60 p-4"
                    >
                      <p className="text-xs text-muted-foreground">{c.l}</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                        {c.v}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-border bg-background/60 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Cashflow — last 30 days</p>
                    <span className="text-xs text-muted-foreground">
                      Updated just now
                    </span>
                  </div>
                  <MiniChart />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-sidebar/40">
        <div className="container-page grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary md:text-4xl">
                {s.format === "money"
                  ? formatMoney(s.value, "USD").replace(/\.\d+/, "")
                  : formatCompact(s.value)}
                {s.format === "count" && "+"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Built for real money life
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Boring accounting, delightful surface
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything a modern personal accountant needs — organized so you never
            have to think about the plumbing.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 text-secondary-foreground md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <Landmark className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Your money deserves better than a spreadsheet.
            </h2>
            <p className="mt-3 text-secondary-foreground/80">
              Free for individuals. Ready in minutes. No procurement process.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/sign-up">
                <Button size="lg" className="h-12 px-6">
                  Create free account
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  See pricing
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-secondary-foreground/70">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Bank-level encryption
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Global currencies
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MiniChart() {
  const points = [12, 18, 14, 22, 30, 24, 34, 28, 40, 36, 46, 44, 52, 48, 58];
  const max = Math.max(...points);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * 100} ${100 - (p / max) * 90}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.71 0.19 45)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.71 0.19 45)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L 100 100 L 0 100 Z`}
        fill="url(#g)"
      />
      <path d={path} fill="none" stroke="oklch(0.71 0.19 45)" strokeWidth="1.5" />
    </svg>
  );
}
