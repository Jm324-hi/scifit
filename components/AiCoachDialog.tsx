"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Paywall } from "@/components/Paywall";
import type { AiContext } from "@/lib/ai-coach";
import { FREE_DAILY_AI_LIMIT } from "@/lib/subscription";

const TITLES: Record<AiContext, string> = {
  workout: "Exercise Coach",
  plan: "Plan Advisor",
  recovery: "Recovery Coach",
};

const QUICK_ACTIONS: Record<AiContext, string[]> = {
  workout: [
    "How to perform correctly?",
    "Common mistakes to avoid",
    "Suggest alternatives",
  ],
  plan: [
    "Change training frequency",
    "Adapt for different equipment",
    "Optimize for my goal",
  ],
  recovery: [
    "How to adjust today's workout?",
    "Recovery tips for today",
    "Should I train or rest?",
  ],
};

interface AiCoachDialogProps {
  context: AiContext;
  contextData: object;
  trigger: ReactNode;
  isPro?: boolean;
  onAction?: (action: string, data: unknown) => void;
}

export function AiCoachDialog({
  context,
  contextData,
  trigger,
  isPro = false,
  onAction,
}: AiCoachDialogProps) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const sendQuery = useCallback(
    async (userMessage?: string) => {
      if (streaming) return;

      setError(null);
      setResponse("");
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context,
            data: contextData,
            userMessage,
          }),
          signal: controller.signal,
        });

        if (res.status === 429) {
          setStreaming(false);
          setShowPaywall(true);
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          setError(errData?.error || "Something went wrong. Please try again.");
          setStreaming(false);
          return;
        }

        const countHeader = res.headers.get("X-AI-Usage-Count");
        if (countHeader) setUsageCount(parseInt(countHeader, 10));

        const reader = res.body?.getReader();
        if (!reader) {
          setError("Failed to read response stream.");
          setStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setResponse(accumulated);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Connection failed. Please check your network and try again.");
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [context, contextData, streaming],
  );

  function handleQuickAction(message: string) {
    void sendQuery(message);
    if (onAction) onAction(message, contextData);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customMessage.trim()) return;
    const msg = customMessage.trim();
    setCustomMessage("");
    void sendQuery(msg);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {TITLES[context]}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ACTIONS[context].map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="h-auto whitespace-normal py-1.5 text-xs"
                  onClick={() => handleQuickAction(action)}
                  disabled={streaming}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          <div
            ref={responseRef}
            className="min-h-[200px] flex-1 overflow-y-auto rounded-md border bg-muted/20 p-3"
          >
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {streaming && !response && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Thinking...
              </div>
            )}
            {response && (
              <div className="ai-response prose prose-sm max-w-none text-sm dark:prose-invert">
                <FormattedMarkdown text={response} />
              </div>
            )}
            {!streaming && !response && !error && (
              <p className="text-sm text-muted-foreground">
                Choose a quick action above or type your question below.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={streaming}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={streaming || !customMessage.trim()}>
              {streaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {isPro ? (
              <Badge variant="secondary" className="text-[10px]">
                Unlimited
              </Badge>
            ) : (
              <span>
                {usageCount != null
                  ? `${usageCount}/${FREE_DAILY_AI_LIMIT} queries today`
                  : `${FREE_DAILY_AI_LIMIT} queries/day`}
              </span>
            )}
            <span className="text-[10px]">Powered by AI</span>
          </div>
        </DialogContent>
      </Dialog>

      <Paywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature="unlimited_ai"
      />
    </>
  );
}

function FormattedMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("---") || line.startsWith("***")) {
      elements.push(<hr key={i} className="my-2 border-border" />);
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc">
          <InlineFormat text={line.slice(2)} />
        </li>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, "");
      elements.push(
        <li key={i} className="ml-4 list-decimal">
          <InlineFormat text={content} />
        </li>,
      );
      continue;
    }

    if (line.trim() === "") {
      elements.push(<br key={i} />);
      continue;
    }

    elements.push(
      <p key={i} className="mb-1 leading-relaxed">
        <InlineFormat text={line} />
      </p>,
    );
  }

  return <>{elements}</>;
}

function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
