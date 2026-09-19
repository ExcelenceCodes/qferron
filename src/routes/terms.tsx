import { publicPageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () =>
    publicPageHead({
      path: "/terms",
      title: "Terms of Service — Ferron",
      description:
        "The terms that govern your use of Ferron.",
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }],
    }),
  component: TermsPage,
});

const SECTIONS = [
  {
    heading: "1. Acceptance of terms",
    body: "By creating an account or using Ferron, you agree to these Terms. If you do not agree, please do not use the service.",
  },
  {
    heading: "2. Your account",
    body: "You are responsible for keeping your login credentials safe and for all activity on your account. Enable two-factor authentication when available.",
  },
  {
    heading: "3. Acceptable use",
    body: "You agree not to misuse the service, attempt unauthorized access, disrupt other users, or upload content that violates law or intellectual property rights.",
  },
  {
    heading: "4. Subscriptions & billing",
    body: "Paid plans renew automatically. Cancel any time from Settings — access continues until the end of the paid period.",
  },
  {
    heading: "5. Data ownership",
    body: "Your financial data belongs to you. Export a full copy anytime. We process data only to provide and improve the service.",
  },
  {
    heading: "6. Limitation of liability",
    body: "Ferron is provided \"as is\". We are not liable for indirect or consequential losses arising from use of the service, to the extent permitted by law.",
  },
  {
    heading: "7. Changes to these terms",
    body: "We may update these Terms. We will notify you of material changes at least 14 days in advance via email or in-app notice.",
  },
];

function TermsPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: January 1, 2026
        </p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
