import { publicPageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/conditions")({
  head: () =>
    publicPageHead({
      path: "/conditions",
      title: "Conditions of Use — Ferron",
      description:
        "Detailed conditions of use and privacy handling on Ferron.",
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Conditions", path: "/conditions" }],
    }),
  component: ConditionsPage,
});

const SECTIONS = [
  {
    heading: "Privacy & data handling",
    body: "We collect only the data necessary to run Ferron. Financial data is encrypted at rest and in transit. We never sell your data.",
  },
  {
    heading: "Cookies",
    body: "Ferron uses essential cookies for session management and optional analytics cookies you can opt out of at any time.",
  },
  {
    heading: "Shared accounts",
    body: "When you join a shared account, participants can see the transactions posted to that account. Personal notes remain private.",
  },
  {
    heading: "Deletion & retention",
    body: "Deleted items sit in a 3-day recoverable trash before permanent removal. Deleting your account permanently removes personal data within 30 days.",
  },
  {
    heading: "Third-party services",
    body: "Ferron may integrate with third-party services (email delivery, payment processing). Their handling of data is governed by their own privacy policies.",
  },
  {
    heading: "Children",
    body: "Ferron is not intended for users under 16. We do not knowingly collect data from children.",
  },
];

function ConditionsPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Conditions of Use
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
