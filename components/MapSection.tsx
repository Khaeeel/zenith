"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { mapScroll } from "@/lib/mapWorld";

gsap.registerPlugin(ScrollTrigger);

const MapWorld = dynamic(() => import("./three/MapWorld"), { ssr: false });

export default function MapSection({ ready = true }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const setSizeRef = useRef<((w: number, h: number) => void) | null>(null);
  const [use3d, setUse3d] = useState(true);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [worldReady, setWorldReady] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setUse3d(false);
      mapScroll.progress = 1;
      mapScroll.markersVisible = true;
      setTitleOpacity(1);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Failsafe — never leave the sky hold covering the WebGL scene
    const t = window.setTimeout(() => setWorldReady(true), 1200);
    return () => window.clearTimeout(t);
  }, [ready]);

  // R3F often mounts at the default 300×150 before the pinned section has size —
  // keep the drawing buffer matched to the host.
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host || !use3d) return;

    const sync = () => {
      const w = Math.max(1, host.clientWidth || window.innerWidth);
      const h = Math.max(1, host.clientHeight || window.innerHeight);
      setSizeRef.current?.(w, h);
    };

    const ro = new ResizeObserver(sync);
    ro.observe(host);
    sync();
    const t = window.setTimeout(sync, 250);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
      window.removeEventListener("resize", sync);
    };
  }, [use3d, ready]);

  useEffect(() => {
    if (!ready || !sectionRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const el = sectionRef.current;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=210%",
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        refreshPriority: -2,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          el.style.zIndex = self.isActive ? "20" : "1";
          if (!self.isActive) {
            gsap.set(el, { clearProps: "position,top,left,width" });
          }
          // Pinning changes layout — force WebGL buffer resync
          const host = canvasHostRef.current;
          if (host && setSizeRef.current) {
            setSizeRef.current(
              Math.max(1, host.clientWidth || window.innerWidth),
              Math.max(1, host.clientHeight || window.innerHeight),
            );
          }
        },
        onUpdate: (self) => {
          mapScroll.progress = self.progress;
          mapScroll.markersVisible = self.progress > 0.15;
          if (self.progress < 0.1) {
            setTitleOpacity(self.progress / 0.1);
          } else if (self.progress > 0.82) {
            setTitleOpacity(Math.max(0, 1 - (self.progress - 0.82) / 0.18));
          } else {
            setTitleOpacity(1);
          }
          const night = Math.max(0, (self.progress - 0.78) / 0.22);
          el.style.setProperty("--map-night", String(night));
          el.style.setProperty("--map-entry", "0");
        },
        onLeaveBack: () => {
          gsap.set(el, { clearProps: "position,top,left,width,zIndex" });
        },
      });
    }, sectionRef);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#050508]"
      id="territories"
      style={{ ["--map-entry" as string]: "0" }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 35%, #16120e 0%, #050508 60%, #000000 100%)",
          opacity: worldReady ? 0 : 1,
          pointerEvents: "none",
          zIndex: worldReady ? 0 : 5,
        }}
      />

      {use3d ? (
        <div
          ref={canvasHostRef}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        >
          <Canvas
            style={{ width: "100%", height: "100%", display: "block" }}
            resize={{ scroll: false, debounce: 0, offsetSize: true }}
            shadows
            dpr={[1, 1.75]}
            camera={{ position: [-4, 18, 22], fov: 48, near: 0.1, far: 200 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: false,
              preserveDrawingBuffer: true,
            }}
            onCreated={({ gl, setSize }) => {
              gl.setClearColor("#050508", 1);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.25;
              gl.shadowMap.enabled = true;
              setSizeRef.current = setSize;
              const host = canvasHostRef.current;
              const w = Math.max(
                1,
                host?.clientWidth || window.innerWidth,
              );
              const h = Math.max(
                1,
                host?.clientHeight || window.innerHeight,
              );
              setSize(w, h);
              setWorldReady(true);
            }}
          >
            <MapWorld />
          </Canvas>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#050508]" />
      )}

      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
      <div
        className="pointer-events-none absolute inset-0 z-[12]"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 35%, #16120e 0%, #050508 60%, #000000 100%)",
          opacity: "var(--map-entry, 0)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[11] opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 35% 28% at 50% 42%, rgba(212,175,55,0.1), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[15] bg-obsidian"
        style={{ opacity: "var(--map-night, 0)" }}
      />

      <div
        className="pointer-events-none absolute top-8 right-0 left-0 z-30 flex flex-col items-center px-4"
        style={{ opacity: titleOpacity }}
      >
        <p className="font-display text-[10px] tracking-[0.4em] text-gold-dim uppercase sm:text-xs">
          Chapter 04 · Realm
        </p>
        <h2 className="font-display mt-2 text-2xl tracking-wide text-gold-bright sm:text-4xl">
          Zenith Fortress
        </h2>
        <p className="mt-2 max-w-lg text-center text-xs text-white/80 drop-shadow sm:text-sm">
          The limestone citadel of Zenith — scroll to fly the keep.
        </p>
      </div>

      <div className="pointer-events-none absolute top-4 left-4 z-30 h-12 w-12 border-t border-l border-gold/40" />
      <div className="pointer-events-none absolute top-4 right-4 z-30 h-12 w-12 border-t border-r border-gold/40" />
      <div className="pointer-events-none absolute bottom-4 left-4 z-30 h-12 w-12 border-b border-l border-gold/40" />
      <div className="pointer-events-none absolute bottom-4 right-4 z-30 h-12 w-12 border-b border-r border-gold/40" />

      <div
        className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-center"
        style={{ opacity: titleOpacity > 0.4 ? 0.65 : 0 }}
      >
        <p className="text-[10px] tracking-[0.3em] text-gold-dim uppercase">
          Keep scrolling
        </p>
      </div>
    </section>
  );
}
