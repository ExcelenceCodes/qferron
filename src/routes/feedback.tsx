import { createFileRoute } from "@tanstack/react-router";
import { Bug, Heart, Lightbulb, MessageCircle, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton, useAsyncAction } from "@/components/ui/loading-button";
import { Newsletter } from "@/components/marketing/newsletter";
import lovedCommunity from "@/assets/vectors/loved-community.png.asset.json";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — Ferron" },
      { name: "description", content: "We love your feedback. Tell the Ferron team what to build, fix or celebrate." },
      { property: "og:title", content: "Feedback — Ferron" },
      { property: "og:url", content: "/feedback" },
    ],
    links: [{ rel: "canonical", href: "/feedback" }],
  }),
  component: FeedbackPage,
});

const KINDS = ["Bug", "Idea", "Praise", "Question"] as const;

const TESTIMONIALS = [
  { quote: "Ferron replaced my four spreadsheets in one afternoon.", who: "Amina · Nairobi" },
  { quote: "Finally an AI accountant that actually understands my mobile money.", who: "Diego · Mexico City" },
  { quote: "The shared account feature saved my marriage's Sunday budget talks.", who: "Priya · Bangalore" },
];

function FeedbackPage() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Idea");
  const [formEl, setFormEl] = useState<HTMLFormElement | null>(null);
  const { loading, run } = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Thanks — we got it.", { description: "The Ferron team will get back to you shortly." });
    formEl?.reset();
  });

  return (
    <>
      {/* HERO */}
      <section className="container-page pt-16 pb-8 md:pt-20 md:pb-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Heart className="h-3.5 w-3.5" /> We love feedback
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">Tell us what to build next.</h1>
            <p className="mt-4 text-muted-foreground">
              Every message reaches a human on the Ferron team — usually within a day.
              Bugs, ideas, praise, complaints: they all count.
            </p>
          </div>
          <img src={lovedCommunity.url} alt="" className="w-full rounded-2xl" />
        </div>
      </section>

      {/* FORM + PILLARS */}
      <section className="container-page pb-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">How we route feedback</h2>
            <ul className="mt-6 space-y-4 text-sm">
              {[
                { i: Bug, t: "Bug reports go straight to engineering." },
                { i: Lightbulb, t: "Feature ideas are triaged weekly by product." },
                { i: Sparkles, t: "Praise is shared in company all-hands — it fuels us." },
                { i: MessageCircle, t: "Every reply is written by a human, never a script." },
              ].map((l) => (
                <li key={l.t} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <l.i className="h-4 w-4" />
                  </span>
                  <span className="pt-1">{l.t}</span>
                </li>
              ))}
            </ul>
          </div>

          <form
            ref={setFormEl}
            onSubmit={(e) => {
              e.preventDefault();
              run();
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
                <input required maxLength={80} name="name" className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Email</span>
                <input required type="email" maxLength={255} name="email" className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block font-medium">Message</span>
              <textarea required rows={5} maxLength={1500} name="message" placeholder="What's on your mind?" className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">We reply within 24 hours on business days.</p>
              <LoadingButton type="submit" loading={loading} loadingText="Sending…">
                Send feedback <Send className="ml-1 h-4 w-4" />
              </LoadingButton>
            </div>
          </form>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page pb-16">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight md:text-3xl">From the community</h2>
        <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.who} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
              <footer className="mt-3 text-xs text-muted-foreground">— {t.who}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
