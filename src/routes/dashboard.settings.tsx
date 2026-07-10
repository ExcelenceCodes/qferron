import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useState } from "react";
import { useWallpaper } from "@/components/wallpaper-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [currency, setCurrency] = useState("USD");
  const { wallpaper, setWallpaperId, wallpapers } = useWallpaper();

  return (
    <AppShell nav={USER_NAV} title="Settings" subtitle="Profile, preferences, security and data.">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Profile">
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue="Alex Rivera" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="alex@ferron.app" />
            </div>
            <div className="grid gap-1.5">
              <Label>Base currency</Label>
              <CurrencySelect value={currency} onChange={setCurrency} />
            </div>
            <Button>Save changes</Button>
          </div>
        </SectionCard>

        <SectionCard title="Wallpaper">
          {/* TODO(backend): seed wallpapers into Supabase `wallpapers` table + storage bucket. */}
          <p className="text-sm text-muted-foreground">Pick a background for your Ferron workspace.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {wallpapers.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWallpaperId(w.id)}
                className={cn(
                  "group relative aspect-video overflow-hidden rounded-lg border-2 transition-all",
                  wallpaper.id === w.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
                )}
                aria-label={`Choose ${w.name}`}
              >
                {w.url ? (
                  <img src={w.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-background to-muted text-xs text-muted-foreground">
                    Solid
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-left text-[10px] font-medium text-white">
                  {w.name}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Preferences">
          <div className="space-y-4">
            <PrefRow title="Weekly summary emails" desc="Every Monday at 8am local time." defaultChecked />
            <PrefRow title="Push notifications" desc="Rule hits, shared account activity." defaultChecked />
            <PrefRow title="AI suggestions" desc="Let Ferron suggest new automations." defaultChecked />
            <PrefRow title="Anonymous analytics" desc="Help us improve product quality." />
          </div>
        </SectionCard>
        <SectionCard title="Security">
          <div className="space-y-4">
            <PrefRow title="Two-factor authentication" desc="Recommended for shared accounts." defaultChecked />
            <PrefRow title="Session on trusted devices" desc="Skip login on remembered devices for 30 days." />
            <Button variant="outline">Change password</Button>
          </div>
        </SectionCard>
        <SectionCard title="Data">
          <p className="text-sm text-muted-foreground">Export or delete your data at any time. Your data belongs to you.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline">Export CSV</Button>
            <Button variant="outline">Export JSON</Button>
            <Button variant="destructive">Delete account</Button>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

function PrefRow({ title, desc, defaultChecked }: { title: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} aria-label={title} />
    </div>
  );
}
