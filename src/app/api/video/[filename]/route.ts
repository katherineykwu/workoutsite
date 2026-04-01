// API route: GET /api/video/[filename] — serves uploaded videos from Netlify Blobs
import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const data = await getFile(filename);

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
