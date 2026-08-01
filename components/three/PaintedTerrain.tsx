"use client";

import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { MAP_SIZE, MAX_DISPLACEMENT, bicheonHeightNorm } from "@/lib/mapWorld";

/**
 * 3D heightfield painted with the MIR4 Bicheon albedo.
 * Tuned for scroll FPS: lower segments, Lambert, no shadows.
 */
export default function PaintedTerrain() {
  const map = useLoader(THREE.TextureLoader, "/assets/map.png");

  const geometry = useMemo(() => {
    const segs = 96;
    const geo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const uv = geo.attributes.uv as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = bicheonHeightNorm(x, z);
      const keepDist = Math.hypot(x - 1, z - 1);
      const micro =
        keepDist < 10
          ? 0
          : Math.sin(x * 2.3 + z * 1.7) * 0.04 +
            Math.sin(x * 5.1 - z * 4.2) * 0.02;
      pos.setY(i, h * MAX_DISPLACEMENT * 0.95 + micro);

      const u = x / MAP_SIZE + 0.5;
      const v = 1 - (z / MAP_SIZE + 0.5);
      uv.setXY(i, u, v);
    }

    pos.needsUpdate = true;
    uv.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 2;
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.magFilter = THREE.LinearFilter;
  }, [map]);

  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial map={map} />
    </mesh>
  );
}

/** Dark coastal void around the landmass — static, cheap materials. */
export function CoastalWater() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[MAP_SIZE * 2.6, MAP_SIZE * 2.6]} />
        <meshBasicMaterial
          color="#0a1018"
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-MAP_SIZE * 0.32, 0.18, MAP_SIZE * 0.34]}
      >
        <circleGeometry args={[MAP_SIZE * 0.3, 32]} />
        <meshBasicMaterial color="#0e2830" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
