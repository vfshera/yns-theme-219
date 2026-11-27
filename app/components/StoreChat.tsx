import { useEffect, useRef, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";
import {
  ArrowUp,
  ChevronDown,
  Maximize2,
  MessageCircle,
  Minimize2,
} from "lucide-react";
import { cn } from "~/lib/utils";

type ChatConfig = {
  assistantName: string | null;
  greeting: string | null;
  suggestedQuestions: string[];
};

type ChatResult = { reply: string; error?: string };

type Message = { role: "user" | "assistant"; text: string };

/** Stub-backed floating chat widget; no AI SDK, product cards or markdown renderer. */
export function StoreChat() {
  const data = useRouteLoaderData("root") as
    | {
        info?: {
          storeChatEnabled?: boolean;
          chat?: ChatConfig | null;
          storeName?: string;
        };
      }
    | undefined;
  const enabled = data?.info?.storeChatEnabled ?? false;
  const config = data?.info?.chat ?? null;
  const storeName = data?.info?.storeName ?? "the store";

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const fetcher = useFetcher<ChatResult>();
  const handled = useRef<ChatResult | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const busy = fetcher.state !== "idle";

  useEffect(() => {
    const result = fetcher.data;
    if (!result || handled.current === result) {
      return;
    }

    handled.current = result;
    queueMicrotask(() =>
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: result.error
            ? "The assistant is unavailable right now."
            : result.reply,
        },
      ]),
    );
  }, [fetcher.data]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, open]);

  if (!enabled || !config) {
    return null;
  }

  const assistantName = config.assistantName ?? storeName;
  const greeting =
    config.greeting ??
    `Hi! I'm the ${storeName} assistant — what are you looking for?`;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) {
      return;
    }

    setMessages((previous) => [...previous, { role: "user", text: trimmed }]);
    setInput("");
    fetcher.submit({ message: trimmed }, { method: "post", action: "/chat" });
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label={`Chat with ${assistantName}`}
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-50 flex size-13 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle aria-hidden="true" className="size-5" />
        </button>
      )}
      <div
        role="dialog"
        aria-label={`Chat with ${assistantName}`}
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-background text-foreground shadow-2xl transition-[opacity,transform,visibility] duration-200 sm:inset-auto sm:right-4 sm:bottom-4 sm:rounded-2xl sm:border",
          expanded
            ? "sm:top-4 sm:w-[clamp(26rem,33.333vw,42rem)]"
            : "sm:h-[min(37.5rem,calc(100dvh-2rem))] sm:w-[25rem]",
          open
            ? "visible opacity-100"
            : "pointer-events-none invisible translate-y-4 opacity-0",
        )}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-border p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{assistantName}</p>
            <p className="truncate text-xs text-muted-foreground">
              Ask us about products, shipping or returns
            </p>
          </div>
          <button
            type="button"
            aria-label={expanded ? "Restore chat" : "Maximize chat"}
            onClick={() => setExpanded((value) => !value)}
            className="hidden size-8 items-center justify-center rounded-md hover:bg-muted sm:flex"
          >
            {expanded ? (
              <Minimize2 aria-hidden="true" className="size-4" />
            ) : (
              <Maximize2 aria-hidden="true" className="size-4" />
            )}
          </button>
          <button
            type="button"
            aria-label="Minimize chat"
            onClick={() => setOpen(false)}
            className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </button>
        </header>
        <div
          ref={listRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
        >
          <div className="mr-8 self-start rounded-2xl rounded-bl-md border bg-muted/40 px-3 py-2 text-sm">
            {greeting}
          </div>
          {messages.length === 0 && config.suggestedQuestions.length > 0 && (
            <div className="ml-8 flex flex-wrap justify-end gap-2">
              {config.suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => send(question)}
                  className="rounded-full border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={cn(
                "max-w-[85%] whitespace-pre-wrap px-3 py-2 text-sm",
                message.role === "user"
                  ? "ml-8 self-end rounded-2xl rounded-br-md bg-foreground text-background"
                  : "mr-8 self-start rounded-2xl rounded-bl-md border bg-muted/40",
              )}
            >
              {message.text}
            </div>
          ))}
          {busy && (
            <div className="mr-8 self-start rounded-2xl rounded-bl-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Thinking…
            </div>
          )}
        </div>
        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-2xl border bg-background p-2">
            <textarea
              rows={1}
              maxLength={2000}
              value={input}
              aria-label="Ask about our products"
              placeholder="Ask about our products…"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none"
            />
            <button
              type="button"
              aria-label="Send message"
              disabled={busy || input.trim().length === 0}
              onClick={() => send(input)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-50"
            >
              <ArrowUp aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
