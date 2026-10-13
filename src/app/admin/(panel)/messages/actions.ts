"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";

const id = z.uuid();
const status = z.enum(["new", "read", "archived"]);

export async function setMessageStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = z.object({ id, status }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  await supabase.from("messages").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return;
  await supabase.from("messages").delete().eq("id", parsed.data);
  revalidatePath("/admin", "layout");
}
