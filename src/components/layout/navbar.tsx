"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    const next = v > 24;
    if (next !== scrolled) setScrolled(next);
  });

  // Close the mobile menu on navigation and lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const menuId = "mobile-menu";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[padding] duration-500",
          scrolled ? "pt-2 sm:pt-3" : "pt-4 sm:pt-6",
        )}
      >
        <div className="container-x">
          <nav
            aria-label="Primary"
            className={cn(
              "relative flex h-16 items-center justify-between rounded-full px-3 pl-4 transition-all duration-500 sm:px-4 sm:pl-5",
              scrolled ? "glass shadow-soft border border-line" : "border border-transparent",
            )}
          >
            {/* Brand */}
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label={`${site.name} — ${t("home")}`}
              onClick={() => setOpen(false)}
            >
              <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-fg font-display text-sm font-bold text-bg transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                {site.initials}
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-bg transition-transform duration-300 group-hover:scale-125" />
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="font-display text-[15px] font-semibold tracking-tight">
                  {locale === "zh" ? site.nameZh : site.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {locale === "zh" ? site.name : site.nameZh} · AI / FDE
                </span>
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.key} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative z-10 inline-flex h-9 items-center rounded-full px-3.5 text-[14px] font-medium tracking-tight transition-colors",
                        active ? "text-white" : "text-fg/80 hover:text-fg",
                      )}
                    >
                      {t(item.key)}
                    </Link>
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              <LocaleSwitcher label={t("switchLocale")} className="hidden sm:flex" />
              <ThemeToggle label={t("toggleTheme")} />
              {/* Hidden between lg and xl: the centred link row would collide with it there. */}
              <div className="hidden md:block lg:hidden xl:block">
                <ButtonLink href="/contact" size="sm" arrow>
                  {t("cta")}
                </ButtonLink>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-fg transition-colors hover:border-accent hover:text-accent lg:hidden"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={open ? t("closeMenu") : t("openMenu")}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            className="fixed inset-0 z-40 flex flex-col bg-bg/95 px-6 pb-8 pt-28 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
            <ul className="flex flex-1 flex-col justify-center gap-2">
              {navItems.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <motion.li
                    key={item.key}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-baseline gap-4 py-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl",
                        active ? "text-accent" : "text-fg",
                      )}
                    >
                      <span className="font-mono text-xs tracking-[0.2em] text-muted">
                        0{i + 1}
                      </span>
                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        {t(item.key)}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            <motion.div
              className="flex items-center justify-between border-t border-line pt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <LocaleSwitcher label={t("switchLocale")} />
              <ButtonLink href="/contact" size="sm" arrow>
                {t("cta")}
              </ButtonLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
