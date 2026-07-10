import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { FEEDBACK, type FeedbackItem } from "@/lib/mock/app";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminFeedbackPage,
});

const EXTENDED: FeedbackItem[] = Array.from({ length: 80 }).flatMap((_, i) =>
  FEEDBACK.map((f) => ({ ...f, id: `${f.id}-${i}`, subject: `${f.subject} #${i + 1}` })),
);

const PAGE_SIZE = 20;

function AdminFeedbackPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? EXTENDED.filter((f) => f.subject.toLowerCase().includes(needle) || f.from.toLowerCase().includes(needle) || f.body.toLowerCase().includes(needle))
      : EXTENDED;
  }, [q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell nav={ADMIN_NAV} title="Feedback" subtitle={`${filtered.length.toLocaleString()} messages · Page ${page} of ${pages}`}>
      <SectionCard
        title="Inbox"
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subject, sender, body…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="h-8 w-72 pl-8"
            />
          </div>
        }
      >
        <div className="max-h-[65vh] divide-y divide-border overflow-auto rounded-md border border-border">
          {paged.map((f) => (
            <div key={f.id} className="p-4 hover:bg-accent/30">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{f.subject}</p>
                    <Badge variant={f.status === "new" ? "default" : f.status === "closed" ? "secondary" : "outline"}>
                      {f.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">From {f.from} · {formatDate(f.submittedAt)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/90">{f.body}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button size="sm" variant="outline">Reply</Button>
                  <Button size="sm" variant="ghost">Close</Button>
                </div>
              </div>
            </div>
          ))}
          {paged.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No messages match your search.</div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Prev
            </Button>
            <span className="text-xs tabular-nums">{page} / {pages}</span>
            <Button size="sm" variant="outline" disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
