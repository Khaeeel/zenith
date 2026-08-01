export type LandmarkType =
  | "peak_fort"
  | "stone_temple"
  | "mountain_outpost"
  | "desert_ruins"
  | "pagoda"
  | "arena_ruins"
  | "town"
  | "valley_keep"
  | "spirit_grove"
  | "sacred_grove"
  | "cliff_fort"
  | "valley_shrine";

export type Clan = {
  id: string;
  name: string;
  /** Percentage position on the map (0–100) */
  x: number;
  y: number;
  tagline: string;
  landmark: LandmarkType;
};

export const CLANS: Clan[] = [
  {
    id: "luna",
    name: "Zenith LUNA",
    x: 14,
    y: 16,
    tagline: "Guardians of the northern peaks",
    landmark: "peak_fort",
  },
  {
    id: "tgo",
    name: "ᄀTGO",
    x: 30,
    y: 14,
    tagline: "Precision. Power. Dominance.",
    landmark: "stone_temple",
  },
  {
    id: "xeno",
    name: "Zenith XENO",
    x: 48,
    y: 12,
    tagline: "Beyond the frontier",
    landmark: "mountain_outpost",
  },
  {
    id: "brawlers",
    name: "名人堂 Brawlers",
    x: 78,
    y: 18,
    tagline: "Hall of Fame warriors",
    landmark: "desert_ruins",
  },
  {
    id: "levelbuild",
    name: "Level Build",
    x: 88,
    y: 38,
    tagline: "Forge your legend",
    landmark: "pagoda",
  },
  {
    id: "hofeless",
    name: "HOFeless",
    x: 72,
    y: 46,
    tagline: "Rise without limits",
    landmark: "arena_ruins",
  },
  {
    id: "nova",
    name: "Zenith NOVA",
    x: 62,
    y: 34,
    tagline: "A new star rises",
    landmark: "town",
  },
  {
    id: "mwantedph",
    name: "MWANTEDPH",
    x: 74,
    y: 70,
    tagline: "Most wanted. Most feared.",
    landmark: "valley_keep",
  },
  {
    id: "nocturnus",
    name: "• Nocturnus② •",
    x: 56,
    y: 78,
    tagline: "Hunters of the night",
    landmark: "spirit_grove",
  },
  {
    id: "celestial",
    name: "神Celestial",
    x: 42,
    y: 82,
    tagline: "Divine power incarnate",
    landmark: "sacred_grove",
  },
  {
    id: "zenith-sza",
    name: "Zenith Sza",
    x: 20,
    y: 72,
    tagline: "The unknown variable",
    landmark: "cliff_fort",
  },
];

export const MIR4_CLASSES = [
  { id: "warrior", name: "Warrior", icon: "⚔" },
  { id: "sorcerer", name: "Sorcerer", icon: "✦" },
  { id: "taoist", name: "Taoist", icon: "☯" },
  { id: "lancer", name: "Lancer", icon: "🔱" },
  { id: "arbalist", name: "Arbalist", icon: "🏹" },
  { id: "darkist", name: "Darkist", icon: "☠" },
  { id: "lionheart", name: "Lionheart", icon: "🦁" },
] as const;

export type Mir4Class = (typeof MIR4_CLASSES)[number]["id"];

export const TIMEZONES = [
  "UTC-12",
  "UTC-11",
  "UTC-10",
  "UTC-9",
  "UTC-8",
  "UTC-7",
  "UTC-6",
  "UTC-5",
  "UTC-4",
  "UTC-3",
  "UTC-2",
  "UTC-1",
  "UTC+0",
  "UTC+1",
  "UTC+2",
  "UTC+3",
  "UTC+4",
  "UTC+5",
  "UTC+6",
  "UTC+7",
  "UTC+8",
  "UTC+9",
  "UTC+10",
  "UTC+11",
  "UTC+12",
];
