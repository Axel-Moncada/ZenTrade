import { NextResponse } from "next/server";
import { generateMarketPreview } from "@/lib/ai/gemini-market-news";

// ⚠️ Solo disponible en desarrollo local — nunca en producción
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("week_start") ?? "2026-04-07";
  const weekEnd   = searchParams.get("week_end")   ?? "2026-04-11";
  const rawInstruments = searchParams.get("instruments") ?? "ES,NQ,CL,GC,MNQ";
  const instruments = rawInstruments.split(",").map((s) => s.trim()).filter(Boolean);

  console.log(`[TestMarketPreview] weekStart=${weekStart} weekEnd=${weekEnd} instruments=${instruments.join(",")}`);

  try {
    const data = await generateMarketPreview(weekStart, weekEnd, instruments);
    return NextResponse.json({ ok: true, weekStart, weekEnd, instruments, data }, { status: 200 });
  } catch (err) {
    console.error("[TestMarketPreview] Error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
