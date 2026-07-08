import { createFileRoute } from "@tanstack/react-router";
import { Flag, Globe, Rocket, Sparkles, Users } from "lucide-react";
import { formatCompact } from "@/lib/format";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ferron" },
      {
        name: "description",
        content:
          "The story behind Ferron — building the world's most trusted personal accountant, one honest ledger at a time.",
      },
      { property: "og:title", content: "About — Ferron" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const TIMELINE = [
  {
    year: "2023",
    title: "The spreadsheet moment",
    body: "Ferron started as one founder's frustration: three banks, two mobile wallets, a cash box — and a fifty-tab spreadsheet held together by cell references.",
    icon: Flag,
  },
  {
    year: "2024",
    title: "First prototype",
    body: "A private beta with 40 users proved that a good ledger — not another budgeting app — was what people quietly needed.",
    icon: Rocket,
  },
  {
    year: "Early 2025",
    title: "Shared accounts arrive",
    body: "Couples, roommates and small teams asked for six-digit codes and clean roles. Ferron delivered without emails, invitations or ceremony.",
    icon: Users,
  },
  {
    year: "Mid 2025",
    title: "AI accountant, on-call",
    body: "We shipped virtual accountant personas that can create transactions, set rules and answer questions with your real numbers.",
    icon: Sparkles,
  },
  {
    year: "Today",
    title: "Global by default",
    body: "Ferron ships across 132 countries and every currency. The mission stays the same: money clarity, quietly delivered.",
    icon: Globe,
  },
] as const;

const STATS = [
  { n: 68_400, l: "Users worldwide" },
  { n: 132, l: "Countries" },
  { n: 4_120_000, l: "Transactions logged" },
];

function AboutPage() {
  return (
    <>
      <section className="container-page pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            About Ferron
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Money clarity, quietly delivered.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We build the personal accountant every household and freelancer
            deserves — trustworthy, fast, and beautifully organized.
          </p>
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-4 rounded-3xl border border-border bg-sidebar/60 p-8 text-center md:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.l}>
              <p className="font-display text-4xl font-bold text-primary">
                {formatCompact(s.n)}+
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Our journey
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Five moments that shaped Ferron.
          </p>
          <ol className="relative mt-14 border-l-2 border-border pl-8">
            {TIMELINE.map((t, i) => (
              <li key={t.year} className="relative pb-12 last:pb-0">
                <span className="absolute -left-[41px] top-0 grid h-11 w-11 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg">
                  <t.icon className="h-4 w-4" />
                </span>
                <p className="text-xs font-mono uppercase tracking-widest text-primary">
                  {t.year} · Stage {i + 1}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{t.title}</h3>
                <p className="mt-2 text-muted-foreground">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Our values</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              {
                t: "Trust first",
                b: "We refuse to ship anything that would make us hesitate to hand over our own bank statements.",
              },
              {
                t: "Quiet defaults",
                b: "Software should reduce noise, not add to it. Great defaults beat great settings.",
              },
              {
                t: "Global by design",
                b: "Every currency, every country. Money looks different everywhere — Ferron doesn't flinch.",
              },
            ].map((v) => (
              <div key={v.t}>
                <h3 className="font-semibold text-foreground">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
