import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NOTIFICATIONS, type AppNotification } from "@/lib/mock/notifications";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

const CATEGORY_LABEL: Record<AppNotification["category"], string> = {
  money: "Money",
  shared: "Shared accounts",
  ai: "AI accountant",
  system: "System",
};

function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const [confirmClear, setConfirmClear] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  const grouped = (["money", "shared", "ai", "system"] as const).map((cat) => ({
    category: cat,
    entries: items.filter((n) => n.category === cat),
  })).filter((g) => g.entries.length > 0);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggleRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  const remove = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <AppShell
      nav={USER_NAV}
      title="Notifications"
      subtitle="Money events, shared account changes, and AI signals."
      headerRight={
        <div className="flex items-center gap-2">
          <Badge>{unread} unread</Badge>
          <Button size="sm" variant="outline" onClick={markAllRead}>Mark all read</Button>
          <Button size="sm" variant="outline" onClick={() => setConfirmClear(true)}>Clear all</Button>
        </div>
      }
    >
      <SectionCard title="All notifications">
        <div className="space-y-3">
          {grouped.map((g) => (
            <Collapsible key={g.category} defaultOpen>
              <CollapsibleTrigger asChild>
                <button className="group flex w-full items-center justify-between rounded-lg border border-border bg-background/60 px-4 py-3 text-left hover:bg-accent/40">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                    {CATEGORY_LABEL[g.category]}
                    <Badge variant="secondary">{g.entries.length}</Badge>
                  </span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-2 space-y-2 pl-6">
                  {g.entries.map((n) => (
                    <li
                      key={n.id}
                      className={`group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors ${
                        n.read ? "bg-background/40" : "bg-primary/5"
                      }`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                        <n.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{formatDate(n.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={n.read ? "Mark unread" : "Mark read"}
                          onClick={() => toggleRead(n.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => remove(n.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
          {items.length === 0 && (
            <div className="grid place-items-center rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              You're all caught up.
            </div>
          )}
        </div>
      </SectionCard>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setItems([]); toast.success("Notifications cleared"); }}>Clear all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
