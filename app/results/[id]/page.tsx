import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase.from("room_scores").select("*").eq("id", params.id).single();
  if (!data) return { title: "RoomScore AI" };
  const ogUrl = `/api/og?score=${data.total_score}&type=${encodeURIComponent(data.sleep_type)}`;
  return {
    title: `寝室スコア ${data.total_score}点 | RoomScore AI`,
    description: `${data.sleep_type} — ${data.one_line_advice}`,
    openGraph: {
      title: `🌙 寝室スコア ${data.total_score}点 | RoomScore AI`,
      description: `${data.sleep_type} — ${data.one_line_advice}`,
      images: [ogUrl],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ResultPage({ params }: Props) {
  const { data } = await supabase.from("room_scores").select("*").eq("id", params.id).single();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🌙</p>
          <p className="text-slate-400">この結果は見つかりませんでした</p>
          <a href="/" className="mt-4 inline-block text-sm text-violet-400 underline">
            自分の寝室を診断する →
          </a>
        </div>
      </div>
    );
  }

  const barColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";
  const prioColor: Record<string, string> = { 高: "#ef4444", 中: "#f97316", 低: "#22c55e" };

  return (
    <div className="min-h-screen">
      <header className="pt-6 pb-2 text-center">
        <a href="/" className="inline-flex items-center gap-2 mb-1">
          <span className="text-3xl">🌙</span>
          <h1 className="text-2xl font-black bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text text-transparent">
            RoomScore
          </h1>
        </a>
      </header>

      <main className="max-w-md mx-auto px-4 pb-12">
        {/* Score */}
        <div className="mt-4 bg-deep border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-6xl font-black mb-2" style={{ color: barColor(data.total_score) }}>
            {data.total_score}
          </p>
          <p className="text-xs text-slate-500 font-semibold">/ 100</p>
          <p className="mt-3 text-sm font-extrabold text-slate-300">{data.sleep_type}</p>
          <p className="mt-2 text-xs text-violet-400/80 leading-relaxed">💡 {data.one_line_advice}</p>
        </div>

        {/* Categories */}
        <div className="mt-6 bg-deep border border-slate-800 rounded-2xl p-4 space-y-3">
          {(data.categories as any[]).map((cat: any) => (
            <div key={cat.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-400">{cat.icon} {cat.name}</span>
                <span className="text-sm font-black" style={{ color: barColor(cat.score) }}>{cat.score}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${cat.score}%`, background: barColor(cat.score) }} />
              </div>
              <p className="mt-0.5 text-[11px] text-slate-600">{cat.comment}</p>
            </div>
          ))}
        </div>

        {/* Improvements */}
        <div className="mt-6 space-y-2.5">
          {(data.improvements as any[]).map((item: any, i: number) => (
            <div key={i} className="bg-deep border border-slate-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded"
                  style={{ background: (prioColor[item.priority] || "#666") + "18", color: prioColor[item.priority] }}>
                  {item.priority}
                </span>
                <span className="text-sm font-extrabold text-slate-200">{item.title}</span>
              </div>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a href="/"
            className="inline-block bg-gradient-to-r from-violet-600 to-indigo-500 text-white px-8 py-4 rounded-xl text-base font-extrabold shadow-lg shadow-indigo-500/20">
            🌙 自分の寝室も診断する
          </a>
        </div>
      </main>
    </div>
  );
}
