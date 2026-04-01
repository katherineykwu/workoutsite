// Debug endpoint — helps diagnose storage issues on Netlify
import { NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      NETLIFY: process.env.NETLIFY || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  // Test write
  try {
    await setData("_debug_test", JSON.stringify({ ok: true, time: Date.now() }));
    results.write = "SUCCESS";
  } catch (err) {
    results.write = `FAILED: ${err}`;
  }

  // Test read
  try {
    const data = await getData("_debug_test");
    results.read = data ? JSON.parse(data) : "NULL";
  } catch (err) {
    results.read = `FAILED: ${err}`;
  }

  // Read routines
  try {
    const routines = await getData("routines");
    if (routines) {
      const parsed = JSON.parse(routines);
      results.routineCount = parsed.length;
      results.routines = parsed.map((r: { id: string; published: boolean; weekStart: string }) => ({
        id: r.id,
        published: r.published,
        weekStart: r.weekStart,
      }));
    } else {
      results.routineCount = 0;
      results.routines = "NO DATA";
    }
  } catch (err) {
    results.routines = `FAILED: ${err}`;
  }

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "no-store",
      "CDN-Cache-Control": "no-store",
      "Netlify-CDN-Cache-Control": "no-store",
    },
  });
}
