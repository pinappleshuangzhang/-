import type { Metadata, Viewport } from "next";
import { Libre_Bodoni, Noto_Serif_SC } from "next/font/google";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const libreBodoni = Libre_Bodoni({
  variable: "--font-libre-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "万有引力设计档案室 | Grava Design Studio",
  description:
    "以数字档案调查为叙事的设计工作室网站——以临时调查员身份，探索设计如何在人、品牌与事物之间建立引力。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(max-width: 767px)", color: "#F2F2F4" },
    { media: "(min-width: 768px)", color: "#DEDEDE" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSerifSC.variable} ${libreBodoni.variable}`}>
        <SmoothScrollProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
