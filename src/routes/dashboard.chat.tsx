import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { useChatThreads, useDeleteThread } from "@/lib/queries/chat";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/chat")({
  head: () => ({
    meta: [{ title: "AI Accountant — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const { data: threads } = useChatThreads();
  const del = useDeleteThread();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AppShell nav={USER_NAV} title="AI accountant" subtitle="Ask, and Ferron answers with your real numbers.">
      <div className="grid h-[calc(100vh-11rem)] gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="hidden min-h-0 flex-col rounded-2xl border border-border bg-card lg:flex">
          <div className="p-3">
            <Button
              className="w-full gap-2 rounded-full"
              onClick={() => void navigate({ to: "/dashboard/chat" })}
            >
              <Plus className="h-4 w-4" /> New chat
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {(threads ?? []).map((t) => {
              const active = pathname.endsWith(t.id);
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition",
                    active ? "bg-primary/10 text-primary" : "hover:bg-accent",
                  )}
                >
                  <Link
                    to="/dashboard/chat/$threadId"
                    params={{ threadId: t.id }}
                    className="min-w-0 flex-1 truncate"
                  >
                    {t.title}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Delete ${t.title}`}
                    className="opacity-0 transition group-hover:opacity-100"
                    onClick={() => {
                      void del.mutateAsync(t.id).then(() => {
                        if (active) void navigate({ to: "/dashboard/chat" });
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              );
            })}
            {(threads ?? []).length === 0 && (
              <p className="px-2 py-3 text-xs text-muted-foreground">No conversations yet.</p>
            )}
          </div>
        </aside>

        <div className="min-h-0 rounded-2xl border border-border bg-card/60">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}
