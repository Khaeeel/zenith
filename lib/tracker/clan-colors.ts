/**
 * Per-clan chart colors keyed by Clan.slug (see prisma seed / import scripts).
 * Edit this map to assign brand colors — e.g. Zenith = red, TGO = blue.
 * Clans without an entry fall back to DEFAULT_CLAN_CHART_PALETTE by rank index.
 *
 * Zenith-family clans intentionally use widely separated hues (not a red/pink ramp)
 * so they stay distinguishable on charts and in the legend.
 */
export const CLAN_CHART_COLORS: Record<string, string> = {
  zenith: "#e11d48", // red
  "zenith-luna": "#f59e0b", // amber
  "zenith-nova": "#84cc16", // lime
  "zenith-sza": "#8b5cf6", // violet
  "zenith-xeno": "#14b8a6", // teal
  hofeless: "#34d399", // mint green
  "level-build": "#f97316", // orange
  mwantedph: "#22d3ee", // cyan
  nocturnus: "#6366f1", // indigo
  brawlers: "#ec4899", // magenta/pink
  tgo: "#3b82f6", // blue
  celestial: "#eab308", // gold/yellow
};

/** Cycled when a clan slug has no custom color. */
export const DEFAULT_CLAN_CHART_PALETTE = [
  "#d4af37", // gold
  "#60a5fa", // sky
  "#4ade80", // green
  "#f472b6", // pink
  "#facc15", // yellow
  "#2dd4bf", // teal
  "#c084fc", // purple
  "#fb923c", // orange
  "#94a3b8", // slate
  "#f87171", // coral
] as const;

export function getClanChartColor(slug: string, index = 0): string {
  return (
    CLAN_CHART_COLORS[slug] ??
    DEFAULT_CLAN_CHART_PALETTE[index % DEFAULT_CLAN_CHART_PALETTE.length]
  );
}
