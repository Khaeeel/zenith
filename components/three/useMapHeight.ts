"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  MAP_SIZE,
  MAP_SEGMENTS,
  MAX_DISPLACEMENT,
  fbm,
  bicheonHeightNorm,
  bicheonWorldHeight,
} from "@/lib/mapWorld";

/**
 * Recreated Bicheon terrain — vertex-colored biomes, no map screenshot.
 * Layout: N mountain wall, E ridges, center castle basin, S valleys, SW coast.
 */
export function useBicheonTerrain(): THREE.PlaneGeometry {
  return useMemo(() => {
    const segs = Math.min(MAP_SEGMENTS, 256);
    const geo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);

    const cSnow = new THREE.Color("#e8eef6");
    const cRock = new THREE.Color("#8a909c");
    const cRockDark = new THREE.Color("#5c6470");
    const cRockRed = new THREE.Color("#8a6a5a");
    const cForest = new THREE.Color("#3d8f4a");
    const cGrass = new THREE.Color("#6cb85a");
    const cGrassBright = new THREE.Color("#8fd46a");
    const cLime = new THREE.Color("#a8d85a");
    const cPath = new THREE.Color("#c9b58a");
    const cSand = new THREE.Color("#d4bc7a");
    const cDesert = new THREE.Color("#c9a86a");
    const cWater = new THREE.Color("#3aa8b8");
    const cCoast = new THREE.Color("#5a9aaa");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const nx = x / MAP_SIZE;
      const nz = z / MAP_SIZE;
      const n = fbm(nx * 2.8 + 4, nz * 2.8 + 9);
      const h = bicheonHeightNorm(x, z);
      pos.setY(i, h * MAX_DISPLACEMENT * 0.95);

      const riverPath =
        Math.abs(nz - 0.42 - Math.sin(nx * 3.2) * 0.08) * 3.2;
      const river = Math.max(0, 1 - riverPath) * 0.55;
      const coast = Math.max(0, -nx * 0.55 + nz * 0.5 - 0.08);
      // Keep the fortress bailey clear of water / grass paint — stone pad only
      const keepDist = Math.hypot(x - 1, z - 1);

      const col = new THREE.Color();
      if (keepDist < 8.5) {
        col.set("#6a655c").lerp(new THREE.Color("#4a463e"), n * 0.45);
      } else if (keepDist < 13) {
        const t = (keepDist - 8.5) / 4.5;
        col.set("#6a655c").lerp(new THREE.Color("#5a7050"), t);
      } else if (h < 0.1 || river > 0.35) {
        col.copy(cWater);
      } else if (coast > 0.25 && h < 0.28) {
        col.copy(cCoast).lerp(cSand, 0.4);
      } else if (nx > 0.28 && nz < 0.05 && h > 0.2 && h < 0.55) {
        col.copy(cDesert).lerp(cSand, n * 0.4);
      } else if (nx < -0.15 && nz < -0.15 && h > 0.4) {
        // NW Demon Bull reddish rock
        col.copy(cRockRed).lerp(cRockDark, n * 0.5);
      } else if (h > 0.72) {
        col.copy(cSnow);
      } else if (h > 0.52) {
        col.copy(cRock).lerp(cRockDark, n);
      } else if (nz > 0.2 && Math.abs(nx) < 0.2 && h < 0.35) {
        // Ginkgo valley lime
        col.copy(cLime).lerp(cGrassBright, n * 0.5);
      } else if (h > 0.34) {
        col.copy(cForest).lerp(cGrass, n * 0.5);
      } else {
        col.copy(cGrassBright).lerp(cGrass, n * 0.4);
        const path =
          Math.abs(Math.hypot(nx, nz - 0.15) - 0.22) < 0.035 ||
          Math.abs(Math.hypot(nx - 0.15, nz) - 0.18) < 0.03;
        if (path) col.lerp(cPath, 0.65);
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // Ensure sampler stays in sync (already set in mapWorld; reinforce)
    void bicheonWorldHeight;

    return geo;
  }, []);
}
