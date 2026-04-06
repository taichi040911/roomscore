import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get("score") || "??";
  const type = searchParams.get("type") || "あなたの寝室";
  const s = parseInt(score) || 0;
  const color = s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)",
          fontFamily: '"Noto Sans JP", sans-serif',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8, display: "flex" }}>🌙</div>
        <div
          style={{
            fontSize: 28, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em",
            marginBottom: 24, display: "flex",
          }}
        >
          RoomScore AI
        </div>
        <div
          style={{
            display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 120, fontWeight: 900, color }}>{score}</span>
          <span style={{ fontSize: 36, fontWeight: 600, color: "#64748b" }}>/ 100</span>
        </div>
        <div
          style={{
            fontSize: 28, fontWeight: 800, color: "#cbd5e1",
            background: "#1e293b", padding: "8px 32px", borderRadius: 12,
            display: "flex",
          }}
        >
          🛏️ {type}
        </div>
        <div
          style={{
            fontSize: 18, fontWeight: 500, color: "#475569", marginTop: 24,
            display: "flex",
          }}
        >
          あなたの寝室は何点？ AIで睡眠環境を診断しよう
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
