// API route: GET /api/personal-bests — retrieve personal records
import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/lib/store";
import type { PersonalBest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exercise = searchParams.get("exercise");

  const data = await getData("personal-bests");
  const pbs: Record<string, PersonalBest> = data ? JSON.parse(data) : {};

  if (exercise) {
    const key = exercise.toLowerCase().trim();
    const pb = pbs[key];
    return NextResponse.json(pb || null);
  }

  return NextResponse.json(pbs);
}
