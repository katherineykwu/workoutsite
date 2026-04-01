// API route: GET and POST /api/routines
// Works locally (JSON files) and on Netlify (Blobs) automatically
import { NextRequest, NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { Routine } from "@/lib/types";

const STORE_KEY = "routines";

async function readRoutines(): Promise<Routine[]> {
  const data = await getData(STORE_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

async function writeRoutines(routines: Routine[]): Promise<void> {
  await setData(STORE_KEY, JSON.stringify(routines, null, 2));
}

// Force dynamic — never cache these responses
export const dynamic = "force-dynamic";

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
    return NextResponse.json(found ? [found] : []);
  }

  return NextResponse.json(routines);
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
  return NextResponse.json({ success: true });
}
