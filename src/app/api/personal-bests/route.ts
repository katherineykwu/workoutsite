// API route: GET /api/personal-bests
import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/lib/store";
import type { PersonalBest } from "@/lib/types";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exercise = searchParams.get("exercise");

  const data = await getData("personal-bests");
  const pbs: Record<string, PersonalBest> = data ? JSON.parse(data) : {};

  if (exercise) {
    const key = exercise.toLowerCase().trim();
    const pb = pbs[key];
    return NextResponse.json(pb || null, { headers: NO_CACHE_HEADERS });
  }

  return NextResponse.json(pbs, { headers: NO_CACHE_HEADERS });
}
