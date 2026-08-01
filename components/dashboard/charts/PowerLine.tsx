"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { getClanChartColor } from "@/lib/tracker/clan-colors";
import { formatPower } from "@/lib/tracker-format";

export type PowerLineClan = {
  id: string;
  slug: string;
  name: string;
  totalPower: number;
};

const VIEW_W = 520;
const VIEW_H = 220;
const PAD = { top: 18, right: 14, bottom: 28, left: 46 };
const POINT_R = 5.5;
const HIT_R = 16;
const SEG_HIT = 14;

type HoverTarget =
  | { kind: "point"; index: number }
  | { kind: "segment"; index: number };

function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step =
    (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.01; v += step) {
    ticks.push(v);
  }
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

export default function PowerLine({ clans }: { clans: PowerLineClan[] }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [hover, setHover] = useState<HoverTarget | null>(null);
  const glowId = useId();

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    setPathLen(el.getTotalLength());
  }, [clans]);

  if (clans.length === 0) {
    return (
      <p className="px-5 py-8 text-sm text-[rgba(242,239,230,0.4)]">
        No clan power data yet.
      </p>
    );
  }

  const colored = clans.map((clan, i) => ({
    ...clan,
    color: getClanChartColor(clan.slug, i),
  }));

  const maxPower = Math.max(...colored.map((c) => c.totalPower), 1);
  const yMax = niceTicks(maxPower).at(-1) ?? maxPower;
  const yTicks = niceTicks(yMax);

  const plotW = VIEW_W - PAD.left - PAD.right;
  const plotH = VIEW_H - PAD.top - PAD.bottom;
  const n = colored.length;

  const points = colored.map((clan, i) => {
    const x =
      n === 1
        ? PAD.left + plotW / 2
        : PAD.left + (i / (n - 1)) * plotW;
    const y = PAD.top + plotH - (clan.totalPower / yMax) * plotH;
    return { ...clan, x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const activeIndex =
    hover?.kind === "point"
      ? hover.index
      : hover?.kind === "segment"
        ? hover.index
        : null;
  const active = activeIndex != null ? points[activeIndex] : null;

  const tipX = active
    ? Math.min(Math.max((active.x / VIEW_W) * 100, 12), 88)
    : 50;
  const tipY = active
    ? Math.max(((active.y - 14) / VIEW_H) * 100, 8)
    : 0;

  return (
    <div className="power-line px-3 py-4 sm:px-5 sm:py-5">
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label="Top clans by power line chart"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <filter
              id={glowId}
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid */}
          {yTicks.map((tick) => {
            const y = PAD.top + plotH - (tick / yMax) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={VIEW_W - PAD.right}
                  y2={y}
                  stroke="rgba(212,175,55,0.12)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#8a7028"
                  style={{
                    fontSize: 9,
                    fontFamily: "var(--font-display), sans-serif",
                  }}
                >
                  {formatPower(tick)}
                </text>
              </g>
            );
          })}

          {/* Base gold line — draw-in */}
          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="rgba(212,175,55,0.35)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            className={pathLen > 0 ? "power-line-draw" : undefined}
            style={
              pathLen > 0
                ? {
                    strokeDasharray: pathLen,
                    strokeDashoffset: pathLen,
                  }
                : { opacity: 0 }
            }
            pointerEvents="none"
          />

          {/* Colored segments + invisible hit strokes */}
          {points.slice(0, -1).map((from, i) => {
            const to = points[i + 1];
            const isHot =
              hover?.kind === "segment" && hover.index === i;
            const pointHot =
              activeIndex === i || activeIndex === i + 1;
            return (
              <g key={`${from.id}-${to.id}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={from.color}
                  strokeWidth={isHot ? 3.5 : pointHot ? 2.75 : 2.25}
                  strokeOpacity={isHot ? 1 : 0.85}
                  strokeLinecap="round"
                  className="power-line-seg"
                  style={{
                    transition:
                      "stroke-width 0.18s ease, stroke-opacity 0.18s ease",
                  }}
                  pointerEvents="none"
                />
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="transparent"
                  strokeWidth={SEG_HIT}
                  strokeLinecap="round"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHover({ kind: "segment", index: i })
                  }
                  onFocus={() =>
                    setHover({ kind: "segment", index: i })
                  }
                />
              </g>
            );
          })}

          {/* Points */}
          {points.map((p, i) => {
            const isActive = activeIndex === i;
            return (
              <g
                key={p.id}
                className="power-line-point"
                style={{ ["--i" as string]: i }}
              >
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={POINT_R + 5}
                    fill={p.color}
                    opacity={0.28}
                    pointerEvents="none"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? POINT_R * 1.45 : POINT_R}
                  fill={p.color}
                  stroke="rgba(8,12,22,0.9)"
                  strokeWidth={1.5}
                  filter={isActive ? `url(#${glowId})` : undefined}
                  className="power-line-dot"
                  pointerEvents="none"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={HIT_R}
                  fill="transparent"
                  className="cursor-pointer"
                  tabIndex={0}
                  role="img"
                  aria-label={`${p.name}: ${formatPower(p.totalPower)}`}
                  onMouseEnter={() =>
                    setHover({ kind: "point", index: i })
                  }
                  onFocus={() =>
                    setHover({ kind: "point", index: i })
                  }
                />
              </g>
            );
          })}
        </svg>

        {active && (
          <div
            className="power-line-tooltip pointer-events-none absolute z-10"
            style={{
              left: `${tipX}%`,
              top: `${tipY}%`,
              borderColor: active.color,
            }}
            role="tooltip"
          >
            <span
              className="power-line-tooltip-swatch"
              style={{ background: active.color }}
              aria-hidden
            />
            <span className="power-line-tooltip-name">{active.name}</span>
            <span className="power-line-tooltip-power">
              {formatPower(active.totalPower)}
            </span>
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#d4af37]/15 pt-3">
        {points.map((p) => (
          <li key={p.id} className="flex min-w-0 items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 shrink-0 border border-[#d4af37]/25"
              style={{ background: p.color }}
              aria-hidden
            />
            <Link
              href={`/dashboard/clans/${p.slug}`}
              className="truncate font-display tracking-wide text-[#f0d060] transition hover:underline"
            >
              {p.name}
            </Link>
            <span className="shrink-0 font-display text-[10px] tracking-wider text-[#d4af37]">
              {formatPower(p.totalPower)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
