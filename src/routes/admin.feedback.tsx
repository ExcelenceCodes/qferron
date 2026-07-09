import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { FEEDBACK } from "@/lib/mock/app";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminFeedbackPage,
});

function AdminFeedbackPage() {
  return (
    <AppShell nav={ADMIN_NAV} title="Feedback" subtitle="User feedback, triage and replies.">
      <SectionCard title="Inbox">
        <ul className="divide-y divide-border">
          {FEEDBACK.map((f) => (
            <li key={f.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{f.subject}</p>
                    <Badge variant={f.status === "new" ? "default" : f.status === "closed" ? "secondary" : "outline"}>
                      {f.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    From {f.from} · {formatDate(f.submittedAt)}
                  </p>
                  <p className="mt-2 text-sm text-foreground/90">{f.body}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline">Reply</Button>
                  <Button size="sm" variant="ghost">Close</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </AppShell>
  );
}
