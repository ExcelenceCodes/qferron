import { publicPageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  ChartBar,
  FileDown,
  Landmark,
  Layers,
  Lock,
  Repeat2,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { formatCompact } from "@/lib/format";
import { Newsletter } from "@/components/marketing/newsletter";
const financialPower = { url: "/media/vectors/financial-power.png" };
const analysisReports = { url: "/media/vectors/analysis-reports.png" };

export const Route = createFileRoute("/features")({
  head: () =>
    publicPageHead({
      path: "/features",
      title: "Features — Ferron",
      description:
        "Every Ferron feature explained plainly — accounts, sharing, automation, AI accountant, assets, reports, trash and security.",
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Features", path: "/features" }],
    }),
  component: FeaturesPage,
});

const GROUPS = [
  {
    title: "Accounts, unified",
    icon: Wallet,
    items: [
      { icon: Landmark, title: "Bank accounts", body: "Add bank name, branch, account number and type. Import from CSV, keep a running balance." },
      { icon: Wallet, title: "Cash", body: "Simple cash wallets with a name and current balance — perfect for petty spends and float." },
      { icon: Smartphone, title: "Mobile money", body: "Track carrier, number and starting balance. Every transaction reconciles the same day." },
      { icon: Layers, title: "E-wallets", body: "PayPal, Wise, Payoneer, digital wallets — one screen for all balances." },
    ],
  },
  {
    title: "Groups without the fights",
    icon: Users,
    items: [
      { icon: Users, title: "Shared accounts", body: "A six-digit code joins any Bank, Cash or E-wallet account. Real-time code validation, instant access." },
      { icon: Shield, title: "Roles that matter", body: "Managers create and view. Viewers only view. Only the transaction creator can delete it." },
      { icon: Sparkles, title: "Public & private comments", body: "Discuss transactions publicly with the group, or add private notes only you can see." },
    ],
  },
  {
    title: "Intelligence & automation",
    icon: Bot,
    items: [
      { icon: Repeat2, title: "Recurring & scheduled", body: "Rent, subscriptions, salaries, giving — one-off or repeating, exactly when you want them." },
      { icon: Bot, title: "Per-transaction cuts", body: "Automate bank fees, service charges and any percentage-based deductions." },
      { icon: Sparkles, title: "AI accountant", body: "Ask, create transactions, add rules and accounts — all from a chat." },
    ],
  },
  {
    title: "Reports, trust & control",
    icon: ChartBar,
    items: [
      { icon: ChartBar, title: "Range-based reports", body: "Beautiful charts, tables and summaries for any time window." },
      { icon: FileDown, title: "Export anywhere", body: "Send premium-typeset reports over email (Mailme) or download a PDF." },
      { icon: Trash2, title: "Recoverable trash", body: "Soft delete for 3 days. Restore anything with one tap before it permanently leaves." },
      { icon: Lock, title: "Bank-level security", body: "Optional two-factor via email, per-device sessions and privacy-first data handling by default." },
    ],
  },
] as const;

const HIGHLIGHTS = [
  { n: 40_000, l: "Recurring rules automated monthly" },
  { n: 1_800_000, l: "Comments left on shared transactions" },
  { n: 99.98, l: "% uptime last 12 months", raw: true },
];

function FeaturesPage() {
  return (
    <>
      {/* HERO */}
      <section className="container-page pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Features</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Everything Ferron does, plainly explained.</h1>
          <p className="mt-4 text-muted-foreground">No jargon, no bullet-point salad — just a clear walk through what makes Ferron your personal accountant.</p>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="container-page">
        <div className="grid gap-4 rounded-3xl border border-border bg-sidebar/60 p-6 text-center md:grid-cols-3 md:p-8">
          {HIGHLIGHTS.map((h) => (
            <div key={h.l}>
              <p className="font-display text-3xl font-bold text-primary">{h.raw ? `${h.n}%` : `${formatCompact(h.n)}+`}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{h.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SPLASH — vector illustration */}
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <img src={financialPower.url} alt="Full financial power" className="w-full rounded-2xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Everything, in one place</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">A single ledger for every wallet you touch.</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Bank, cash, mobile money, e-wallets, shared accounts — reconciled together, without the copy-paste dance.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page space-y-16 py-16 md:space-y-24 md:py-24">
        {GROUPS.map((g) => (
          <section key={g.title} aria-labelledby={g.title}>
            <div className="mb-8 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <g.icon className="h-5 w-5" />
              </span>
              <h2 id={g.title} className="text-2xl font-bold tracking-tight md:text-3xl">{g.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {g.items.map((it) => (
                <article key={it.title} className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <it.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">{it.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* REPORTS SPLASH */}
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reports & analysis</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">See what your money is really doing.</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">Category breakdowns, trend detection and premium mail-me delivery — your accountant, on paper.</p>
          </div>
          <img src={analysisReports.url} alt="Deep analysis and reports" className="order-1 w-full rounded-2xl md:order-2" />
        </div>
      </section>

      <Newsletter />
    </>
  );
}
