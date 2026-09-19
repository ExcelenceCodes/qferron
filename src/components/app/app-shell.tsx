import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { Bell, LogOut, Menu, User, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WallpaperBackdrop } from "@/components/wallpaper-provider";
import { useNotifications } from "@/lib/queries/platform";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ChatDock } from "@/components/ai/chat-dock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface AppShellProps {
  nav: NavItem[];
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function AppShell({ nav, title, subtitle, headerRight, children }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const unread = (notifications ?? []).filter((n) => !n.read_at).length;
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const notifPath = nav.some((n) => n.to.endsWith("/notifications"))
    ? nav.find((n) => n.to.endsWith("/notifications"))!.to
    : null;

  return (
    <div className="relative min-h-screen bg-background">
      <WallpaperBackdrop />
      <aside
        className={cn(
          "fixed z-40 flex flex-col overflow-hidden transition-transform duration-200 ease-out",
          "inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar",
          "lg:inset-y-3 lg:left-3 lg:w-64 lg:rounded-[4px] lg:border lg:border-border/60 lg:bg-sidebar/75 lg:shadow-lg lg:shadow-black/5 lg:backdrop-blur-xl",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border/70 px-5">
          <Logo />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-3" aria-label={title}>
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && item.to !== "/admin" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-[17.5rem] lg:pr-3">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6 lg:top-3 lg:rounded-[4px] lg:border lg:border-border/60 lg:bg-background/65 lg:shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-semibold leading-tight text-foreground">{title}</h1>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerRight}
            {notifPath && (
              <Link to={notifPath} aria-label="Notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]">
                      {unread}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {profile?.full_name || user?.email || "Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard/settings" })}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/" })}>
                  Back to site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    void signOut().then(() =>
                      navigate({ to: "/sign-in", replace: true }),
                    );
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </div>

      {!pathname.startsWith("/admin") && !pathname.startsWith("/dashboard/chat") && <ChatDock />}

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
  icon?: LucideIcon;
}

export function StatCard({ label, value, hint, tone = "default", icon: Icon }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[4px] border border-border/70 bg-card/80 p-5 backdrop-blur-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-2 font-display text-2xl font-semibold tabular-nums",
              tone === "positive" && "text-success",
              tone === "negative" && "text-destructive",
            )}
          >
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[4px] bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary via-primary to-transparent transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[4px] border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
