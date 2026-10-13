import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { aiConfigured, completeJson, META_PROMPT, polishPrompt, splitSections, streamCompletion, translatePrompt } from "@/lib/ai-writing";
import { AI_SETTINGS_KEY, resolveAiSettings } from "@/lib/ai-settings";
import { getAdminState } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

const language = z.enum(["zh", "en"]);
const schema = z.discriminatedUnion("task", [
  z.object({ task: z.literal("translate"), from: language, to: language, text: z.string().min(1).max(200_000) }),
  z.object({ task: z.literal("polish"), language, text: z.string().min(1).max(200_000) }),
  z.object({
    task: z.literal("translate-meta"),
    from: language,
    to: language,
    meta: z.object({ title: z.string().max(300), description: z.string().max(600), coverAlt: z.string().max(400), tags: z.array(z.string().max(40)).max(8) }),
  }),
]);

const metaResult = z.object({
  title: z.string().max(400),
  description: z.string().max(900).catch(""),
  coverAlt: z.string().max(600).catch(""),
  tags: z.array(z.string().max(60)).max(8).catch([]),
});

/**
 * POST /admin/api/ai — translation and polishing for the post editor (admins only). Body text is
 * processed section by section and streamed back as plain text; metadata comes back as JSON.
 */
export async function POST(request: NextRequest) {
  const state = await getAdminState();
  if (state.status !== "admin") return NextResponse.json({ error: "未登录或没有权限。" }, { status: 401 });
  if (!aiConfigured()) return NextResponse.json({ error: "还没有配置 DEEPSEEK_API_KEY 环境变量。" }, { status: 503 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "请求内容不正确。" }, { status: 400 });
  const input = parsed.data;
  const stored = await state.supabase.from("site_data").select("value").eq("key", AI_SETTINGS_KEY).maybeSingle();
  const settings = resolveAiSettings(stored.data?.value);

  if (input.task === "translate-meta") {
    try {
      const result = metaResult.parse(await completeJson(settings, META_PROMPT(input.from, input.to), JSON.stringify(input.meta), request.signal));
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "翻译失败。" }, { status: 502 });
    }
  }

  const system = input.task === "translate" ? translatePrompt(input.from, input.to) : polishPrompt(input.language);
  const chunks = splitSections(input.text.replace(/\r\n/g, "\n"), settings.chunkChars);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let index = 0; index < chunks.length; index++) {
          let tail = "";
          await streamCompletion(settings, system, chunks[index], (text) => {
            tail = (tail + text).slice(-2);
            controller.enqueue(encoder.encode(text));
          }, request.signal);
          // Sections were split before headings; rejoin them with exactly one blank line.
          if (index < chunks.length - 1) {
            controller.enqueue(encoder.encode(tail.endsWith("\n\n") ? "" : tail.endsWith("\n") ? "\n" : "\n\n"));
          }
        }
        controller.close();
      } catch (error) {
        // The client treats this marker as a failure and keeps the original text.
        controller.enqueue(encoder.encode(`\n\u0000ERROR:${error instanceof Error ? error.message : "生成失败。"}`));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
