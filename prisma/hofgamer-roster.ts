import fs from "node:fs";
import path from "node:path";
import { ClanRole } from "@prisma/client";

export type HofGamerPlayer = {
  ign: string;
  classId: string;
  powerScore: bigint;
};

/** Map HofGamer class labels → our classId values. */
export function toClassId(raw: string): string {
  const key = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    warrior: "warrior",
    taoist: "taoist",
    arbalist: "arbalist",
    lancer: "lancer",
    sorcerer: "sorcerer",
    darkist: "darkist",
    lionheart: "lionheart",
    lionhart: "lionheart",
  };
  return map[key] ?? key.replace(/\s+/g, "_");
}

/** Minimal quoted-CSV parser (HofGamer export format). */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  if (lines.length < 2) return [];

  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };

  const headers = split(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = split(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim();
    });
    return row;
  });
}

export function loadHofGamerPlayers(
  csvPath = path.join(__dirname, "data", "hofgamer-zenith.csv"),
): HofGamerPlayer[] {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }
  return parseCsv(fs.readFileSync(csvPath, "utf8"))
    .map((r) => ({
      ign: r.player_name,
      classId: toClassId(r.class || ""),
      powerScore: BigInt(
        String(r.combat_power || "0").replace(/[^\d]/g, "") || "0",
      ),
    }))
    .filter((p) => p.ign.length > 0)
    .sort((a, b) =>
      a.powerScore > b.powerScore ? -1 : a.powerScore < b.powerScore ? 1 : 0,
    );
}

export function toMemberCreates(clanId: string, players: HofGamerPlayer[]) {
  return players.map((p, i) => ({
    clanId,
    ign: p.ign,
    role: i === 0 ? ClanRole.clan_leader : ClanRole.member,
    powerScore: p.powerScore,
    classId: p.classId,
  }));
}
