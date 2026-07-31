"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import ManifestoSection from "@/components/ManifestoSection";
import ClanRunway from "@/components/ClanRunway";
import JoinCTA from "@/components/JoinCTA";
import JoinModal from "@/components/JoinModal";
import CustomCursor from "@/components/CustomCursor";
import ScrollHud from "@/components/ScrollHud";
import FilmGrain from "@/components/FilmGrain";
import Letterbox from "@/components/Letterbox";

const MapSection = dynamic(() => import("@/components/MapSection"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-[#050508]">
      <p className="font-display text-sm tracking-[0.35em] text-gold/50">
        Opening the realm…
      </p>
    </div>
  ),
});

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    window.scrollTo(0, 0);
    setReady(true);
    const refresh = () => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
        // Pin-spacers grew the page — unlock Lenis scroll limit
        (
          window as unknown as { __lenis?: { resize: () => void } }
        ).__lenis?.resize();
      });
    };
    // Staggered refresh — runway width + late WebGL mounts shift pin starts
    window.setTimeout(refresh, 200);
    window.setTimeout(refresh, 700);
    window.setTimeout(refresh, 1600);
  }, []);

  return (
    <main className="relative bg-obsidian">
      <Preloader onComplete={handlePreloaderComplete} />
      <CustomCursor />
      <ScrollHud ready={ready} />
      <FilmGrain />
      <Letterbox ready={ready} />

      <nav
        className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-5 py-4 transition-all duration-700 sm:px-8 ${
          ready
            ? "translate-y-0 bg-black/35 opacity-100 backdrop-blur-md"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <a href="#" className="magnetic flex items-center gap-3" data-magnetic>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.png"
            alt="ARC"
            className="h-9 w-9 object-contain"
          />
          <span className="font-display hidden text-xs tracking-[0.2em] text-gold-bright sm:inline">
            APEX RESISTANCE COALITION
          </span>
        </a>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="#territories"
            data-magnetic
            className="magnetic font-display text-[10px] tracking-widest text-gold/80 uppercase transition hover:text-gold-bright sm:text-xs"
          >
            Territories
          </a>
          <Link
            href="/contact"
            data-magnetic
            className="magnetic hidden font-display text-[10px] tracking-widest text-gold/80 uppercase transition hover:text-gold-bright md:inline md:text-xs"
          >
            Contact
          </Link>
          <Link
            href="/dashboard"
            data-magnetic
            className="magnetic font-display text-[10px] tracking-widest text-gold/80 uppercase transition hover:text-gold-bright sm:text-xs"
          >
            Dashboard
          </Link>
          <button
            type="button"
            data-magnetic
            onClick={() => setModalOpen(true)}
            className="magnetic rounded-full border border-gold/50 px-4 py-1.5 font-display text-[10px] tracking-widest text-gold uppercase transition hover:border-gold hover:bg-gold/10 sm:text-xs"
          >
            Join
          </button>
        </div>
      </nav>

      <Hero ready={ready} />
      <ManifestoSection ready={ready} />
      <ClanRunway ready={ready} />
      <MapSection ready={ready} />
      <JoinCTA onJoin={() => setModalOpen(true)} />

      <footer className="border-t border-gold/15 bg-black px-6 py-12 text-center">
        <p className="font-display text-xs tracking-[0.35em] text-gold-dim">
          APEX RESISTANCE COALITION
        </p>
        <p className="mt-2 text-[10px] tracking-wide text-foreground/40">
          MIR4 · Zenith · Unofficial fan community site
        </p>
      </footer>

      <JoinModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
