// API route: GET, POST, and DELETE /api/templates — workout templates
import { NextRequest, NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { WorkoutTemplate } from "@/lib/types";

const STORE_KEY = "workout-templates";
export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
};

async function readTemplates(): Promise<WorkoutTemplate[]> {
  const data = await getData(STORE_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

async function writeTemplates(templates: WorkoutTemplate[]): Promise<void> {
  await setData(STORE_KEY, JSON.stringify(templates, null, 2));
}

// GET /api/templates — list all templates, newest first
export async function GET() {
  const templates = await readTemplates();
  templates.sort((a, b) => b.updatedAt - a.updatedAt);
  return NextResponse.json(templates, { headers: NO_CACHE_HEADERS });
}

// POST /api/templates — upsert by id
export async function POST(request: NextRequest) {
  const template: WorkoutTemplate = await request.json();
  const templates = await readTemplates();

  const index = templates.findIndex((t) => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }

  await writeTemplates(templates);
  return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
}

// DELETE /api/templates?id=... — remove by id
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400, headers: NO_CACHE_HEADERS });
  }
  const templates = await readTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  await writeTemplates(filtered);
  return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
}
