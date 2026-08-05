import { createFileRoute } from "@tanstack/react-router";
import { Bell, Bot, Check, ChevronRight, Coins, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
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
import { formatDate } from "@/lib/format";
import {
  useClearNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotifications,
  useSetNotificationRead,
  type NotificationCategory,
} from "@/lib/queries/platform";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — Ferron" }, { name: "robots", content: "noindex" }],
  }),
  component: NotificationsPage,
});

const CATEGORIES: { key: NotificationCategory; label: string; icon: typeof Bell }[] = [
  { key: "money", label: "Money", icon: Coins },
  { key: "shared", label: "Shared accounts", icon: Share2 },
  { key: "ai", label: "AI accountant", icon: Bot },
  { key: "system", label: "System", icon: Bell },
];

function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const setRead = useSetNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();
  const clearAll = useClearNotifications();
  const [confirmClear, setConfirmClear] = useState(false);

  const items = data ?? [];
  const unread = items.filter((n) => !n.read_at).length;
  const grouped = CATEGORIES.map((c) => ({
    ...c,
    entries: items.filter((n) => n.category === c.key),
  })).filter((g) => g.entries.length > 0);

  return (
    <AppShell
      nav={USER_NAV}
      title="Notifications"
      subtitle="Money events, shared account changes, and AI signals."
      headerRight={
        <div className="flex items-center gap-2">
          <Badge>{unread} unread</Badge>
          <Button
            size="sm"
            variant="outline"
            disabled={unread === 0 || markAll.isPending}
            onClick={() =>
              markAll.mutate(undefined, {
                onSuccess: () => toast.success("All marked read"),
                onError: (e) => toast.error(e.message),
              })
            }
          >
            Mark all read
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={items.length === 0}
            onClick={() => setConfirmClear(true)}
          >
            Clear all
          </Button>
        </div>
      }
    >
      <SectionCard title="All notifications">
        {isLoading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Money events, shared account activity and AI insights will land here."
          />
        ) : (
          <div className="space-y-3">
            {grouped.map((g) => (
              <Collapsible key={g.key} defaultOpen>
                <CollapsibleTrigger asChild>
                  <button className="group flex w-full items-center justify-between rounded-lg border border-border bg-background/60 px-4 py-3 text-left hover:bg-accent/40">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                      <g.icon className="h-4 w-4 text-primary" />
                      {g.label}
                      <Badge variant="secondary">{g.entries.length}</Badge>
                    </span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-2 space-y-2 pl-6">
                    {g.entries.map((n) => {
                      const read = !!n.read_at;
                      return (
                        <li
                          key={n.id}
                          className={`group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors ${
                            read ? "bg-background/40" : "bg-primary/5"
                          }`}
                        >
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                              read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                            }`}
                          >
                            <g.icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            {n.body && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                            )}
                            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                              {formatDate(n.created_at)}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={read ? "Mark unread" : "Mark read"}
                              onClick={() => setRead.mutate({ id: n.id, read: !read })}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete"
                              onClick={() =>
                                remove.mutate(n.id, {
                                  onSuccess: () => toast.success("Notification deleted"),
                                  onError: (e) => toast.error(e.message),
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </SectionCard>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                clearAll.mutate(undefined, {
                  onSuccess: () => toast.success("Notifications cleared"),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
