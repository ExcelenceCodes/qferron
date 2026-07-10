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
import { HeroVideo, SubHero } from "@/components/marketing/hero-video";
import { Newsletter } from "@/components/marketing/newsletter";
import { formatCompact, formatMoney } from "@/lib/format";
import subheroAsset from "@/assets/hero/subhero-bg.jpg.asset.json";
import financialPower from "@/assets/vectors/financial-power.png.asset.json";
import analysisReports from "@/assets/vectors/analysis-reports.png.asset.json";
import lovedCommunity from "@/assets/vectors/loved-community.png.asset.json";
import aiVector from "@/assets/vectors/ai.jpg.asset.json";

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
        content: "The global AI-powered personal accountant for individuals and groups.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

const STATS = [
  { icon: Repeat2, value: 4_120_000, label: "Transactions tracked", format: "count" },
  { icon: Users, value: 68_400, label: "Active users", format: "count" },
  { icon: Building2, value: 132, label: "Countries served", format: "count" },
  { icon: Wallet, value: 92_500_000, label: "Money moved (USD)", format: "money" },
] as const;

const FEATURES = [
  { icon: Wallet, title: "Every account in one place", body: "Bank, cash, mobile money and e-wallets — reconciled on one clean ledger you actually enjoy opening." },
  { icon: Users, title: "Shared accounts with roles", body: "Six-digit join codes, manager and viewer roles, public and private comments. Group money without the fights." },
  { icon: Repeat2, title: "Automation that pays", body: "Recurring rules, per-transaction cuts, scheduled transfers. Small automations, big monthly recovery." },
  { icon: Bot, title: "AI accountant, on-call", body: "Ask, create, analyze. Your accountant persona knows your books and gets to the answer without spreadsheets." },
  { icon: PiggyBank, title: "Assets & smart-buy", body: "Register assets and let Ferron buy from the right account when funds are enough — money rotation, tracked." },
  { icon: ChartBar, title: "Reports you can send", body: "Range-based reports, exportable to premium email or PDF, always beautifully typeset." },
] as const;

function LandingPage() {
  return (
    <>
      {/* HERO — video background */}
      <HeroVideo>
        <div className="container-page pt-16 pb-14 md:pt-24 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
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
                <Button variant="outline" size="lg" className="h-12 px-6 text-base backdrop-blur">
                  See how it works
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-success" />
              Bank-level security · No credit card · Cancel anytime
            </p>
          </motion.div>
        </div>
      </HeroVideo>

      {/* STATS with peculiar icons */}
      <section className="border-y border-border bg-sidebar/40">
        <div className="container-page grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="group text-center">
              <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                <s.icon className="h-5 w-5" />
              </span>
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

      {/* SUB-HERO — image background */}
      <SubHero src={subheroAsset.url}>
        <div className="container-page py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Full financial power
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                A calm ledger for a noisy financial life.
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Consolidate every account, categorise on autopilot, and let your Ferron
                accountant persona explain your money in plain language — any hour, any day.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/features">
                  <Button variant="default">Explore features</Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" className="backdrop-blur">See pricing</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img src={financialPower.url} alt="Full financial power" className="w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </SubHero>

      {/* FEATURES */}
      <section className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Built for real money life</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Boring accounting, delightful surface</h2>
          <p className="mt-4 text-muted-foreground">Everything a modern personal accountant needs — organized so you never have to think about the plumbing.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEEP ANALYSIS */}
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <img src={analysisReports.url} alt="Deep analysis and reports" className="w-full rounded-2xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Deep analysis & reports</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Reports beautiful enough to send.</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Range-based summaries, trend detection, category breakdowns and
              premium email delivery — your accountant, in your inbox.
            </p>
          </div>
        </div>
      </section>

      {/* LOVED BY EVERYONE */}
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Loved by everyone</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Freelancers, families, and small teams.</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Ferron works the same whether you track one wallet or a shared pool with
              four members and three currencies. Money, without the drama.
            </p>
          </div>
          <img src={lovedCommunity.url} alt="Loved by everyone" className="order-1 w-full rounded-2xl md:order-2" />
        </div>
      </section>

      {/* AI */}
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <img src={aiVector.url} alt="AI accountant" className="w-full rounded-2xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">AI accountant</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Ask, and Ferron acts.</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Create accounts, log transactions, set rules — all from a conversation.
              Ferron speaks your books fluently.
            </p>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <Newsletter />

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 text-secondary-foreground md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <Landmark className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Your money deserves better than a spreadsheet.</h2>
            <p className="mt-3 text-secondary-foreground/80">Free for individuals. Ready in minutes. No procurement process.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/sign-up">
                <Button size="lg" className="h-12 px-6">Create free account</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="h-12 border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">See pricing</Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-secondary-foreground/70">
              <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Bank-level encryption</span>
              <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Global currencies</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
