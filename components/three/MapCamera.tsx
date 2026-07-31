"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mapScroll } from "@/lib/mapWorld";

/** Castle is the hero — approach, dive, orbit the Zenith mega keep, pull wide. */
const CASTLE = new THREE.Vector3(1, 4.5, 1);

export default function MapCameraController() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(1, 3.5, 1));
  const targetPos = useRef(new THREE.Vector3(-5, 16, 24));
  const targetLook = useRef(new THREE.Vector3(1, 3.5, 1));

  useFrame((_, delta) => {
    const p = mapScroll.progress;
    const cam = camera as THREE.PerspectiveCamera;

    if (p < 0.2) {
      const t = p / 0.2;
      const ease = t * t * (3 - 2 * t);
      targetPos.current.set(
        THREE.MathUtils.lerp(-5, -7, ease),
        THREE.MathUtils.lerp(16, 13, ease),
        THREE.MathUtils.lerp(24, 20, ease),
      );
      targetLook.current.set(
        CASTLE.x,
        THREE.MathUtils.lerp(3.5, 5, ease),
        CASTLE.z,
      );
    } else if (p < 0.48) {
      const t = (p - 0.2) / 0.28;
      const ease = t * t * (3 - 2 * t);
      targetPos.current.set(
        THREE.MathUtils.lerp(-7, 9, ease),
        THREE.MathUtils.lerp(13, 10, ease),
        THREE.MathUtils.lerp(20, 14, ease),
      );
      targetLook.current.set(
        CASTLE.x,
        THREE.MathUtils.lerp(5, 6.5, ease),
        CASTLE.z + 1,
      );
    } else if (p < 0.72) {
      const t = (p - 0.48) / 0.24;
      const ang = -0.35 + t * 1.2;
      const r = THREE.MathUtils.lerp(16, 12, t);
      targetPos.current.set(
        CASTLE.x + Math.sin(ang) * r,
        THREE.MathUtils.lerp(10, 9, t),
        CASTLE.z + Math.cos(ang) * r,
      );
      targetLook.current.set(CASTLE.x, 6, CASTLE.z);
    } else {
      const t = (p - 0.72) / 0.28;
      const ease = t * t * (3 - 2 * t);
      targetPos.current.set(
        THREE.MathUtils.lerp(10, 0, ease),
        THREE.MathUtils.lerp(9, 22, ease),
        THREE.MathUtils.lerp(6, 26, ease),
      );
      targetLook.current.set(
        THREE.MathUtils.lerp(CASTLE.x, 0, ease),
        THREE.MathUtils.lerp(6, 1, ease),
        THREE.MathUtils.lerp(CASTLE.z, 0, ease),
      );
    }

    const lerp = 1 - Math.pow(0.0005, delta);
    cam.position.lerp(targetPos.current, lerp);
    look.current.lerp(targetLook.current, lerp);
    cam.lookAt(look.current);
    const close =
      p > 0.18 && p < 0.7
        ? THREE.MathUtils.smoothstep(p, 0.18, 0.35) *
          (1 - THREE.MathUtils.smoothstep(p, 0.62, 0.72))
        : 0;
    cam.fov = 44 - close * 6;
    cam.updateProjectionMatrix();
  });

  return null;
}
