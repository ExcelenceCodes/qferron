import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "./sign-in";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Ferron" },
      { name: "description", content: "Request a Ferron password reset link." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not send reset link", { description: error.message });
      return;
    }
    setSent(true);
    toast.success("Reset link sent");
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle={
        sent
          ? "If an account exists for that address, a reset link is on its way."
          : "We'll email you a secure link to set a new one."
      }
      footer={
        <Link to="/sign-in" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <Button variant="outline" className="w-full h-11" onClick={() => setSent(false)}>
          Send another link
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
