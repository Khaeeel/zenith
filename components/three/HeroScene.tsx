"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { heroScroll } from "@/lib/mapWorld";

/** Mount children after N frames so the emblem paints first without a hitch. */
function Deferred({ children, after = 3 }: { children: ReactNode; after?: number }) {
  const [ready, setReady] = useState(false);
  const frames = useRef(0);
  useFrame(() => {
    if (ready) return;
    frames.current += 1;
    if (frames.current >= after) setReady(true);
  });
  return ready ? <>{children}</> : null;
}

/**
 * Brand emblem — real ARC logo (upright) with cinematic gold frame.
 * Logo is the one kept asset; city/motion are procedural cinema.
 */
function ArcEmblem() {
  const group = useRef<THREE.Group>(null);
  const logoMat = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useTexture("/assets/logo.png");
  const { pointer } = useThree();

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const p = heroScroll.progress;

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      pointer.x * 0.22 + t * 0.08 * (1 - p),
      0.05,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -pointer.y * 0.1 + p * 0.25,
      0.05,
    );
    // Never roll — keeps the A upright
    group.current.rotation.z = 0;

    const scale = THREE.MathUtils.lerp(1, 2.2, Math.min(1, p * 1.15));
    group.current.scale.setScalar(scale);
    group.current.position.z = THREE.MathUtils.lerp(0, -4.5, p);
    group.current.position.y =
      1.2 + Math.sin(t * 0.55) * 0.04 + THREE.MathUtils.lerp(0, 1.6, p);

    if (logoMat.current) {
      logoMat.current.opacity = Math.max(0, 1 - Math.max(0, p - 0.4) / 0.55);
    }
  });

  return (
    <group ref={group} position={[0, 1.2, 0]}>
      <mesh position={[0, 0, -0.04]}>
        <circleGeometry args={[1.15, 32]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <planeGeometry args={[2.15, 2.15]} />
        <meshBasicMaterial
          ref={logoMat}
          map={texture}
          transparent
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <torusGeometry args={[1.22, 0.035, 8, 48]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Cinematic fortress city — mood of the reference, zero photo textures. */
function FortressCity() {
  const group = useRef<THREE.Group>(null);

  const buildings = useMemo(() => {
    const list: {
      x: number;
      z: number;
      w: number;
      h: number;
      d: number;
      tip: boolean;
      glow: boolean;
    }[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const r = 5.5 + (i % 7) * 1.1 + Math.sin(i * 3.1) * 0.8;
      const h = 1.8 + (i % 9) * 0.85;
      list.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r - 3,
        w: 0.35 + (i % 4) * 0.15,
        h,
        d: 0.35 + (i % 3) * 0.12,
        tip: i % 3 === 0,
        glow: h > 3.5 && i % 2 === 0,
      });
    }
    // Inner keep cluster
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      list.push({
        x: Math.cos(a) * 2.2,
        z: Math.sin(a) * 2.2 - 2,
        w: 0.5,
        h: 3.5 + (i % 3),
        d: 0.5,
        tip: true,
        glow: i % 2 === 0,
      });
    }
    return list;
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const p = heroScroll.progress;
    // Keep city in the background / lower third — never over the title
    group.current.position.y = -4.2 - p * 6;
    group.current.position.z = -4 + p * 10;
    group.current.rotation.y = p * 0.4;
  });

  return (
    <group ref={group}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <circleGeometry args={[22, 32]} />
        <meshBasicMaterial color="#090b10" />
      </mesh>

      {/* Curtain wall ring */}
      <mesh position={[0, 0.9, -2]}>
        <cylinderGeometry args={[7.2, 7.5, 1.8, 32, 1, true]} />
        <meshBasicMaterial color="#151820" side={THREE.DoubleSide} />
      </mesh>

      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#1a1e28" : "#12151c"} />
          </mesh>
          {b.tip && (
            <mesh position={[0, b.h / 2 + 0.35, 0]}>
              <coneGeometry args={[b.w * 0.7, 0.7, 4]} />
              <meshBasicMaterial color="#0c0e14" />
            </mesh>
          )}
          {/* Cheap window glow — emissive plane instead of pointLight */}
          {b.glow && (
            <mesh position={[0, b.h * 0.15, b.d * 0.51]}>
              <planeGeometry args={[b.w * 0.45, 0.12]} />
              <meshBasicMaterial
                color="#d4af37"
                transparent
                opacity={0.55}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Hanging banners */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 4.5, 2.5, 1]}>
          <mesh>
            <boxGeometry args={[0.06, 2.8, 0.8]} />
            <meshBasicMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <planeGeometry args={[0.55, 0.55]} />
            <meshBasicMaterial color="#d4af37" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GodRays() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const p = heroScroll.progress;
    group.current.rotation.z = Math.sin(t * 0.15) * 0.08;
    group.current.children.forEach((c, i) => {
      const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = (0.045 + Math.sin(t * 0.8 + i) * 0.02) * (1 - p * 0.7);
    });
  });

  return (
    <group ref={group} position={[2, 6, -4]} rotation={[0.4, -0.3, 0.2]}>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[(i - 1.5) * 0.7, 0, 0]} rotation={[0, 0, (i - 1.5) * 0.05]}>
          <coneGeometry args={[0.85 + i * 0.06, 14, 3, 1, true]} />
          <meshBasicMaterial
            color="#d4af37"
            transparent
            opacity={0.05}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function OrbitRings() {
  const g1 = useRef<THREE.Mesh>(null);
  const g2 = useRef<THREE.Mesh>(null);
  const g3 = useRef<THREE.Mesh>(null);
  const refs = [g1, g2, g3];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = heroScroll.progress;
    const spin = 1 + p * 4;
    refs.forEach((r, i) => {
      if (!r.current) return;
      r.current.rotation.z = t * (0.15 + i * 0.08) * spin * (i % 2 ? -1 : 1);
      // Mild tip only — keep readable as rings around the A
      r.current.rotation.x = 0.15 + i * 0.08 + p * 0.5;
      r.current.position.y = 1.15 + THREE.MathUtils.lerp(0, 1.5, p);
      r.current.scale.setScalar(1 + i * 0.2 + p * (1.8 + i * 0.4));
      const mat = r.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0.03, 0.28 * (1 - p * 0.9));
    });
  });

  return (
    <group>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} position={[0, 1.15, 0]}>
          <ringGeometry args={[1.55 + i * 0.32, 1.6 + i * 0.32, 48]} />
          <meshBasicMaterial
            color={i === 1 ? "#f0d060" : "#d4af37"}
            transparent
            opacity={0.28}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function EmberStorm() {
  const points = useRef<THREE.Points>(null);
  const count = 120;
  const velocities = useMemo(() => {
    const v = new Float32Array(count);
    for (let i = 0; i < count; i++) v[i] = 0.15 + (i % 5) * 0.05;
    return v;
  }, []);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 16;
      a[i * 3 + 1] = Math.random() * 10 - 2;
      a[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    return a;
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    const p = heroScroll.progress;
    const dt = Math.min(delta, 0.05);
    const rush = p > 0.2 ? 1 : 0.15;
    const speed = (0.4 + p * 18) * rush * dt;
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 2] += speed;
      arr[i3 + 1] += velocities[i] * dt;
      if (arr[i3 + 2] > 5 || arr[i3 + 1] > 10) {
        arr[i3 + 2] = -12 - Math.random() * 8;
        arr[i3] = (Math.random() - 0.5) * 16;
        arr[i3 + 1] = Math.random() * 6 - 1;
      }
    }
    attr.needsUpdate = true;
    (points.current.material as THREE.PointsMaterial).opacity = 0.4 + p * 0.5;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#f0d060"
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function CinemaCamera() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.0, 0));
  const target = useRef(new THREE.Vector3(0, 0.6, 6.2));
  const lastFov = useRef(-1);

  useFrame(() => {
    const p = heroScroll.progress;
    const cam = camera as THREE.PerspectiveCamera;
    // Start framed on upper emblem; dive through on scroll
    target.current.set(
      Math.sin(p * Math.PI) * 0.8,
      THREE.MathUtils.lerp(0.65, 0.2, p),
      THREE.MathUtils.lerp(6.2, 0.2, p),
    );
    cam.position.lerp(target.current, 0.1);
    look.current.set(
      0,
      THREE.MathUtils.lerp(1.1, 2.5, p),
      THREE.MathUtils.lerp(-0.5, -6, p),
    );
    cam.lookAt(look.current);
    const nextFov = THREE.MathUtils.lerp(40, 52, p);
    if (Math.abs(nextFov - lastFov.current) > 0.05) {
      cam.fov = nextFov;
      cam.updateProjectionMatrix();
      lastFov.current = nextFov;
    }
  });

  return null;
}

export default function HeroScene() {
  return (
    <>
      <color attach="background" args={["#020205"]} />
      <fog attach="fog" args={["#020205", 8, 28]} />
      <CinemaCamera />
      {/* Emblem + rings first — city/particles deferred so Apex reveal stays smooth */}
      <OrbitRings />
      <ArcEmblem />
      <Deferred after={2}>
        <EmberStorm />
      </Deferred>
      <Deferred after={5}>
        <FortressCity />
        <GodRays />
      </Deferred>
    </>
  );
}
