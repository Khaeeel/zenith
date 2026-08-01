"use client";

import { Suspense } from "react";
import PaintedTerrain, { CoastalWater } from "./PaintedTerrain";
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
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 28, 72]} />
      <ambientLight intensity={0.62} color="#2a241c" />
      <hemisphereLight args={["#4a4030", "#050508", 0.65]} />
      {/* No castShadow — shadow maps were the main scroll hitch */}
      <directionalLight
        position={[24, 38, 16]}
        intensity={2.6}
        color="#e8c878"
      />
      <directionalLight
        position={[-18, 12, -14]}
        intensity={0.45}
        color="#203040"
      />
      <pointLight
        position={[1, 12, 4]}
        color="#ffd6a0"
        intensity={5.5}
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
      <Suspense fallback={null}>
        <PaintedTerrain />
        <CoastalWater />
        <GlacialRiver />
        <BicheonCastle />
      </Suspense>
      <Suspense fallback={null}>
        <ScannedRockField key="rocks-v2" />
        <PhotorealPineBillboards key="pines-v2" count={40} />
      </Suspense>
    </>
  );
}
