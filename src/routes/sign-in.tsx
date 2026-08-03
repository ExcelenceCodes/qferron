import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/sign-in")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Ferron" },
      { name: "description", content: "Sign in to your Ferron account." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/sign-in" }],
  }),
  component: SignInPage,
});

function safePath(value?: string) {
  if (!value) return null;
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const search = useSearch({ from: "/sign-in" });
  const next = safePath(search.redirect);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Could not sign in", { description: error.message });
      return;
    }
    toast.success("Welcome back");
    navigate({ to: next ?? "/dashboard" });
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    if (next) sessionStorage.setItem("ferron:next", next);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Google sign-in failed", { description: String(result.error.message ?? result.error) });
      return;
    }
    if (result.redirected) return;
    navigate({ to: next ?? "/dashboard" });
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your accountant."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/sign-up" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          disabled={googleLoading}
          onClick={handleGoogle}
        >
          <GoogleGlyph className="mr-2 h-4 w-4" />
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </Button>
        <div className="relative py-2 text-center">
          <span className="relative z-10 bg-card px-2 text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 flex items-center justify-between font-medium">
            Password
            <Link
              to="/forgot-password"
              className="text-xs font-normal text-primary hover:underline"
            >
              Forgot?
            </Link>
          </span>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-page grid min-h-[calc(100vh-9rem)] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
        {footer && (
          <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}

export function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.5-1.7 4.4-5.5 4.4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.6 14.6 2.6 12 2.6 6.9 2.6 2.8 6.7 2.8 11.8s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}
