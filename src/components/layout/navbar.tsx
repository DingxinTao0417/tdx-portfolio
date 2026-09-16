"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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
  const learningDetail = pathname.startsWith("/learn/");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
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
    const background = [...document.querySelectorAll<HTMLElement>("main, footer")];
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    const toggle = menuToggleRef.current;
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const links = [...(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? [])];
      const targets = toggle ? [toggle, ...links] : links;
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = previous;
      background.forEach((element, i) => { element.inert = previousInert[i]; });
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  const menuId = "mobile-menu";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[padding] duration-300",
          scrolled ? "pt-2 sm:pt-3" : "pt-3 sm:pt-5",
        )}
      >
        <div className="container-x">
          <nav
            aria-label="Primary"
            className={cn(
              "relative flex h-16 items-center justify-between gap-4 rounded-2xl border px-3 transition-[background-color,border-color,box-shadow] duration-300 sm:px-5",
              scrolled || open ? "glass border-line shadow-soft" : "border-transparent bg-bg/70",
            )}
          >
            {/* Brand */}
            <Link
              href="/"
              className="inline-flex h-12 shrink-0 items-center justify-center px-2 sm:h-[52px]"
              aria-label={`${locale === "zh" ? site.nameZh : site.name} — ${t("home")}`}
              onClick={() => setOpen(false)}
            >
              <span className="font-display text-2xl font-semibold tracking-tight text-gradient-accent sm:text-[28px]">
                TDX
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="absolute left-1/2 hidden w-max -translate-x-1/2 items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.key} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative z-10 inline-flex h-10 items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-medium transition-colors",
                        active ? "text-accent" : "text-muted hover:text-fg",
                      )}
                    >
                      {t(item.key)}
                    </Link>
                    {active && (
                      <motion.span
                        layoutId={reducedMotion ? undefined : "nav-active"}
                        className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              <LocaleSwitcher label={t("switchLocale")} className="hidden sm:flex" onNavigate={() => setOpen(false)} />
              <ThemeToggle label={t("toggleTheme")} />
              {/* Hidden between lg and xl: the centred link row would collide with it there. */}
              {!learningDetail && <div className="hidden md:block lg:hidden xl:block">
                <ButtonLink href="/contact" size="sm" arrow onClick={() => setOpen(false)}>
                  {t("cta")}
                </ButtonLink>
              </div>}
              <button
                ref={menuToggleRef}
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
            ref={menuRef}
            id={menuId}
            data-lenis-prevent
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-bg/95 px-6 pb-8 pt-28 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
            <ul className="flex flex-1 flex-col justify-center gap-1">
              {navItems.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <motion.li
                    key={item.key}
                    data-reveal
                    initial={{ opacity: 0, x: reducedMotion ? 0 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reducedMotion ? 0 : -8 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-baseline gap-4 border-b border-line py-4 font-display text-3xl font-medium tracking-tight sm:text-4xl",
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
              data-reveal
              className="flex items-center justify-between border-t border-line pt-6"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <LocaleSwitcher label={t("switchLocale")} onNavigate={() => setOpen(false)} />
              {!learningDetail && <ButtonLink href="/contact" size="sm" arrow onClick={() => setOpen(false)}>
                {t("cta")}
              </ButtonLink>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
