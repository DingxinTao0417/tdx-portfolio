"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { AI_SETTINGS_KEY, aiSettingsSchema } from "@/lib/ai-settings";
import { requireAdmin } from "@/lib/supabase/admin";
import { AI_USAGE_KEY, aiUsageSchema, SITE_DATA_TAG } from "@/lib/site-data";

export type SaveState = { ok: boolean; message: string } | null;

export async function saveAIUsage(_: SaveState, formData: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("entries") ?? ""));
  } catch {
    return { ok: false, message: "数据格式不正确。" };
  }
  const parsed = aiUsageSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "请检查每一行：名称不能为空，标识只能用小写字母、数字和连字符且不能重复，用量必须是非负整数。" };

  const { error } = await supabase.from("site_data").upsert({ key: AI_USAGE_KEY, value: parsed.data });
  if (error) return { ok: false, message: `保存失败：${error.message}` };

  revalidateTag(SITE_DATA_TAG, "max");
  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/data");
  return { ok: true, message: "已保存，首页会在下次访问时更新。" };
}

export async function saveAiSettings(_: SaveState, formData: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();
  const parsed = aiSettingsSchema.safeParse({
    model: formData.get("model"),
    chunkChars: Number(formData.get("chunkChars")),
    maxTokens: Number(formData.get("maxTokens")),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues.map((issue) => issue.message).join("；") };
  const { error } = await supabase.from("site_data").upsert({ key: AI_SETTINGS_KEY, value: parsed.data });
  if (error) return { ok: false, message: `保存失败：${error.message}` };
  revalidatePath("/admin/data");
  return { ok: true, message: "已保存，下一次翻译或润色就会使用新设置。" };
}
