"use client";

import { useState, type ReactNode } from "react";
import { formatPower, type TrackerPlayer } from "@/lib/tracker-data";

function Avatar({
  name,
  size = "md",
  gold = false,
}: {
  name: string;
  size?: "md" | "lg";
  gold?: boolean;
}) {
  const dim = size === "lg" ? "h-16 w-16 sm:h-20 sm:w-20" : "h-12 w-12";
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${dim} ${
        gold
          ? "border-2 border-[#f0d060] shadow-[0_0_18px_rgba(240,208,96,0.45)]"
          : "border border-white/25"
      }`}
      style={{
        background:
          "linear-gradient(145deg, #2a3548 0%, #121820 55%, #0a1018 100%)",
      }}
    >
      <div className="flex h-full w-full items-center justify-center font-display text-lg text-[#c9d4e8]">
        {name.slice(0, 1)}
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25), transparent 50%)",
        }}
      />
    </div>
  );
}

function StatusDot({ online }: { online?: boolean }) {
  return (
    <span
      className={`absolute top-2 right-2 h-2 w-2 rounded-full ${
        online
          ? "bg-[#3dff7a] shadow-[0_0_8px_rgba(61,255,122,0.7)]"
          : "bg-[#ff4d4d] shadow-[0_0_8px_rgba(255,77,77,0.5)]"
      }`}
      title={online ? "Online" : "Offline"}
    />
  );
}

function PowerLine({ power }: { power: number }) {
  return (
    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#7ec8ff]">
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 shrink-0 text-white/80"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M8 1.5 2.5 4v4.2c0 3.4 2.3 6.5 5.5 7.3 3.2-.8 5.5-3.9 5.5-7.3V4L8 1.5Z"
        />
      </svg>
      {formatPower(power)}
    </p>
  );
}

function LeaderCard({ player }: { player: TrackerPlayer }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="pointer-events-none absolute -inset-3 rounded-sm opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(80,140,220,0.35), transparent 70%)",
        }}
      />
      <div className="relative flex items-center gap-4 border border-white/15 bg-[rgba(18,24,36,0.92)] px-4 py-4 shadow-[0_0_30px_rgba(60,120,200,0.2)] sm:px-5">
        <StatusDot online={player.online} />
        <Avatar name={player.name} size="lg" gold />
        <div className="min-w-0 pr-4">
          <p className="text-sm text-white/70">
            Leader{" "}
            <span className="font-semibold text-white">{player.name}</span>
          </p>
          <PowerLine power={player.power} />
        </div>
      </div>
    </div>
  );
}

function RankCard({
  player,
  showTitle,
}: {
  player: TrackerPlayer;
  showTitle?: boolean;
}) {
  return (
    <div className="relative flex items-center gap-3 border border-white/10 bg-[rgba(16,22,34,0.9)] px-3 py-2.5">
      <StatusDot online={player.online} />
      <Avatar name={player.name} />
      <div className="min-w-0 pr-3">
        <p className="truncate text-sm font-medium text-white">{player.name}</p>
        <PowerLine power={player.power} />
        {showTitle ? (
          <p className="mt-0.5 truncate text-xs text-white/45">
            {player.title ?? player.role}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BranchSection({
  label,
  count,
  defaultOpen = true,
  children,
}: {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border border-white/10 bg-[rgba(22,28,40,0.95)] px-4 py-2.5 text-left transition hover:bg-[rgba(30,38,52,0.95)]"
      >
        <span className="text-sm font-medium text-white/90">
          {label}{" "}
          <span className="text-white/50">({count})</span>
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-white/60 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
          />
        </svg>
      </button>
      {open ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function TreeStem({ tall = false }: { tall?: boolean }) {
  return (
    <div className="flex justify-center" aria-hidden>
      <div
        className={`w-px bg-gradient-to-b from-[#5a7aa0]/80 to-[#5a7aa0]/25 ${
          tall ? "h-8" : "h-5"
        }`}
      />
    </div>
  );
}

function TreeFork() {
  return (
    <div className="relative mx-auto mb-2 h-6 w-full max-w-3xl" aria-hidden>
      <div className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-[#5a7aa0]/60" />
      <div className="absolute top-3 left-[12%] right-[12%] h-px bg-[#5a7aa0]/45" />
      <div className="absolute top-3 left-[12%] h-3 w-px bg-[#5a7aa0]/45" />
      <div className="absolute top-3 right-[12%] h-3 w-px bg-[#5a7aa0]/45" />
      <div className="absolute top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-[#5a7aa0]/45" />
    </div>
  );
}

export default function ClanHierarchy({
  members,
}: {
  members: TrackerPlayer[];
}) {
  const leader = members.find((m) => m.role === "Clan Leader");
  const elders = members.filter((m) => m.role === "Elder");
  const protectors = members.filter((m) => m.role === "Master Protector");
  const regular = members.filter((m) => m.role === "Member");

  return (
    <div className="relative">
      {leader ? (
        <div className="relative z-10">
          <LeaderCard player={leader} />
        </div>
      ) : null}

      <TreeStem />
      <TreeFork />

      <BranchSection label="Elder" count={elders.length} defaultOpen>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {elders.map((p) => (
            <RankCard key={p.id} player={p} showTitle />
          ))}
        </div>
      </BranchSection>

      <TreeStem tall />

      <BranchSection
        label="Master Protector"
        count={protectors.length}
        defaultOpen
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {protectors.map((p) => (
            <RankCard key={p.id} player={p} showTitle />
          ))}
        </div>
      </BranchSection>

      <TreeStem tall />

      <BranchSection label="Clan Member" count={regular.length} defaultOpen>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {regular.map((p) => (
            <RankCard key={p.id} player={p} />
          ))}
        </div>
      </BranchSection>
    </div>
  );
}
