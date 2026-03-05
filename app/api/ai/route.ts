import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { incrementAiUsage, FREE_DAILY_AI_LIMIT, isPro } from "@/lib/subscription";
import {
  buildWorkoutPrompt,
  buildPlanPrompt,
  buildRecoveryPrompt,
  type AiContext,
  type WorkoutContextData,
  type PlanContextData,
  type RecoveryContextData,
} from "@/lib/ai-coach";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI service is not configured. Please contact support." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { context: AiContext; data: unknown; userMessage?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { context, data, userMessage } = body;
  if (!context || !data || !["workout", "plan", "recovery"].includes(context)) {
    return Response.json(
      { error: "Invalid context. Must be 'workout', 'plan', or 'recovery'." },
      { status: 400 },
    );
  }

  const usage = await incrementAiUsage(supabase, user.id);
  if (!usage.allowed) {
    const userPro = await isPro(supabase, user.id);
    return Response.json(
      {
        error: "Daily AI limit reached",
        remaining: 0,
        limit: userPro ? "unlimited" : FREE_DAILY_AI_LIMIT,
      },
      { status: 429 },
    );
  }

  let systemPrompt: string;
  let userMsg: string;

  try {
    switch (context) {
      case "workout": {
        const pair = buildWorkoutPrompt(data as WorkoutContextData, userMessage);
        systemPrompt = pair.systemPrompt;
        userMsg = pair.userMessage;
        break;
      }
      case "plan": {
        const pair = buildPlanPrompt(data as PlanContextData, userMessage);
        systemPrompt = pair.systemPrompt;
        userMsg = pair.userMessage;
        break;
      }
      case "recovery": {
        const pair = buildRecoveryPrompt(data as RecoveryContextData, userMessage);
        systemPrompt = pair.systemPrompt;
        userMsg = pair.userMessage;
        break;
      }
    }
  } catch {
    return Response.json(
      { error: "Failed to build AI prompt from the provided data." },
      { status: 400 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch {
          controller.error(new Error("Stream interrupted"));
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-AI-Usage-Count": String(usage.count),
      },
    });
  } catch (err) {
    const message =
      err instanceof OpenAI.APIError
        ? "AI service temporarily unavailable. Please try again later."
        : "An unexpected error occurred.";
    return Response.json({ error: message }, { status: 500 });
  }
}
