// API route: GET and POST /api/my-equipment — your available equipment + gym photos
import { NextRequest, NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
};

const STORE_KEY = "my-equipment";

interface MyEquipmentData {
  equipment: string[];
  gymPhotos: string[];
}

// GET /api/my-equipment
export async function GET() {
  const data = await getData(STORE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    // Handle legacy format (just an array) vs new format (object with equipment + photos)
    if (Array.isArray(parsed)) {
      return NextResponse.json({ equipment: parsed, gymPhotos: [] }, { headers: NO_CACHE_HEADERS });
    }
    return NextResponse.json(parsed, { headers: NO_CACHE_HEADERS });
  }
  return NextResponse.json({ equipment: [], gymPhotos: [] }, { headers: NO_CACHE_HEADERS });
}

// POST /api/my-equipment
export async function POST(request: NextRequest) {
  const body: MyEquipmentData = await request.json();
  await setData(STORE_KEY, JSON.stringify(body));
  return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
}
