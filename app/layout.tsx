import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomScore AI — 寝室の睡眠環境をAIがスコアリング",
  description:
    "寝室の写真をアップロードするだけ。AIが光・温度・整頓度など6項目を分析し、睡眠環境を100点満点で採点。改善アドバイス付き。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://roomscore.app"),
  openGraph: {
    title: "RoomScore AI — あなたの寝室は何点？",
    description: "AIが寝室を分析して睡眠環境をスコアリング。無料で診断。",
    images: ["/api/og?score=85&type=リラックス巣ごもり型"],
    type: "website",
    locale: "ja_JP",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌙</text></svg>" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body className="bg-midnight text-slate-50 font-sans">{children}</body>
    </html>
  );
}
