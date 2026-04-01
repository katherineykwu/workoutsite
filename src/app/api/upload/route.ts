// API route: POST /api/upload — handles video file uploads
// Works locally (saves to disk) and on Netlify (Blobs) automatically
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/store";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Create a unique filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}-${safeName}`;

  // Convert file to buffer and upload
  const bytes = await file.arrayBuffer();
  const url = await uploadFile(filename, Buffer.from(bytes), file.type);

  return NextResponse.json({ url });
}
