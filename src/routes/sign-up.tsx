import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, GoogleGlyph } from "./sign-in";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account — Ferron" },
      {
        name: "description",
        content: "Create your free Ferron account. Email verification required.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/sign-up" }],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Could not create account", { description: error.message });
      return;
    }
    if (data.session) {
      toast.success("Account created");
      navigate({ to: "/onboarding" });
      return;
    }
    setSent(true);
    toast.success("Check your email", {
      description: "We sent you a confirmation link to activate your account.",
    });
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Google sign-up failed", {
        description: String(result.error.message ?? result.error),
      });
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/onboarding" });
  }

  if (sent) {
    return (
      <AuthShell
        title="Confirm your email"
        subtitle={`We sent a confirmation link to ${email}. Click it to activate your Ferron account.`}
        footer={
          <>
            Wrong address?{" "}
            <button
              onClick={() => setSent(false)}
              className="font-medium text-primary hover:underline"
            >
              Go back
            </button>
          </>
        }
      >
        <Link to="/sign-in">
          <Button variant="outline" className="w-full h-11">
            Back to sign in
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever for individuals."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
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
          <span className="mb-1.5 block font-medium">Full name</span>
          <input
            required
            maxLength={80}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
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
          <span className="mb-1.5 block font-medium">Password</span>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Minimum 8 characters.
          </span>
        </label>
        <p className="text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/conditions" className="text-primary hover:underline">
            Conditions
          </Link>
          .
        </p>
        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
