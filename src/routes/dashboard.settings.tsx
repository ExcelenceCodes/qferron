import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencySelect } from "@/components/ui/currency-select";
import { LoadingButton } from "@/components/ui/loading-button";
import { useBaseCurrency } from "@/lib/base-currency";
import { useWallpaper } from "@/components/wallpaper-provider";
import { useAuth } from "@/lib/auth";
import { useUpdateProfile } from "@/lib/queries/finance";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { currency, setCurrency } = useBaseCurrency();
  const { wallpaper, setWallpaperId, wallpapers } = useWallpaper();
  const { user, profile } = useAuth();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  async function saveProfile() {
    try {
      await updateProfile.mutateAsync({ full_name: fullName || null });
      toast.success("Profile saved");
    } catch (e) {
      toast.error("Could not save profile", { description: (e as Error).message });
    }
  }

  async function sendPasswordReset() {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent", { description: user.email });
    } catch (e) {
      toast.error("Could not send reset email", { description: (e as Error).message });
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <AppShell nav={USER_NAV} title="Settings" subtitle="Profile, preferences, security and data.">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Profile">
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile?.email ?? user?.email ?? ""} disabled />
            </div>
            <div className="grid gap-1.5">
              <Label>Base currency</Label>
              <CurrencySelect value={currency} onChange={setCurrency} />
              <p className="text-xs text-muted-foreground">
                Every account uses this currency. Change here (or during onboarding) — never per account.
              </p>
            </div>
            <LoadingButton
              onClick={() => void saveProfile()}
              loading={updateProfile.isPending}
              loadingText="Saving…"
            >
              Save changes
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard title="Wallpaper">
          <p className="text-sm text-muted-foreground">Pick a background for your Ferron workspace.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {wallpapers.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  const previous = wallpaper.id;
                  setWallpaperId(w.id);
                  void updateProfile
                    .mutateAsync({ wallpaper: w.id })
                    .then(() => toast.success(`${w.name} background applied`))
                    .catch((e) => {
                      setWallpaperId(previous);
                      toast.error("Could not save background", {
                        description: (e as Error).message,
                      });
                    });
                }}
                className={cn(
                  "group relative aspect-video overflow-hidden rounded-[4px] border-2 transition-all",
                  wallpaper.id === w.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40",
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
            <PrefRow title="Two-factor authentication" desc="Recommended for shared accounts." />
            <PrefRow title="Session on trusted devices" desc="Skip login on remembered devices for 30 days." />
            <LoadingButton
              variant="outline"
              loading={sendingReset}
              loadingText="Sending…"
              onClick={() => void sendPasswordReset()}
            >
              Change password
            </LoadingButton>
          </div>
        </SectionCard>
        <SectionCard title="Data">
          <p className="text-sm text-muted-foreground">
            Export or delete your data at any time. Your data belongs to you.
          </p>
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
