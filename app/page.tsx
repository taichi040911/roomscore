"use client";

import { useState, useRef } from "react";
import { ScoreRing } from "@/components/ScoreRing";

type Category = { name: string; score: number; icon: string; comment: string };
type Improvement = { priority: string; title: string; detail: string; product: string };
type Result = {
  id: string | null;
  totalScore: number;
  sleepType: string;
  oneLineAdvice: string;
  categories: Category[];
  improvements: Improvement[];
};

export default function Home() {
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file?.type.startsWith("image/")) return;
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageB64(dataUrl.split(",")[1]);
      setPreview(dataUrl);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageB64) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageB64, mediaType }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch {
      setError("分析に失敗しました。もう一度お試しください。");
    }
    setLoading(false);
  };

  const shareUrl = result?.id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/results/${result.id}`
    : "";
  const shareText = result
    ? `🌙 私の寝室スコアは ${result.totalScore}点！\n🛏️ タイプ: ${result.sleepType}\n\nRoomScore AIで診断 👉 ${shareUrl}`
    : "";

  const ogUrl = result
    ? `/api/og?score=${result.totalScore}&type=${encodeURIComponent(result.sleepType)}`
    : "";

  const reset = () => { setResult(null); setImageB64(null); setPreview(null); setError(null); };
  const prioColor: Record<string, string> = { 高: "#ef4444", 中: "#f97316", 低: "#22c55e" };
  const barColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="min-h-screen">
      {/* Dynamic OGP for result pages */}
      {result && (
        <head>
          <meta property="og:image" content={ogUrl} />
          <meta property="og:title" content={`寝室スコア ${result.totalScore}点 | RoomScore AI`} />
        </head>
      )}

      {/* Header */}
      <header className="pt-6 pb-2 text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-3xl animate-float">🌙</span>
          <h1 className="text-2xl font-black bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text text-transparent">
            RoomScore
          </h1>
        </div>
        <p className="text-xs text-slate-500 font-medium">AIが寝室を分析して睡眠環境をスコアリング</p>
      </header>

      <main className="max-w-md mx-auto px-4 pb-12">

        {/* ===== UPLOAD ===== */}
        {!result && (
          <>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              className={`mt-4 rounded-2xl cursor-pointer transition-all overflow-hidden border-2 border-dashed
                ${preview ? "border-slate-700 p-0" : "border-slate-700 hover:border-sky-500/50 p-10"}
                bg-deep`}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="寝室" className="w-full block rounded-xl" />
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-slate-400 font-semibold">
                    📷 タップで変更
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-5xl opacity-50">📸</span>
                  <div>
                    <p className="text-sm font-bold text-slate-300">寝室の写真をアップロード</p>
                    <p className="text-xs text-slate-600 mt-1">タップして撮影・選択</p>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze button */}
            {preview && (
              <button onClick={analyze} disabled={loading}
                className={`w-full mt-4 py-4 rounded-xl font-extrabold text-base text-white transition-all
                  ${loading
                    ? "bg-slate-800 opacity-60 cursor-wait"
                    : "bg-gradient-to-r from-violet-600 to-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]"}`}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-pulse">🔍</span> AI分析中...（10〜20秒）
                  </span>
                ) : "🌙 睡眠環境を分析する"}
              </button>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl animate-shimmer" />
                ))}
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-950/60 border border-red-900 rounded-xl p-4 text-center text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {result && (
          <div className="animate-fade-up">

            {/* Hero: Photo + Score overlay */}
            <div className="relative mt-4 rounded-2xl overflow-hidden">
              <img src={preview!} alt="寝室" className="w-full block brightness-[0.45]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-midnight/80">
                <ScoreRing score={result.totalScore} />
                <p className="mt-2 text-sm font-extrabold text-slate-300">{result.sleepType}</p>
              </div>
            </div>

            {/* One-line advice */}
            <div className="mt-4 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-900/50 rounded-xl px-4 py-3 text-center text-sm text-violet-300 font-semibold leading-relaxed">
              💡 {result.oneLineAdvice}
            </div>

            {/* Category Scores */}
            <h2 className="mt-6 mb-3 text-xs font-extrabold text-slate-500 tracking-widest uppercase">
              カテゴリ別スコア
            </h2>
            <div className="bg-deep border border-slate-800 rounded-2xl p-4 space-y-3">
              {result.categories.map((cat, i) => (
                <div key={cat.name} className="animate-fade-up" style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400">{cat.icon} {cat.name}</span>
                    <span className="text-sm font-black" style={{ color: barColor(cat.score) }}>{cat.score}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${cat.score}%`, background: `linear-gradient(90deg, ${barColor(cat.score)}66, ${barColor(cat.score)})`,
                        transitionDelay: `${0.2 + i * 0.1}s` }} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">{cat.comment}</p>
                </div>
              ))}
            </div>

            {/* Improvements */}
            <h2 className="mt-6 mb-3 text-xs font-extrabold text-slate-500 tracking-widest uppercase">
              改善ポイント
            </h2>
            <div className="space-y-2.5">
              {result.improvements.map((item, i) => (
                <div key={i} className="bg-deep border border-slate-800 rounded-xl px-4 py-3 animate-fade-up"
                  style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded"
                      style={{ background: (prioColor[item.priority] || "#666") + "18", color: prioColor[item.priority] }}>
                      {item.priority}
                    </span>
                    <span className="text-sm font-extrabold text-slate-200">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                  {item.product && (
                    <span className="inline-flex items-center gap-1 mt-2 bg-slate-800 px-2.5 py-1 rounded-md text-[11px] text-sky-300 font-semibold">
                      🛒 {item.product}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="mt-6 flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(shareText)}
                className="flex-1 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-700 active:scale-[0.98] transition-all">
                📋 コピー
              </button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank")}
                className="flex-1 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                𝕏 シェア
              </button>
              <button onClick={() => window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, "_blank")}
                className="flex-1 py-3.5 bg-[#06C755]/10 border border-[#06C755]/30 rounded-xl text-sm font-bold text-[#06C755] hover:bg-[#06C755]/20 active:scale-[0.98] transition-all">
                LINE
              </button>
            </div>

            {/* CTA → eSleep */}
            <div className="mt-6 bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-900/40 rounded-2xl p-5 text-center">
              <p className="text-sm font-extrabold text-emerald-300 mb-1">💤 睡眠の質をもっと改善したい？</p>
              <p className="text-xs text-emerald-400/70 leading-relaxed mb-4">
                GLP-1ダイエット×睡眠改善の科学的情報を配信中
              </p>
              <a href="https://esleep-clinic.jp/" target="_blank" rel="noopener noreferrer"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-lg text-sm font-extrabold transition-colors">
                eSleep を見る →
              </a>
            </div>

            {/* Retry */}
            <button onClick={reset}
              className="w-full mt-4 py-3.5 bg-transparent border border-slate-800 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-all">
              🔄 別の寝室を診断する
            </button>
          </div>
        )}

        {/* Social proof (before upload) */}
        {!preview && !result && (
          <div className="mt-8 text-center space-y-4">
            <div className="flex justify-center gap-4">
              {[
                { icon: "📸", label: "写真1枚", sub: "アップロード" },
                { icon: "🤖", label: "AI分析", sub: "6カテゴリ" },
                { icon: "📊", label: "スコア", sub: "100点満点" },
              ].map((s) => (
                <div key={s.label} className="bg-deep border border-slate-800 rounded-xl px-4 py-3 flex-1">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xs font-bold text-slate-400">{s.label}</div>
                  <div className="text-[10px] text-slate-600">{s.sub}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-700">無料 • 登録不要 • 10秒で完了</p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 border-t border-slate-900">
        <p className="text-[10px] text-slate-800">RoomScore AI — Powered by Claude Vision</p>
        <div className="mt-2 flex justify-center gap-4 text-[10px] text-slate-700">
          <a href="https://esleep-clinic.jp/" className="hover:text-slate-500">eSleep</a>
          <a href="https://esleep-clinic.jp/privacy-policy/" className="hover:text-slate-500">プライバシー</a>
        </div>
      </footer>
    </div>
  );
}
