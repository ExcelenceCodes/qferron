import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, ChevronDown, Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { askFerron } from "@/lib/ai.functions";
import { useAuth } from "@/lib/auth";
import {
  useAppendMessages,
  useChatMessages,
  useCreateThread,
  useUpdateThread,
} from "@/lib/queries/chat";
import { cn } from "@/lib/utils";

export const PERSONAS = [
  { id: "Analin", name: "Analin", img: "/media/accountants/analin.jpg", style: "Warm & guiding" },
  { id: "Sage", name: "Sage", img: "/media/accountants/sage.jpg", style: "Analytical" },
  { id: "Atlas", name: "Atlas", img: "/media/accountants/atlas.jpg", style: "Concise executive" },
];

const SUGGESTIONS = [
  "Summarise my spending this month",
  "Where can I cut costs?",
  "Which debt should I clear first?",
  "How is my net worth trending?",
];

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface FerronChatProps {
  /** Existing thread to continue. When absent, the first message creates one. */
  threadId?: string;
  onThreadCreated?: (id: string) => void;
  /** Compact mode is used inside the side dock. */
  compact?: boolean;
  header?: React.ReactNode;
  seedPrompt?: string;
}

export function FerronChat({
  threadId,
  onThreadCreated,
  compact = false,
  header,
  seedPrompt,
}: FerronChatProps) {
  const { profile } = useAuth();
  const { data: history, isLoading } = useChatMessages(threadId);
  const createThread = useCreateThread();
  const updateThread = useUpdateThread();
  const append = useAppendMessages();
  const ask = useServerFn(askFerron);

  const [persona, setPersona] = useState(PERSONAS[0]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [local, setLocal] = useState<ChatMsg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const persisted: ChatMsg[] = useMemo(
    () => (history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    [history],
  );
  const messages = threadId ? [...persisted, ...local] : local;

  useEffect(() => {
    setLocal([]);
  }, [threadId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pending]);

  useEffect(() => {
    if (!pending) taRef.current?.focus();
  }, [pending, threadId]);

  useEffect(() => {
    if (seedPrompt) setInput(seedPrompt);
  }, [seedPrompt]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || pending) return;
    setInput("");
    setPending(true);
    const outgoing: ChatMsg[] = [...messages, { role: "user", content: clean }];
    setLocal((l) => [...l, { role: "user", content: clean }]);

    let tid = threadId;
    try {
      if (!tid) {
        const created = await createThread.mutateAsync({
          title: clean.slice(0, 60),
          persona: persona.name,
        });
        if (!created) throw new Error("Could not start a conversation");
        tid = created.id;
        onThreadCreated?.(created.id);
      }

      const res = await ask({ data: { persona: persona.name, messages: outgoing.slice(-20) } });
      setLocal((l) => [...l, { role: "assistant", content: res.reply }]);

      await append.mutateAsync({
        thread_id: tid!,
        messages: [
          { role: "user", content: clean },
          { role: "assistant", content: res.reply },
        ],
      });
      if (threadId) await updateThread.mutateAsync({ id: threadId, persona: persona.name });
      setLocal([]);
    } catch (err) {
      toast.error((err as Error).message || "Ferron couldn't answer right now");
      setLocal((l) => l.filter((m) => m.content !== clean));
    } finally {
      setPending(false);
    }
  }

  const greetingName = (profile?.full_name ?? "").split(" ")[0] || "there";
  const empty = messages.length === 0 && !isLoading;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        {header}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto gap-2 rounded-full">
              <img src={persona.img} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span className="text-sm font-medium">{persona.name}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PERSONAS.map((p) => (
              <DropdownMenuItem key={p.id} onSelect={() => setPersona(p)} className="gap-2">
                <img src={p.img} alt="" className="h-7 w-7 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.style}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* transcript */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <div className={cn("mx-auto w-full py-6", compact ? "max-w-full" : "max-w-3xl")}>
          {empty ? (
            <div className="flex flex-col items-start gap-6 pt-8">
              <h2
                className={cn(
                  "bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text font-display font-semibold text-transparent",
                  compact ? "text-2xl" : "text-4xl sm:text-5xl",
                )}
              >
                Hello, {greetingName}
              </h2>
              <p className="text-muted-foreground">
                I'm {persona.name}. I can see your accounts, transactions, debts and investments.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:border-primary/50 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m, i) => (
                <Message key={i} from={m.role}>
                  {m.role === "assistant" ? (
                    <div className="flex w-full gap-3">
                      <img
                        src={persona.img}
                        alt=""
                        className="mt-1 h-7 w-7 shrink-0 rounded-full object-cover"
                      />
                      <MessageContent className="bg-transparent p-0 text-foreground">
                        <MessageResponse>{m.content}</MessageResponse>
                      </MessageContent>
                    </div>
                  ) : (
                    <MessageContent className="rounded-3xl bg-primary px-4 py-2.5 text-primary-foreground">
                      {m.content}
                    </MessageContent>
                  )}
                </Message>
              ))}
              {pending && (
                <div className="flex items-center gap-3 pl-1">
                  <img src={persona.img} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <Shimmer className="text-sm">{`${persona.name} is thinking…`}</Shimmer>
                </div>
              )}
            </div>
          )}
          <div ref={endRef} className="h-2" />
        </div>
      </div>

      {/* composer — sits low, Gemini style */}
      <div className="shrink-0 px-4 pb-6 pt-2 sm:pb-8">
        <form
          className={cn("mx-auto w-full", compact ? "max-w-full" : "max-w-3xl")}
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <div className="flex items-end gap-2 rounded-[28px] border border-border bg-card px-4 py-2.5 shadow-lg shadow-black/5 transition focus-within:border-primary/50 focus-within:shadow-primary/10">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={`Ask ${persona.name} about your money…`}
              className="max-h-44 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              aria-label="Send"
              disabled={pending || !input.trim()}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : input.trim() ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Ferron uses your real records. Double-check anything important.
          </p>
        </form>
      </div>
    </div>
  );
}
