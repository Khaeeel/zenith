import { NextResponse } from "next/server";
import {
  getAlliancesForFilter,
  getClansForList,
  getServersAndRegions,
} from "@/lib/tracker/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [clans, { servers, regions }, alliances] = await Promise.all([
      getClansForList(),
      getServersAndRegions(),
      getAlliancesForFilter(),
    ]);
    return NextResponse.json({ clans, servers, regions, alliances });
  } catch {
    return NextResponse.json({
      clans: [],
      servers: [],
      regions: [],
      alliances: [],
    });
  }
}
