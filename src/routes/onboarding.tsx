import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useBaseCurrency } from "@/lib/base-currency";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your Ferron — Onboarding" },
      {
        name: "description",
        content: "Answer a few questions so Ferron matches you to the right accountant persona.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/onboarding" }],
  }),
  component: OnboardingPage,
});

const JOBS = [
  "Employed",
  "Self-employed",
  "Freelancer",
  "Unemployed",
  "Student",
] as const;

const SOURCES = [
  "A friend",
  "Search engine",
  "Twitter / X",
  "LinkedIn",
  "YouTube",
  "Blog / news",
  "Other",
] as const;

// Base currency uses the full ISO list via CurrencySelect.

const ACCOUNTANTS = [
  {
    key: "atlas",
    name: "Atlas",
    tagline: "Growth-focused",
    strength: "Long-term planning, investing, compounding",
    aim: "Helps you build wealth patiently and sensibly.",
  },
  {
    key: "sage",
    name: "Sage",
    tagline: "Balance-focused",
    strength: "Budgets, savings rate, monthly clarity",
    aim: "Keeps you in balance and prevents month-end surprises.",
  },
  {
    key: "hero",
    name: "Hero",
    tagline: "Debt & repair-focused",
    strength: "Debt payoff, fee reduction, recovery plans",
    aim: "Fixes what's leaking and puts you on solid ground.",
  },
] as const;

type Step = 0 | 1 | 2 | 3 | 4 | 5;

function OnboardingPage() {
  const [step, setStep] = useState<Step>(0);
  const [job, setJob] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [accountant, setAccountant] = useState<string | null>(null);
  const [referral, setReferral] = useState("");
  const total = 5;
  const progress = useMemo(() => Math.min(step / total, 1), [step]);

  const canNext =
    (step === 0 && !!job) ||
    (step === 1 && !!source) ||
    (step === 2 && !!currency) ||
    (step === 3 && !!accountant) ||
    step === 4;

  return (
    <div className="container-page grid min-h-[calc(100vh-8rem)] place-items-start py-10 md:place-items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Step {Math.min(step + 1, total)} of {total}
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {step === 0 && (
            <StepBlock
              title="What best describes you?"
              subtitle="We'll tailor examples and defaults to fit your money life."
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {JOBS.map((j) => (
                  <ChoiceCard
                    key={j}
                    label={j}
                    selected={job === j}
                    onClick={() => setJob(j)}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 1 && (
            <StepBlock
              title="Where did you hear about Ferron?"
              subtitle="Helps us know what's working."
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {SOURCES.map((s) => (
                  <ChoiceCard
                    key={s}
                    label={s}
                    selected={source === s}
                    onClick={() => setSource(s)}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock
              title="What's your base currency?"
              subtitle="You can add more currencies later. Ferron supports every currency in the world."
            >
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock
              title="Pick your accountant persona"
              subtitle="Three virtual accountants, three lenses. You can switch anytime from Settings."
            >
              <div className="grid gap-3 md:grid-cols-3">
                {ACCOUNTANTS.map((a) => (
                  <button
                    type="button"
                    key={a.key}
                    onClick={() => setAccountant(a.key)}
                    className={cn(
                      "rounded-xl border p-5 text-left transition-all",
                      accountant === a.key
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40",
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                      {a.tagline}
                    </p>
                    <h3 className="mt-2 text-lg font-bold">{a.name}</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Strength:</span>{" "}
                      {a.strength}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Aim:</span> {a.aim}
                    </p>
                  </button>
                ))}
              </div>
            </StepBlock>
          )}

          {step === 4 && (
            <StepBlock
              title="Referral code (optional)"
              subtitle="Was Ferron recommended to you? Enter the code — both sides earn Pro credit."
            >
              <input
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder="e.g. FERRON-ABC123"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </StepBlock>
          )}

          {step === 5 && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight md:text-3xl">
                You're all set.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Welcome to Ferron. Your accountant is standing by.
              </p>
              <Link to="/dashboard" className="mt-8 inline-block">
                <Button size="lg" className="h-12 px-6">
                  Go to dashboard
                </Button>
              </Link>
            </div>
          )}

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, (s - 1)) as Step)}
              >
                Back
              </Button>
              <Button
                disabled={!canNext}
                onClick={() => {
                  if (step === 4) {
                    toast.success("Onboarding complete!");
                  }
                  setStep((s) => (s + 1) as Step);
                }}
              >
                {step === 4 ? "Finish" : "Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ChoiceCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-4 text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary/5 text-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
