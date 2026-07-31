"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 120;

export default function EmberParticles() {
  const mesh = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 6 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      speeds[i] = 0.2 + Math.random() * 0.6;
    }

    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const attr = mesh.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.5 + i) * 0.002;

      if (arr[i * 3 + 1] > 4) {
        arr[i * 3 + 1] = -2;
        arr[i * 3] = (Math.random() - 0.5) * 8;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#f0d060"
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
