import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Admin settings — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Settings" subtitle="Platform configuration and safety.">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Platform">
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" defaultValue="Ferron" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" defaultValue="All your transactions in 1 place" />
            </div>
            <Button>Save</Button>
          </div>
        </SectionCard>
        <SectionCard title="Access & safety">
          <div className="space-y-4">
            <Row title="Require 2FA for admins" desc="Enforced on next sign-in." on />
            <Row title="Allow new signups" desc="Toggle to pause registrations." on />
            <Row title="Rate-limit AI chat" desc="Per-user requests per minute." />
            <Row title="Guest chat preview" desc="Show the marketing chat widget." on />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

function Row({ title, desc, on }: { title: string; desc: string; on?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={on} aria-label={title} />
    </div>
  );
}
