import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, GoogleGlyph } from "./sign-in";
import { Button } from "@/components/ui/button";

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
  const navigate = useNavigate();
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            toast.success("Account created (demo).", {
              description: "Email verification will land in the auth phase.",
            });
            navigate({ to: "/onboarding" });
          }, 800);
        }}
        className="space-y-4"
      >
        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={() => toast.info("Google sign-up wires in the auth phase.")}
        >
          <GoogleGlyph className="mr-2 h-4 w-4" /> Continue with Google
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Email</span>
          <input
            required
            type="email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Password</span>
          <input
            required
            type="password"
            minLength={8}
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
