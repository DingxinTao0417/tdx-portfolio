"use client";

import { Check, ChevronDown, Loader2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { contactTopics } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; delivered: boolean; name: string }
  | { state: "error"; kind: "rate_limited" | "generic" };

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const inputClass =
  "w-full min-w-0 rounded-[10px] border border-line bg-bg/55 px-3.5 py-3 text-[15px] text-fg placeholder:text-muted/60 transition-[border-color,box-shadow,background-color] hover:border-line-strong focus:border-accent focus:bg-bg-elevated focus:outline-none focus:ring-3 focus:ring-accent/10 aria-[invalid=true]:border-red-500";

export function ContactForm() {
  const t = useTranslations("Contact.form");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      topic: String(fd.get("topic") ?? "other"),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
      locale,
    };

    // Client-side validation mirrors the server schema for instant feedback.
    const next: FieldErrors = {};
    if (!payload.name.trim()) next.name = t("validation.name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) next.email = t("validation.email");
    if (payload.message.trim().length < 20) next.message = t("validation.message");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) {
        setStatus({ state: "error", kind: "rate_limited" });
        return;
      }
      const json = (await res.json()) as { ok: boolean; delivered?: boolean };
      if (!res.ok || !json.ok) throw new Error("failed");
      setStatus({ state: "success", delivered: Boolean(json.delivered), name: payload.name.trim() });
      form.reset();
    } catch {
      setStatus({ state: "error", kind: "generic" });
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status.state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex min-h-80 flex-col items-start justify-center gap-5 py-4"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
              <Check className="h-6 w-6" />
            </span>
            <h3 className="font-display text-2xl font-semibold tracking-tight">{t("successTitle")}</h3>
            <p className="text-muted">
              {status.delivered
                ? t("successBody", { name: status.name })
                : t("successBodyNoDelivery", { name: status.name })}
            </p>
            <Button variant="secondary" size="sm" onClick={() => setStatus({ state: "idle" })}>
              {t("sendAnother")}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("name")} error={errors.name} htmlFor="name">
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  aria-invalid={!!errors.name}
                  className={inputClass}
                />
              </Field>
              <Field label={t("email")} error={errors.email} htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={!!errors.email}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("company")} htmlFor="company">
                <input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  placeholder={t("companyPlaceholder")}
                  className={inputClass}
                />
              </Field>
              <Field label={t("topic")} htmlFor="topic">
                <div className="relative">
                  <select id="topic" name="topic" defaultValue="fde" className={cn(inputClass, "appearance-none pr-10")}>
                    {contactTopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {t(`topics.${topic}`)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                </div>
              </Field>
            </div>

            <Field label={t("message")} error={errors.message} htmlFor="message">
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder={t("messagePlaceholder")}
                aria-invalid={!!errors.message}
                className={cn(inputClass, "resize-y")}
              />
            </Field>

            {/* Honeypot */}
            <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden>
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {status.state === "error" && (
              <p role="alert" className="rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                <strong className="font-semibold">{t("errorTitle")}</strong>{" "}
                {status.kind === "rate_limited" ? t("rateLimited") : t("errorBody")}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status.state === "submitting"}>
                {status.state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("submit")}
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg/85">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
