"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden pt-24">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="container-x flex flex-col items-start gap-8">
        <p className="eyebrow">{error.digest ?? "runtime error"}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          {t("title")}{" "}
          <span className="font-serif font-normal italic text-accent">{t("titleAccent")}</span>
        </h1>
        <p className="max-w-md text-lg text-muted">{t("body")}</p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={reset}>
            {t("retry")}
          </Button>
          <ButtonLink href="/" size="lg" variant="secondary">
            {t("home")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
