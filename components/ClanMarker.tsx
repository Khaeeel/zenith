"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Clan } from "@/lib/clans";

type ClanMarkerProps = {
  clan: Clan;
  visible: boolean;
  index: number;
};

export default function ClanMarker({ clan, visible, index }: ClanMarkerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${clan.x}%`, top: `${clan.y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={
        visible
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0 }
      }
      transition={{
        duration: 0.55,
        delay: visible ? index * 0.08 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <button
        type="button"
        className="group relative flex flex-col items-center outline-none"
        aria-label={clan.name}
      >
        {/* Pulse rings */}
        <span className="pointer-events-none absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2">
          <span className="animate-pulse-ring absolute inset-0 rounded-full border border-gold/70" />
          <span
            className="animate-pulse-ring absolute inset-0 rounded-full border border-gold-bright/50"
            style={{ animationDelay: "0.8s" }}
          />
        </span>

        {/* Core pin */}
        <span
          className={`relative z-10 h-3.5 w-3.5 rounded-full border-2 border-gold-bright bg-gold shadow-[0_0_12px_rgba(240,208,96,0.8)] transition-transform duration-300 ${
            hovered ? "scale-150" : "scale-100"
          }`}
        />

        {/* Always-visible name label */}
        <span
          className={`mt-2 max-w-[140px] rounded border border-gold/30 bg-black/75 px-2 py-1 text-center font-display text-[10px] leading-tight tracking-wide text-gold-bright backdrop-blur-sm transition-all duration-300 sm:text-xs ${
            hovered
              ? "border-gold/70 bg-black/90 gold-glow scale-105"
              : ""
          }`}
        >
          {clan.name}
        </span>
      </button>

      {/* Hover card */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="pointer-events-none absolute top-full left-1/2 z-30 mt-3 w-52 -translate-x-1/2"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="gold-border rounded-lg bg-obsidian/95 p-3 backdrop-blur-md">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-gold-bright">✦</span>
                <p className="font-display text-sm font-semibold tracking-wide text-gold-bright">
                  {clan.name}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-foreground/70">
                {clan.tagline}
              </p>
              <div className="mt-2 border-t border-gold/20 pt-2">
                <p className="text-[10px] tracking-wider text-gold-dim uppercase">
                  ARC · Zenith Coalition
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
