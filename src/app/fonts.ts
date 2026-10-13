import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans, Instrument_Serif, Noto_Sans_SC } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const zh = Noto_Sans_SC({
  variable: "--font-zh",
  display: "swap",
  preload: false,
});

/** Font CSS variables shared by the site and admin root layouts. */
export const fontVariables = `${display.variable} ${sans.variable} ${serif.variable} ${mono.variable} ${zh.variable}`;
