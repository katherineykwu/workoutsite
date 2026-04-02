// API route: GET and POST /api/my-equipment — your available equipment
import { NextRequest, NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
};

const STORE_KEY = "my-equipment";

// GET /api/my-equipment — returns your selected equipment IDs
export async function GET() {
  const data = await getData(STORE_KEY);
  const equipment: string[] = data ? JSON.parse(data) : [];
  return NextResponse.json(equipment, { headers: NO_CACHE_HEADERS });
}

// POST /api/my-equipment — save your equipment selection
export async function POST(request: NextRequest) {
  const equipment: string[] = await request.json();
  await setData(STORE_KEY, JSON.stringify(equipment));
  return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
}
