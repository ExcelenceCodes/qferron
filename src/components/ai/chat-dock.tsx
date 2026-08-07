import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageSquarePlus, Maximize2, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidePanel } from "@/components/ui/side-panel";
import { FerronChat } from "@/components/ai/ferron-chat";
import { useChatThreads } from "@/lib/queries/chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Floating Ferron dock — continue or start a conversation from any page.
 */
export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>();
  const { data: threads } = useChatThreads();
  const navigate = useNavigate();

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        aria-label="Ask Ferron"
        className="fixed bottom-6 right-6 z-30 h-12 gap-2 rounded-full pl-4 pr-5 shadow-xl shadow-primary/25"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span className="hidden sm:inline">Ask Ferron</span>
      </Button>

      <SidePanel
        open={open}
        onOpenChange={setOpen}
        title="Ferron"
        description="Your AI accountant, everywhere you work."
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setThreadId(undefined)}
            >
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
                <DropdownMenuLabel>Recent conversations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(threads ?? []).map((t) => (
                  <DropdownMenuItem key={t.id} onSelect={() => setThreadId(t.id)}>
                    <span className="truncate">{t.title}</span>
                  </DropdownMenuItem>
                ))}
                {(threads ?? []).length === 0 && (
                  <DropdownMenuItem disabled>No conversations yet</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setOpen(false);
                void navigate({
                  to: threadId ? "/dashboard/chat/$threadId" : "/dashboard/chat",
                  ...(threadId ? { params: { threadId } } : {}),
                });
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" /> Open full page
            </Button>
          </div>
          <FerronChat
            key={threadId ?? "new"}
            threadId={threadId}
            onThreadCreated={setThreadId}
            compact
          />
        </div>
      </SidePanel>
    </>
  );
}
