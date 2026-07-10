import * as React from "react";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { LoadingButton, useAsyncAction } from "@/components/ui/loading-button";
import { cn } from "@/lib/utils";

interface NewsletterProps {
  variant?: "inline" | "banner" | "footer";
  className?: string;
}

/**
 * Reusable "Join our mail list" signup used across landing pages.
 */
export function Newsletter({ variant = "banner", className }: NewsletterProps) {
  const [email, setEmail] = React.useState("");
  const { loading, run } = useAsyncAction(async () => {
    if (!email.trim()) return;
    await new Promise((r) => setTimeout(r, 700));
    toast.success("You're on the list.", { description: "We'll email you when the next Ferron edition ships." });
    setEmail("");
  });

  if (variant === "inline" || variant === "footer") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className={cn("flex w-full max-w-sm items-center gap-2", className)}
      >
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            required
            placeholder="you@work.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
          />
        </div>
        <LoadingButton type="submit" loading={loading} loadingText="Joining…">
          Join
        </LoadingButton>
      </form>
    );
  }

  return (
    <section className={cn("container-page pb-16", className)}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-8 md:p-12">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Ferron mail list
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Join our mail list — get money clarity in your inbox.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Product updates, new features, and quiet money habits — twice a month, never more.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run();
            }}
            className="flex w-full flex-col gap-2 sm:flex-row md:min-w-[360px]"
          >
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                required
                placeholder="you@work.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <LoadingButton type="submit" size="lg" loading={loading} loadingText="Joining…">
              Join list
            </LoadingButton>
          </form>
        </div>
      </div>
    </section>
  );
}
