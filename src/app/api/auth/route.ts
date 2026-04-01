// API route: POST /api/auth — validates the trainer password
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correct = process.env.TRAINER_PASSWORD || "changeme123";

  if (password === correct) {
    // Return a simple token (the password hash isn't needed for this use case)
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
}
