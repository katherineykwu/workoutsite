// API route: GET and POST /api/routines
import { NextRequest, NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { Routine } from "@/lib/types";

const STORE_KEY = "routines";
export const dynamic = "force-dynamic";

// Headers to prevent any caching (browser, CDN, Netlify)
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
};

async function readRoutines(): Promise<Routine[]> {
  const data = await getData(STORE_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

async function writeRoutines(routines: Routine[]): Promise<void> {
  await setData(STORE_KEY, JSON.stringify(routines, null, 2));
}

// GET /api/routines
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";
  const id = searchParams.get("id");

  let routines = await readRoutines();
  routines.sort((a, b) => b.weekStart.localeCompare(a.weekStart));

  if (publishedOnly) {
    routines = routines.filter((r) => r.published);
  }

  if (id) {
    const found = routines.find((r) => r.id === id);
    return NextResponse.json(found ? [found] : [], { headers: NO_CACHE_HEADERS });
  }

  return NextResponse.json(routines, { headers: NO_CACHE_HEADERS });
}

// POST /api/routines
export async function POST(request: NextRequest) {
  const routine: Routine = await request.json();
  const routines = await readRoutines();

  const index = routines.findIndex((r) => r.id === routine.id);
  if (index >= 0) {
    routines[index] = routine;
  } else {
    routines.push(routine);
  }

  await writeRoutines(routines);
  return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
}
