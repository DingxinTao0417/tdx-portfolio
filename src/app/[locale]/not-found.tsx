import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden pt-24">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="container-x flex flex-col items-start gap-8">
        <p className="font-display text-[clamp(6rem,22vw,16rem)] font-bold leading-none tracking-[-0.06em] text-accent/20">
          {t("code")}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          {t("title")}{" "}
          <span className="font-serif font-normal italic text-accent">{t("titleAccent")}</span>
        </h1>
        <p className="max-w-md text-lg text-muted">{t("body")}</p>
        <ButtonLink href="/" size="lg" arrow>
          {t("cta")}
        </ButtonLink>
      </div>
    </section>
  );
}
