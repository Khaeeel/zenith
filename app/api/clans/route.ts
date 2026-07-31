import { NextResponse } from "next/server";
import { getClansForJoin } from "@/lib/tracker/queries";

export async function GET() {
  try {
    const clans = await getClansForJoin();
    return NextResponse.json(clans);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
