import { Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Guest-mode AI chat teaser. When user is signed in, this becomes the
// full accountant chat page (rendered by a later phase).
export function GuestChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Hi! I'm the Ferron accountant preview. Ask me anything about tracking, budgeting or how the app works.",
    },
  ]);

  function send() {
    const value = input.trim();
    if (!value) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: value },
      {
        role: "ai",
        text: "Great question. Sign up to unlock the full accountant — it can create transactions, set rules and answer with your real numbers.",
      },
    ]);
    setInput("");
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2rem))] origin-bottom-right transition-all duration-300",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
        role="dialog"
        aria-label="Ferron AI preview"
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Ferron Accountant</p>
                <p className="text-xs text-muted-foreground">Preview mode</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted text-foreground",
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Ferron…"
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <Button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI accountant"
        className={cn(
          "fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full shadow-xl transition-transform hover:scale-105",
          open && "pointer-events-none opacity-0",
        )}
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    </>
  );
}
