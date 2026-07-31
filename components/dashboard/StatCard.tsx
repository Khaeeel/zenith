const ICONS = {
  players: (
    <path
      d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12Zm-7.5 8.5v-1.2A4.3 4.3 0 0 1 8.8 15h6.4a4.3 4.3 0 0 1 4.3 4.3v1.2M17 8a2.5 2.5 0 1 0-1-4.8M20.5 20.5v-.8A3.5 3.5 0 0 0 18 16.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  ),
  clans: (
    <path
      d="M12 3 5 6.5v5.2c0 4.2 2.9 8.1 7 9.3 4.1-1.2 7-5.1 7-9.3V6.5L12 3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  servers: (
    <>
      <rect
        x="4"
        y="4"
        width="16"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="4"
        y="14"
        width="16"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="7" r="1" fill="currentColor" />
      <circle cx="8" cy="17" r="1" fill="currentColor" />
    </>
  ),
  active: (
    <path
      d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  ),
  peace: (
    <path
      d="M12 21c4-3.2 7-6.4 7-10.2A7 7 0 0 0 5 10.8C5 14.6 8 17.8 12 21Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  power: (
    <path
      d="M13 2 5 13h6l-1 9 9-12h-6l0-8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
} as const;

export type StatIcon = keyof typeof ICONS;

export default function StatCard({
  label,
  value,
  icon = "clans",
  index,
}: {
  label: string;
  value: string;
  icon?: StatIcon;
  index?: number;
}) {
  return (
    <div className="hub-frame hub-frame-ornate group relative overflow-hidden p-5 transition duration-300 hover:shadow-[0_0_28px_rgba(212,175,55,0.18)]">
      <span className="hub-ornament-bottom" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(94,200,232,0.08), transparent 45%), radial-gradient(ellipse at 100% 0%, rgba(212,175,55,0.12), transparent 50%)",
        }}
      />
      <div className="relative flex items-start gap-4">
        <div className="relative flex h-14 w-12 shrink-0 items-center justify-center">
          <svg viewBox="0 0 40 48" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient
                id={`shieldGold-${label.replace(/\s+/g, "-")}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#f0d060" />
                <stop offset="100%" stopColor="#8a7020" />
              </linearGradient>
            </defs>
            <path
              d="M20 2 L36 8 V22 C36 34 28 42 20 46 C12 42 4 34 4 22 V8 Z"
              fill="rgba(212,175,55,0.08)"
              stroke={`url(#shieldGold-${label.replace(/\s+/g, "-")})`}
              strokeWidth="1.5"
            />
          </svg>
          <svg
            viewBox="0 0 24 24"
            className="relative h-5 w-5 text-[#f0d060]"
            aria-hidden
          >
            {ICONS[icon]}
          </svg>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-display text-[10px] tracking-[0.22em] text-[#c9a84a] uppercase">
            {typeof index === "number" ? `${index}. ` : null}
            {label}
          </p>
          <p className="mt-2 font-display text-2xl tracking-wide text-[#f0d060] sm:text-[1.75rem]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
