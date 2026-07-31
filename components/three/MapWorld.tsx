"use client";

import { Suspense } from "react";
import { ContactShadows } from "@react-three/drei";
import PaintedTerrain, { CoastalWater } from "./PaintedTerrain";
import { SoftClouds, DustMotes } from "./MapProps";
import { GlacialRiver } from "./NatureProps";
import {
  ScannedRockField,
  PhotorealPineBillboards,
} from "./ScannedNature";
import BicheonCastle from "./BicheonCastle";
import MapCameraController from "./MapCamera";

function SceneLights() {
  return (
    <>
      {/* Pure obsidian void — no HDR sky (was washing the scene light/blue) */}
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 28, 72]} />
      <ambientLight intensity={0.48} color="#2a241c" />
      <hemisphereLight args={["#4a4030", "#050508", 0.55]} />
      <directionalLight
        castShadow
        position={[24, 38, 16]}
        intensity={3.1}
        color="#e8c878"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={130}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-18, 12, -14]}
        intensity={0.4}
        color="#203040"
      />
      <pointLight
        position={[1, 12, 4]}
        color="#ffd6a0"
        intensity={7}
        distance={45}
        decay={2}
      />
    </>
  );
}

export default function MapWorld() {
  return (
    <>
      <SceneLights />
      <MapCameraController />
      {/* Keep + terrain mount even if scanned rocks/pines are still loading */}
      <Suspense fallback={null}>
        <PaintedTerrain />
        <CoastalWater />
        <GlacialRiver />
        <BicheonCastle />
        <ContactShadows
          position={[1, 0.2, 1]}
          opacity={0.45}
          scale={28}
          blur={2.4}
          far={18}
          color="#1a2018"
        />
        <SoftClouds />
        <DustMotes />
      </Suspense>
      <Suspense fallback={null}>
        <ScannedRockField key="rocks-v2" />
        <PhotorealPineBillboards key="pines-v2" count={220} />
      </Suspense>
    </>
  );
}
