import { createFileRoute } from "@tanstack/react-router";
import { Heart, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — Ferron" },
      {
        name: "description",
        content:
          "We love your feedback. Tell the Ferron team what to build, fix or celebrate.",
      },
      { property: "og:title", content: "Feedback — Ferron" },
      { property: "og:url", content: "/feedback" },
    ],
    links: [{ rel: "canonical", href: "/feedback" }],
  }),
  component: FeedbackPage,
});

const KINDS = ["Bug", "Idea", "Praise", "Question"] as const;

function FeedbackPage() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Idea");
  const [loading, setLoading] = useState(false);

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Heart className="h-3.5 w-3.5" /> We love feedback
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Tell us what to build next.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Every message reaches a human on the Ferron team — usually within a
            day. Bugs, ideas, praise, complaints: they all count.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              "Bug reports go straight to engineering.",
              "Feature ideas are triaged weekly by product.",
              "Praise is shared in company all-hands (it fuels us).",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            const form = e.currentTarget;
            setTimeout(() => {
              setLoading(false);
              toast.success("Thanks — we got it.", {
                description: "The Ferron team will get back to you shortly.",
              });
              form.reset();
            }, 700);
          }}
          className="rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          <div className="mb-4">
            <label className="text-sm font-medium">Kind of feedback</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    kind === k
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Name</span>
              <input
                required
                maxLength={80}
                name="name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Email</span>
              <input
                required
                type="email"
                maxLength={255}
                name="email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium">Message</span>
            <textarea
              required
              rows={5}
              maxLength={1500}
              name="message"
              placeholder="What's on your mind?"
              className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              We reply within 24 hours on business days.
            </p>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send feedback"}
              <Send className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
