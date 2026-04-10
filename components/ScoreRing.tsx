"use client";

export function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const sw = 6;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const c = score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : score >= 40 ? "#fb923c" : "#f87171";

  return (
    <div className="relative score-reveal" style={{ width: size, height: size }}>
      {/* Glow */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle, ${c}08 0%, transparent 70%)`,
        filter: "blur(20px)", transform: "scale(1.3)"
      }} />
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className="relative z-10">
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(200,214,229,0.06)" strokeWidth={sw} fill="none" />
        {/* Progress */}
        <circle cx={size/2} cy={size/2} r={r} stroke={c} strokeWidth={sw} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${c}66)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="font-serif italic text-slate-50" style={{ fontSize: size * 0.38, lineHeight: 1 }}>{score}</span>
        <span className="text-slate-500 font-medium mt-1" style={{ fontSize: size * 0.085, letterSpacing: "0.15em" }}>POINTS</span>
      </div>
    </div>
  );
}
