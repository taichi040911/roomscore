"use client";

import { useState, useRef, useEffect } from "react";
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

const SAMPLE_SCORES = [
  { score: 82, type: "リラックス巣ごもり型", user: "30代女性" },
  { score: 67, type: "都会型ミニマル", user: "20代男性" },
  { score: 91, type: "ナチュラル安眠型", user: "40代女性" },
  { score: 54, type: "情報過多型", user: "30代男性" },
];

export default function Home() {
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);
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

  const STEPS = ["寝室を認識中...", "光環境を分析中...", "電子機器を検出中...", "スコアを算出中..."];

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const t = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); setLoadingStep(i); }, 3500);
    return () => clearInterval(t);
  }, [loading]);

  const analyze = async () => {
    if (!imageB64) return;
    setLoading(true);
    setLoadingStep(0);
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
    } catch (e: any) {
      setError(e.message || "分析に失敗しました。");
    }
    setLoading(false);
  };

  const shareUrl = result?.id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/results/${result.id}`
    : typeof window !== "undefined" ? window.location.origin : "";
  const shareText = result
    ? `🌙 私の寝室スコアは ${result.totalScore}点！\n🛏️ ${result.sleepType}\n\nRoomScore AIで診断 👉 ${shareUrl}`
    : "";

  const reset = () => { setResult(null); setImageB64(null); setPreview(null); setError(null); };
  const barColor = (s: number) => s >= 80 ? "#4ade80" : s >= 60 ? "#facc15" : s >= 40 ? "#fb923c" : "#f87171";
  const prioColor: Record<string, string> = { "高": "#f87171", "中": "#fb923c", "低": "#4ade80" };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#030711]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-900/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(148,163,184,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-sm">🌙</div>
          <span className="text-[15px] font-black tracking-tight text-slate-100">RoomScore</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI Ready
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-5 pb-16">

        {/* ============ HERO ============ */}
        {!preview && !result && (
          <div className="pt-8 pb-6">
            <div className="flex justify-center mb-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/8 border border-indigo-500/15 text-[11px] font-semibold text-indigo-300">
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                Claude Vision AI で即時分析
              </div>
            </div>

            <h1 className="text-center mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <span className="block text-[2.1rem] sm:text-[2.6rem] font-black leading-[1.1] tracking-tight text-slate-50">あなたの寝室は</span>
              <span className="block text-[2.1rem] sm:text-[2.6rem] font-black leading-[1.1] tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent mt-1">何点ですか？</span>
            </h1>

            <p className="text-center text-sm text-slate-400 max-w-xs mx-auto leading-relaxed mb-8 animate-fade-up" style={{ animationDelay: "0.15s" }}>
              写真を1枚アップロードするだけ。<br />AIが6つのカテゴリで睡眠環境を採点します。
            </p>

            {/* Upload */}
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <button onClick={() => fileRef.current?.click()}
                className="group w-full relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all duration-300 p-8 cursor-pointer">
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 border border-indigo-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">📸</div>
                  <div className="text-center">
                    <p className="text-[15px] font-bold text-slate-200 mb-1">寝室の写真をアップロード</p>
                    <p className="text-xs text-slate-500">タップして撮影 or ライブラリから選択</p>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-indigo-500/5 to-transparent" />
              </button>
            </div>

            {/* Steps */}
            <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase text-center mb-4">How it works</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n: "01", icon: "📷", t: "写真を撮る", s: "寝室を1枚撮影" },
                  { n: "02", icon: "🤖", t: "AI分析", s: "6項目を即時採点" },
                  { n: "03", icon: "💡", t: "改善提案", s: "具体的な改善策" },
                ].map((x) => (
                  <div key={x.n} className="text-center">
                    <div className="text-[10px] font-black text-indigo-500/50 mb-2">{x.n}</div>
                    <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-lg mx-auto mb-2">{x.icon}</div>
                    <p className="text-[11px] font-bold text-slate-300">{x.t}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{x.s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample */}
            <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <p className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase text-center mb-3">Recent scores</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {SAMPLE_SCORES.map((s, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2.5 bg-slate-800/30 border border-slate-700/30 rounded-xl px-3.5 py-2.5">
                    <span className="text-lg font-black" style={{ color: barColor(s.score) }}>{s.score}</span>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">{s.type}</p>
                      <p className="text-[10px] text-slate-600">{s.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-slate-600 animate-fade-up" style={{ animationDelay: "0.5s" }}>
              <span>🔒 画像非保存</span>
              <span className="w-px h-3 bg-slate-800" />
              <span>⚡ 10秒で完了</span>
              <span className="w-px h-3 bg-slate-800" />
              <span>🆓 完全無料</span>
            </div>
          </div>
        )}

        {/* ============ PREVIEW ============ */}
        {preview && !result && (
          <div className="pt-4 animate-fade-up">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 mb-4">
              <img src={preview} alt="寝室" className="w-full block" />
              <button onClick={() => fileRef.current?.click()}
                className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[11px] text-slate-300 font-semibold px-3 py-1.5 rounded-lg border border-white/10">
                📷 変更
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            <button onClick={analyze} disabled={loading}
              className={`w-full py-4 rounded-2xl font-extrabold text-[15px] text-white transition-all duration-300
                ${loading ? "bg-slate-800 cursor-wait" : "bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-[0_8px_32px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_40px_rgba(99,102,241,0.35)] active:scale-[0.99]"}`}>
              {loading ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <span className="text-slate-300 text-sm">{STEPS[loadingStep]}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {STEPS.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= loadingStep ? "w-6 bg-indigo-400" : "w-2 bg-slate-700"}`} />
                    ))}
                  </div>
                </div>
              ) : "寝室を分析する →"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-950/30 border border-red-900/30 rounded-xl p-4 text-center text-sm text-red-300 animate-fade-up">
            ⚠️ {error}
          </div>
        )}

        {/* ============ RESULTS ============ */}
        {result && (
          <div className="pt-4">
            {/* Score Hero */}
            <div className="relative rounded-3xl overflow-hidden mb-6 animate-fade-up">
              <img src={preview!} alt="寝室" className="w-full block brightness-[0.3] scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030711] via-[#030711]/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ScoreRing score={result.totalScore} size={140} />
                <div className="mt-3 inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5">
                  <span className="text-xs">🛏️</span>
                  <span className="text-sm font-bold text-slate-200">{result.sleepType}</span>
                </div>
              </div>
            </div>

            {/* Advice */}
            <div className="mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="bg-gradient-to-r from-indigo-950/50 to-slate-900/50 border border-indigo-500/10 rounded-2xl px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">💡</div>
                  <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{result.oneLineAdvice}</p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <h2 className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>Category Scores</h2>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {result.categories?.map((cat, i) => (
                <div key={cat.name} className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-3.5 animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">{cat.icon} {cat.name}</span>
                    <span className="text-lg font-black tabular-nums" style={{ color: barColor(cat.score) }}>{cat.score}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-[1200ms] ease-out" style={{ width: `${cat.score}%`, background: barColor(cat.score), transitionDelay: `${0.3 + i * 0.08}s` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">{cat.comment}</p>
                </div>
              ))}
            </div>

            {/* Improvements */}
            <h2 className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-3 animate-fade-up" style={{ animationDelay: "0.5s" }}>Improvements</h2>
            <div className="space-y-2 mb-6">
              {result.improvements?.map((item, i) => (
                <div key={i} className="bg-slate-800/15 border border-slate-700/25 rounded-xl p-4 hover:bg-slate-800/25 transition-all animate-fade-up" style={{ animationDelay: `${0.55 + i * 0.08}s` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-md mt-0.5"
                      style={{ background: (prioColor[item.priority] || "#666") + "12", color: prioColor[item.priority], border: `1px solid ${prioColor[item.priority]}22` }}>
                      {item.priority}
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-slate-200 mb-0.5">{item.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{item.detail}</p>
                      {item.product && (
                        <div className="inline-flex items-center gap-1.5 mt-2 bg-cyan-500/8 border border-cyan-500/12 px-2.5 py-1 rounded-lg text-[10px] text-cyan-300 font-semibold">
                          🛒 {item.product}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-5 mb-6 animate-fade-up" style={{ animationDelay: "0.8s" }}>
              <p className="text-xs font-bold text-slate-400 mb-3 text-center">結果をシェア</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank")}
                  className="py-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-xs font-bold text-slate-300 hover:bg-slate-700/50 active:scale-[0.97] transition-all">
                  𝕏 Post
                </button>
                <button onClick={() => window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, "_blank")}
                  className="py-3 rounded-xl bg-[#06C755]/8 border border-[#06C755]/15 text-xs font-bold text-[#06C755] hover:bg-[#06C755]/15 active:scale-[0.97] transition-all">
                  💬 LINE
                </button>
                <button onClick={handleCopy}
                  className="py-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-xs font-bold text-slate-300 hover:bg-slate-700/50 active:scale-[0.97] transition-all">
                  {copied ? "✅ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>

            {/* eSleep CTA */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 to-teal-950/20 border border-emerald-500/10 p-6 mb-6 animate-fade-up" style={{ animationDelay: "0.9s" }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px]" />
              <div className="relative text-center">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/15 rounded-full px-3 py-1 text-[10px] font-semibold text-emerald-300 mb-3">
                  💤 睡眠の質をもっと改善
                </div>
                <p className="text-sm font-bold text-slate-200 mb-1">GLP-1ダイエット × 睡眠改善</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">科学的根拠に基づいた情報で、睡眠とダイエットを同時に改善</p>
                <a href="https://esleep-clinic.jp/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl text-sm font-extrabold transition-colors">
                  eSleep を見る →
                </a>
              </div>
            </div>

            <button onClick={reset}
              className="w-full py-3.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-all">
              ← 別の寝室を診断する
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 mt-12">
        <div className="max-w-2xl mx-auto px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-slate-700">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 flex items-center justify-center text-[8px]">🌙</div>
            RoomScore AI
          </div>
          <div className="flex gap-4 text-[10px] text-slate-700">
            <a href="https://esleep-clinic.jp/" className="hover:text-slate-500 transition-colors">eSleep</a>
            <a href="https://esleep-clinic.jp/privacy-policy/" className="hover:text-slate-500 transition-colors">プライバシー</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
