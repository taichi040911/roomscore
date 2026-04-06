import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `あなたは睡眠環境の専門家「RoomScore AI」です。
ユーザーがアップロードした寝室の写真を分析し、睡眠の質に影響する環境要因を評価してください。

以下のJSON形式のみで回答してください。それ以外のテキストは一切出力しないでください。

{
  "totalScore": 0-100の整数,
  "categories": [
    {"name": "光環境", "score": 0-100, "icon": "💡", "comment": "1文の評価コメント"},
    {"name": "温度・換気", "score": 0-100, "icon": "🌡️", "comment": "1文の評価コメント"},
    {"name": "電子機器", "score": 0-100, "icon": "📱", "comment": "1文の評価コメント"},
    {"name": "ベッド配置", "score": 0-100, "icon": "🛏️", "comment": "1文の評価コメント"},
    {"name": "整理整頓", "score": 0-100, "icon": "✨", "comment": "1文の評価コメント"},
    {"name": "色彩・雰囲気", "score": 0-100, "icon": "🎨", "comment": "1文の評価コメント"}
  ],
  "improvements": [
    {"priority": "高", "title": "改善タイトル", "detail": "具体的な改善方法を1-2文で", "product": "おすすめ商品名"},
    {"priority": "高", "title": "改善タイトル", "detail": "具体的な改善方法を1-2文で", "product": "おすすめ商品名"},
    {"priority": "中", "title": "改善タイトル", "detail": "具体的な改善方法を1-2文で", "product": "おすすめ商品名"},
    {"priority": "低", "title": "改善タイトル", "detail": "具体的な改善方法を1-2文で", "product": "おすすめ商品名"}
  ],
  "sleepType": "この寝室の睡眠タイプを一言で（例: リラックス巣ごもり型、都会型ミニマル、情報過多型）",
  "oneLineAdvice": "最も重要な改善を1文で"
}

写真から読み取れる要素のみを評価してください。
光の状態、電子機器の存在、ベッドの位置、カーテンの種類、色彩、整頓度を重点的に分析してください。`;

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "画像が必要です" }, { status: 400 });
    }

    // Call Claude Vision
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: "この寝室の写真を分析して、睡眠環境スコアをJSON形式で出力してください。",
            },
          ],
        },
      ],
    });

    const text =
      msg.content[0].type === "text" ? msg.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    // Save to Supabase
    const { data: saved, error: dbError } = await supabaseAdmin
      .from("room_scores")
      .insert({
        total_score: result.totalScore,
        sleep_type: result.sleepType,
        one_line_advice: result.oneLineAdvice,
        categories: result.categories,
        improvements: result.improvements,
        user_agent: req.headers.get("user-agent") || "",
        referrer: req.headers.get("referer") || "",
      })
      .select("id")
      .single();

    if (dbError) console.error("DB error:", dbError);

    return NextResponse.json({
      ...result,
      id: saved?.id || null,
    });
  } catch (e: any) {
    console.error("Analysis error:", e);
    return NextResponse.json(
      { error: "分析に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
