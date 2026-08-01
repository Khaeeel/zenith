import type { RoleMixItem } from "@/lib/tracker/queries";
import { formatNumber } from "@/lib/tracker-format";

const COLORS: Record<string, string> = {
  clan_leader: "#f0d060",
  elder: "#d4af37",
  master_protector: "#c9a84a",
  member: "#8a7028",
};


function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export default function RoleDonut({ roles }: { roles: RoleMixItem[] }) {
  const total = roles.reduce((s, r) => s + r.count, 0);

  if (total === 0) {
    return (
      <p className="px-5 py-8 text-sm text-[rgba(242,239,230,0.4)]">
        No roster role data yet.
      </p>
    );
  }

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 68;
  const stroke = 18;

  let cursor = 0;
  const slices = roles
    .filter((r) => r.count > 0)
    .map((r) => {
      const sweep = (r.count / total) * 360;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      // Full circle edge case
      const path =
        sweep >= 359.9
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`
          : arcPath(cx, cy, r, start, end);
      return { ...r, path, color: COLORS[r.role] };
    });

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-5 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-[0_0_18px_rgba(212,175,55,0.12)]"
          aria-hidden
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(212,175,55,0.12)"
            strokeWidth={stroke}
          />
          {slices.map((s) => (
            <path
              key={s.role}
              d={s.path}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-[9px] tracking-[0.22em] text-[#8a7028] uppercase">
            Roster
          </p>
          <p className="mt-0.5 font-display text-xl text-[#f0d060]">
            {formatNumber(total)}
          </p>
        </div>
      </div>

      <ul className="w-full max-w-xs space-y-2.5">
        {roles.map((r) => {
          const pct = total ? Math.round((r.count / total) * 100) : 0;
          return (
            <li
              key={r.role}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 border border-[#d4af37]/30"
                  style={{ background: COLORS[r.role] }}
                  aria-hidden
                />
                <span className="truncate text-[rgba(242,239,230,0.65)]">
                  {r.label}
                </span>
              </span>
              <span className="shrink-0 font-display text-[11px] tracking-wider text-[#d4af37]">
                {formatNumber(r.count)}
                <span className="ml-1.5 text-[rgba(242,239,230,0.35)]">
                  {pct}%
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
