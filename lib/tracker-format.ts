/** Shared formatters (no DB) — used by tracker queries and UI */

export type HierarchyRole =
  | "Clan Leader"
  | "Elder"
  | "Master Protector"
  | "Member";

export type TrackerPlayer = {
  id: string;
  name: string;
  power: number;
  role: HierarchyRole;
  title?: string;
  online?: boolean;
  photo?: string;
};

export function formatPower(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function relativeTime(date: Date | string, now = new Date()) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
