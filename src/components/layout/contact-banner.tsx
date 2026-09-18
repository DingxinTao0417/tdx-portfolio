import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./contact-banner.module.css";

export async function ContactBanner() {
  const t = await getTranslations("Footer");
  return (
    <section className={styles.banner} aria-labelledby="contact-banner-title" data-contact-banner>
      <div className={styles.artwork}>
        <Image src="/images/contact/collaboration.webp" alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
      </div>
      <div className={styles.content}>
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-white/55">{t("bannerEyebrow")}</p>
        <h2 id="contact-banner-title" className="mt-5 font-display text-2xl font-medium leading-[1.3] tracking-tight sm:text-3xl lg:text-[2.5rem]">
          {t("tagline")}<br /><span className="font-serif font-normal italic text-[#ff9b64]">{t("taglineAccent")}</span>
        </h2>
        <p className="mt-4 max-w-sm text-[13px] leading-7 text-white/70">{t("bannerBody")}</p>
        <Link href="/contact" className={styles.button}>{t("cta")}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
