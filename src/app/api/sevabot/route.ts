import { NextRequest, NextResponse } from "next/server";
import { SEVABOT_SYSTEM_PROMPT } from "@/lib/sevabotPrompt";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";

type InputMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEMO_FALLBACK =
  "Bilkul! Main SevaBot hoon. Aap service dhoondhna chahte hain ya apna business list karna? Locality batayenge to main better guide karunga. Kya main aur kuch madad kar sakta hoon?";

const MAX_MESSAGES = 10;
const MAX_CONTENT_LENGTH = 500;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request.headers);
    const limitResult = checkRateLimit(`sevabot:${ip}`, RATE_LIMITS.SEVABOT.max, RATE_LIMITS.SEVABOT.windowMs);
    if (!limitResult.allowed) {
      return NextResponse.json({ reply: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const body = (await request.json()) as { messages?: InputMessage[] };

    // Input sanitization
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ reply: "Aapko kaunsi service chahiye? Locality bhi batayein." }, { status: 400 });
    }

    const sanitizedMessages = body.messages
      .slice(-MAX_MESSAGES)
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" as const : "user" as const,
        content: typeof msg.content === "string" ? msg.content.slice(0, MAX_CONTENT_LENGTH) : "",
      }))
      .filter((msg) => msg.content.length > 0);

    if (sanitizedMessages.length === 0) {
      return NextResponse.json({ reply: "Aapko kaunsi service chahiye? Locality bhi batayein." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: DEMO_FALLBACK });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.35,
        max_tokens: 500,
        messages: [
          { role: "system", content: SEVABOT_SYSTEM_PROMPT },
          ...sanitizedMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        ],
      }),
    });

    if (!response.ok) {
      // Do NOT expose raw API errors to the client
      return NextResponse.json({ reply: DEMO_FALLBACK }, { status: 200 });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ reply: content || DEMO_FALLBACK });
  } catch {
    return NextResponse.json({ reply: DEMO_FALLBACK }, { status: 200 });
  }
}
