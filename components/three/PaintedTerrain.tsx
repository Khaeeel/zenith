"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { MAP_SIZE, MAX_DISPLACEMENT, bicheonHeightNorm } from "@/lib/mapWorld";

/**
 * 3D heightfield painted with the MIR4 Bicheon albedo.
 * Not a flat screenshot — displaced mesh + PBR lighting + props sit on top.
 */
export default function PaintedTerrain() {
  const map = useLoader(THREE.TextureLoader, "/assets/map.png");

  const geometry = useMemo(() => {
    const segs = 256;
    const geo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const uv = geo.attributes.uv as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = bicheonHeightNorm(x, z);
      // Slight micro-detail so painted surface doesn’t read as a flat stamp
      // (disabled under the fortress so bailey stays sealed)
      const keepDist = Math.hypot(x - 1, z - 1);
      const micro =
        keepDist < 10
          ? 0
          : Math.sin(x * 2.3 + z * 1.7) * 0.04 +
            Math.sin(x * 5.1 - z * 4.2) * 0.02;
      pos.setY(i, h * MAX_DISPLACEMENT * 0.95 + micro);

      // Map image: top of image = north (−Z in our layout)
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
    map.anisotropy = 8;
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.magFilter = THREE.LinearFilter;
  }, [map]);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        map={map}
        roughness={0.88}
        metalness={0.02}
        envMapIntensity={0.55}
      />
    </mesh>
  );
}

/** Dark coastal void around the landmass — reads as night ocean, not day bay. */
export function CoastalWater() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y =
      0.18 + Math.sin(clock.getElapsedTime() * 0.55) * 0.025;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[MAP_SIZE * 2.6, MAP_SIZE * 2.6]} />
        <meshStandardMaterial
          color="#0a1018"
          transparent
          opacity={0.85}
          roughness={0.55}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-MAP_SIZE * 0.32, 0.18, MAP_SIZE * 0.34]}
        receiveShadow
      >
        <circleGeometry args={[MAP_SIZE * 0.3, 96]} />
        <meshPhysicalMaterial
          color="#0e2830"
          roughness={0.2}
          metalness={0.25}
          transmission={0.08}
          thickness={0.5}
          transparent
          opacity={0.92}
          envMapIntensity={0.6}
        />
      </mesh>
    </group>
  );
}
