"use client";

import { ArrowUpRight, Download, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";

const qrImage = "/contact/wechat-qr.jpg";

export function WeChatDialog({ compact = false, label }: { compact?: boolean; label?: string }) {
  const t = useTranslations("Contact.wechat");
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pressedBackdrop = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    if (!element) return;
    const opener = trigger.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    document.dispatchEvent(new Event("site:dialog-change"));
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      document.dispatchEvent(new Event("site:dialog-change"));
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

  function isBackdrop(event: PointerEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return false;
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
  }

  const button = (
    <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-controls={id}
      className={compact
        ? "inline-flex items-center gap-3 text-sm text-muted transition-colors hover:text-accent"
        : "inline-flex min-h-11 items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-5 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent/10"}>
      <MessageCircle className="h-4 w-4" aria-hidden />
      {label ?? t("trigger")}
    </button>
  );

  return (
    <>
      {compact ? button : (
        <section id="wechat" className="scroll-mt-28 border-b border-line pb-8">
          <h2 className="eyebrow mb-4">{t("title")}</h2>
          {button}
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("shortNote")}</p>
        </section>
      )}

      <dialog ref={dialog} id={id} aria-labelledby={`${id}-title`} aria-describedby={`${id}-note`}
        onClose={() => setOpen(false)} data-lenis-prevent
        onPointerDown={(event) => { pressedBackdrop.current = isBackdrop(event); }}
        onPointerUp={(event) => {
          if (pressedBackdrop.current && isBackdrop(event)) setOpen(false);
          pressedBackdrop.current = false;
        }}
        onPointerCancel={() => { pressedBackdrop.current = false; }}
        className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[26rem] overflow-y-auto overscroll-contain rounded-3xl border border-line bg-bg-elevated p-0 text-fg shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-sm">
        <div className="relative p-5 sm:p-7">
          <button type="button" onClick={() => setOpen(false)} aria-label={t("close")}
            className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-accent sm:right-3 sm:top-3">
            <X className="h-5 w-5" aria-hidden />
          </button>
          <h2 id={`${id}-title`} className="pr-9 font-display text-xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="mt-1.5 pr-8 text-sm text-muted">{t("scan")}</p>

          {/* Clip only the display: the original QR and its quiet zone stay intact. */}
          <a href={qrImage} target="_blank" rel="noreferrer noopener" aria-label={t("open")}
            className="mx-auto my-5 block aspect-square w-64 max-w-full overflow-hidden rounded-xl border border-line bg-white">
            <span className="relative block h-full w-full">
              <Image src={qrImage} alt={t("alt")} width={912} height={1354} unoptimized
                className="absolute h-auto max-w-none"
                style={{ width: `${912 / 752 * 100}%`, left: `${-80 / 752 * 100}%`, top: `${-346 / 752 * 100}%` }} />
            </span>
          </a>

          <p id={`${id}-note`} className="text-sm font-medium leading-relaxed">{t("note")}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{t("example")}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3">
            <a href={qrImage} download="dingxin-wechat-qr.jpg"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-strong">
              <Download className="h-4 w-4" aria-hidden />{t("save")}
            </a>
            <a href={qrImage} target="_blank" rel="noreferrer noopener"
              className="inline-flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
              {t("open")}<ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{t("mobileHint")}</p>
        </div>
      </dialog>
    </>
  );
}
