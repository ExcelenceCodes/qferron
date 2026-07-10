import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useWallpaper } from "@/components/wallpaper-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Admin settings — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { wallpaper, setWallpaperId, wallpapers } = useWallpaper();

  return (
    <AppShell nav={ADMIN_NAV} title="Settings" subtitle="Platform safety and workspace preferences.">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Access & safety">
          <div className="space-y-4">
            <Row title="Require 2FA for admins" desc="Enforced on next sign-in." on />
            <Row title="Allow new signups" desc="Toggle to pause registrations." on />
            <Row title="Rate-limit AI chat" desc="Per-user requests per minute." />
            <Row title="Guest chat preview" desc="Show the marketing chat widget." on />
          </div>
        </SectionCard>

        <SectionCard title="Wallpaper library">
          {/* TODO(backend): seed wallpapers into Supabase `wallpapers` table + storage bucket. */}
          <p className="text-sm text-muted-foreground">Pick a workspace wallpaper. Users can override in their settings.</p>
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
          <Button variant="outline" size="sm" className="mt-4" disabled>
            Upload new wallpaper (soon)
          </Button>
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
