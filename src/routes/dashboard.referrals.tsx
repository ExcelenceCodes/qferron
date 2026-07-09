import { createFileRoute } from "@tanstack/react-router";
import { Copy, Gift } from "lucide-react";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/referrals")({
  head: () => ({ meta: [{ title: "Referrals — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  return (
    <AppShell nav={USER_NAV} title="Referrals" subtitle="Share Ferron, earn credits.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Signups" value="12" hint="6 activated" />
        <StatCard label="Credits earned" value="$36" hint="4 pending" tone="positive" />
        <StatCard label="Tier" value="Silver" hint="8 to Gold" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Your referral link">
          <div className="flex items-center gap-2 rounded-md bg-muted p-3">
            <code className="flex-1 truncate text-sm">https://ferron.app/join/alex-9F2K</code>
            <Button variant="ghost" size="sm"><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Earn $3 in credits for every friend who activates their first account.</p>
        </SectionCard>
        <SectionCard title="How it works">
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">1</span>Share your link.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>Friend signs up and connects an account.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">3</span>Both of you get <Gift className="mx-1 inline h-3.5 w-3.5" />$3 in credits.</li>
          </ol>
        </SectionCard>
      </div>
    </AppShell>
  );
}
