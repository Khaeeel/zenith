/** Exact CSV headers required for member import (match members table). */
export const MEMBER_CSV_REQUIRED_HEADERS = [
  "ign",
  "role",
  "power_score",
  "class",
] as const;

/** Columns allowed in member CSV (`class_id` is an alias for `class`). */
export const MEMBER_CSV_ALLOWED_HEADERS = [
  ...MEMBER_CSV_REQUIRED_HEADERS,
  "class_id",
] as const;

/** Stable slug from IGN for auto-generated ign_id. */
export function ignToId(ign: string, fallback = "x"): string {
  const base = ign
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `member-${fallback.slice(-8)}`;
}

/** Pick a unique ign_id within a clan given already-used ids. */
export function allocateIgnId(
  ign: string,
  used: Set<string>,
  fallback = "x",
): string {
  const base = ignToId(ign, fallback);
  let candidate = base;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

/** Minimal quoted-CSV parser. */

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

export function csvHeaderNames(text: string): string[] {
  const first = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .find(Boolean);
  if (!first) return [];
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < first.length; i++) {
    const ch = first[i];
    if (ch === '"') {
      if (inQuotes && first[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim().toLowerCase());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim().toLowerCase());
  return out;
}
