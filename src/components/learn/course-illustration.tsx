import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { ZoomImage } from "@/components/blog/zoom-image";
import { getFdeCopy } from "@/data/fde";

const FIGURES = { architecture: "01", retrieval: "02", execution: "03" };

export function CourseIllustration({ locale, kind = "architecture", eager = false }: { locale: string; kind?: "architecture" | "retrieval" | "execution"; eager?: boolean }) {
  const copy = getFdeCopy(locale);
  const captions = {
    architecture: {
      zh: "问答与建单走不同路径。应用负责权限和动作控制，模拟接口的回执才是建单结果。",
      en: "Retrieval and ticket creation follow separate paths. The application enforces access and action controls; a mock receipt provides execution evidence.",
    },
    retrieval: {
      zh: "先限定可读资料，再保留规则的条件与版本。回答需要原文支持，资料未覆盖的部分应明确说明。",
      en: "Limit sources by access first, preserve conditions and versions, then check that each claim is supported. Explain gaps instead of inventing an answer.",
    },
    execution: {
      zh: "发送请求、超时、确认完成是不同状态。写入超时后，沿原动作标识查询，不换键盲目重建。",
      en: "Sent, timed out and verified are different states. After a write timeout, query the original action instead of creating a new request.",
    },
  };
  const language = locale === "en" ? "en" : "zh";
  const src = "/images/learn/fde-" + kind + "-" + language + ".png";
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-line bg-bg-elevated">
      <div aria-hidden="true" className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:px-5">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)]" />
          {copy.illustration}
        </span>
        <span className="tabular-nums">fig.{FIGURES[kind]}</span>
      </div>
      <ZoomImage src={src} alt={captions[kind][language]} caption={captions[kind][language]} className="bg-[#faf8f4]">
        <Image src={src} alt={captions[kind][language]} width={1672} height={941} loading={eager ? "eager" : "lazy"} sizes="(max-width: 1023px) 92vw, 900px" className="h-auto w-full" />
      </ZoomImage>
      <figcaption className="flex items-start gap-4 border-t border-line p-4 text-xs leading-6 text-muted sm:px-5">
        <span>{captions[kind][language]}</span>
        <a href={src} target="_blank" rel="noopener noreferrer" aria-label={copy.enlarge} className="group/open ml-auto grid min-h-11 min-w-11 shrink-0 place-items-center rounded-lg transition-colors hover:bg-bg hover:text-accent"><Maximize2 className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/open:scale-125" /></a>
      </figcaption>
    </figure>
  );
}
