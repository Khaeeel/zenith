"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { heroScroll } from "@/lib/mapWorld";

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
  texture.anisotropy = 8;

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
        <circleGeometry args={[1.15, 48]} />
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
        <torusGeometry args={[1.22, 0.035, 12, 80]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#d4af37"
          emissiveIntensity={0.55}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      <pointLight
        color="#f0d060"
        intensity={3}
        distance={7}
        position={[0, 0, 1.2]}
      />
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
    }[] = [];
    for (let i = 0; i < 55; i++) {
      const a = (i / 55) * Math.PI * 2;
      const r = 5.5 + (i % 7) * 1.1 + Math.sin(i * 3.1) * 0.8;
      list.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r - 3,
        w: 0.35 + (i % 4) * 0.15,
        h: 1.8 + (i % 9) * 0.85,
        d: 0.35 + (i % 3) * 0.12,
        tip: i % 2 === 0,
      });
    }
    // Inner keep cluster
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      list.push({
        x: Math.cos(a) * 2.2,
        z: Math.sin(a) * 2.2 - 2,
        w: 0.5,
        h: 3.5 + (i % 3),
        d: 0.5,
        tip: true,
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow>
        <circleGeometry args={[22, 64]} />
        <meshStandardMaterial color="#090b10" roughness={1} metalness={0.05} />
      </mesh>

      {/* Curtain wall ring */}
      <mesh position={[0, 0.9, -2]}>
        <cylinderGeometry args={[7.2, 7.5, 1.8, 48, 1, true]} />
        <meshStandardMaterial
          color="#151820"
          side={THREE.DoubleSide}
          roughness={0.95}
          flatShading
        />
      </mesh>

      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]}>
          <mesh castShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#1a1e28" : "#12151c"}
              roughness={0.92}
              flatShading
            />
          </mesh>
          {b.tip && (
            <mesh position={[0, b.h / 2 + 0.35, 0]}>
              <coneGeometry args={[b.w * 0.7, 0.7, 4]} />
              <meshStandardMaterial color="#0c0e14" flatShading />
            </mesh>
          )}
          {/* Window glow */}
          {b.h > 3 && (
            <pointLight
              position={[0, b.h * 0.15, b.d * 0.6]}
              color="#d4af37"
              intensity={0.35}
              distance={2.5}
            />
          )}
        </group>
      ))}

      {/* Hanging banners */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 4.5, 2.5, 1]}>
          <mesh>
            <boxGeometry args={[0.06, 2.8, 0.8]} />
            <meshStandardMaterial color="#0a0a0a" />
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
      mat.opacity = (0.04 + Math.sin(t * 0.8 + i) * 0.02) * (1 - p * 0.7);
    });
  });

  return (
    <group ref={group} position={[2, 6, -4]} rotation={[0.4, -0.3, 0.2]}>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[(i - 3) * 0.55, 0, 0]} rotation={[0, 0, (i - 3) * 0.04]}>
          <coneGeometry args={[0.8 + i * 0.05, 14, 3, 1, true]} />
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
          <ringGeometry args={[1.55 + i * 0.32, 1.6 + i * 0.32, 96]} />
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
  const count = 600;
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
    const speed = 0.4 + p * 22;
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += speed * delta * (p > 0.2 ? 1 : 0.15);
      arr[i * 3 + 1] += delta * (0.2 + (i % 4) * 0.08);
      if (arr[i * 3 + 2] > 5 || arr[i * 3 + 1] > 10) {
        arr[i * 3 + 2] = -12 - Math.random() * 8;
        arr[i * 3] = (Math.random() - 0.5) * 16;
        arr[i * 3 + 1] = Math.random() * 6 - 1;
      }
    }
    attr.needsUpdate = true;
    (points.current.material as THREE.PointsMaterial).opacity = 0.35 + p * 0.55;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#f0d060"
        transparent
        opacity={0.4}
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
    cam.fov = THREE.MathUtils.lerp(40, 52, p);
    cam.updateProjectionMatrix();
  });

  return null;
}

export default function HeroScene() {
  return (
    <>
      <color attach="background" args={["#020205"]} />
      <fog attach="fog" args={["#020205", 8, 32]} />
      <ambientLight intensity={0.25} color="#6a7080" />
      <directionalLight position={[6, 12, 4]} intensity={1.1} color="#fff2d0" />
      <directionalLight position={[-8, 4, -6]} intensity={0.35} color="#4050a0" />
      <hemisphereLight args={["#2a3048", "#0a0806", 0.4]} />
      <CinemaCamera />
      <FortressCity />
      <GodRays />
      <OrbitRings />
      <ArcEmblem />
      <EmberStorm />
    </>
  );
}
