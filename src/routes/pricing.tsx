import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Ferron" },
      {
        name: "description",
        content:
          "Transparent Ferron pricing. Free forever for individuals, Pro for power users, Teams for shared money.",
      },
      { property: "og:title", content: "Pricing — Ferron" },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: PricingPage,
});

interface Plan {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  cta: string;
  featured?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Personal",
    tagline: "For individuals just starting.",
    monthly: 0,
    yearly: 0,
    cta: "Start free",
    features: [
      "Unlimited transactions",
      "3 accounts",
      "1 automation rule",
      "Basic AI accountant",
      "3-day trash recovery",
      "PDF reports",
    ],
  },
  {
    name: "Pro",
    tagline: "For freelancers and power users.",
    monthly: 8,
    yearly: 72,
    cta: "Go Pro",
    featured: true,
    features: [
      "Everything in Personal",
      "Unlimited accounts",
      "Unlimited automation rules",
      "Full AI accountant with actions",
      "Assets & smart-buy",
      "Premium email report delivery",
      "Priority support",
    ],
  },
  {
    name: "Teams",
    tagline: "For couples, roommates and small groups.",
    monthly: 18,
    yearly: 168,
    cta: "Start Teams",
    features: [
      "Everything in Pro",
      "Unlimited shared accounts",
      "Role management",
      "Group reports",
      "Admin audit log",
      "SLA support",
    ],
  },
];

const FAQS = [
  {
    q: "Can I switch between plans?",
    a: "Yes. Upgrades apply immediately, downgrades take effect at the next billing cycle. No pro-ration surprises.",
  },
  {
    q: "Is my data really mine?",
    a: "Always. Export a full JSON or PDF of your data at any time from Settings.",
  },
  {
    q: "Which currencies do you support?",
    a: "All of them. Ferron lets you set a base currency and tracks foreign amounts natively.",
  },
  {
    q: "Do you offer discounts?",
    a: "Yearly billing saves ~25%. We also offer education and nonprofit rates on request.",
  },
];

function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <>
      <section className="container-page pt-16 pb-6 md:pt-24 md:pb-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Transparent pricing. No surprises.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Start free forever. Upgrade only when Ferron pays for itself in
            recovered money.
          </p>
          <div className="mx-auto mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            {(["Monthly", "Yearly"] as const).map((label, i) => {
              const active = (label === "Yearly") === yearly;
              return (
                <button
                  key={label}
                  onClick={() => setYearly(i === 1)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                  {label === "Yearly" && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      -25%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page pb-16 md:pb-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col rounded-3xl border p-8 transition-all",
                p.featured
                  ? "border-primary bg-card shadow-xl shadow-primary/10 md:-translate-y-2"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tracking-tight">
                  {p.monthly === 0
                    ? "Free"
                    : formatMoney(yearly ? p.yearly / 12 : p.monthly, "USD")}
                </span>
                {p.monthly !== 0 && (
                  <span className="text-sm text-muted-foreground">/mo</span>
                )}
              </div>
              {p.monthly !== 0 && yearly && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Billed {formatMoney(p.yearly, "USD")} yearly
                </p>
              )}
              <Link to="/sign-up" className="mt-6">
                <Button
                  variant={p.featured ? "default" : "outline"}
                  className="w-full h-11"
                >
                  {p.cta}
                </Button>
              </Link>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
            Frequently asked
          </h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-card p-5 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  {f.q}
                  <span className="text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
