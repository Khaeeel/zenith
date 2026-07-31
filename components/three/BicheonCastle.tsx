"use client";

/**
 * Bodiam-inspired limestone fortress — restored keep with Zenith banner.
 * Courtyard is paved stone (no grass); terrain/props cleared from the bailey.
 */

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { terrainHeightAt } from "@/lib/mapWorld";

function KenneyBridge() {
  const { scene } = useGLTF("/models/castle/bridge-straight.glb");
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  return (
    <primitive
      object={cloned}
      position={[0, 0.15, 6.1]}
      rotation={[0, Math.PI, 0]}
      scale={1.85}
    />
  );
}

useGLTF.preload("/models/castle/bridge-straight.glb");

function ZenithFlag({
  position = [0, 5.8, 4.35] as [number, number, number],
  scale = 0.9,
}) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0a0a0e";
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, 488, 232);
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.moveTo(90, 128);
    ctx.lineTo(120, 88);
    ctx.lineTo(150, 128);
    ctx.lineTo(120, 168);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f0d060";
    ctx.font = "bold 72px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ZENITH", 320, 128);
    ctx.font = "18px Georgia, serif";
    ctx.fillStyle = "#a08030";
    ctx.fillText("APEX RESISTANCE", 320, 190);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  }, []);

  const cloth = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!cloth.current) return;
    const t = clock.getElapsedTime();
    cloth.current.rotation.y = Math.sin(t * 1.4) * 0.08;
    cloth.current.rotation.z = Math.sin(t * 1.1) * 0.04;
  });

  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 3.6, 10]} />
        <meshStandardMaterial color="#3a3e48" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#a08020"
          emissiveIntensity={0.5}
          metalness={0.6}
        />
      </mesh>
      <mesh ref={cloth} castShadow position={[1.4, 2.15, 0]}>
        <planeGeometry args={[2.7, 1.4]} />
        <meshStandardMaterial
          map={tex}
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.08}
          emissive="#3a3010"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

function MoatWater() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#0a3040") },
      uShallow: { value: new THREE.Color("#2a8090") },
      uFoam: { value: new THREE.Color("#c8e8f0") },
    }),
    [],
  );
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.09, 0]}
      receiveShadow
      renderOrder={1}
    >
      <ringGeometry args={[5.2, 7.4, 96]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uFoam;
          varying vec2 vUv;
          float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
          float noise(vec2 p){
            vec2 i=floor(p), f=fract(p);
            float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
            vec2 u=f*f*(3.-2.*f);
            return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
          }
          float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.1; a*=.5; } return v; }
          void main(){
            float n = fbm(vec2(vUv.x*28.0 + uTime*0.5, vUv.y*4.0 + uTime*0.1));
            float banks = smoothstep(0.,0.18,vUv.y)*smoothstep(1.,0.82,vUv.y);
            float foam = smoothstep(0.58,0.88,n)*banks;
            vec3 col = mix(uDeep, uShallow, n*0.7+0.15);
            col = mix(col, uFoam, foam*0.7);
            gl_FragColor = vec4(col, 0.9);
          }
        `}
      />
    </mesh>
  );
}

function useStoneMaterials() {
  return useMemo(() => {
    const mk = (base: string, variance = 28) => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = "rgba(40,38,34,0.35)";
      ctx.lineWidth = 1.5;
      const brickH = 18;
      for (let y = 0; y < 256; y += brickH) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
        const offset = (y / brickH) % 2 === 0 ? 0 : 22;
        for (let x = offset; x < 256; x += 44) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + brickH);
          ctx.stroke();
        }
      }
      for (let i = 0; i < 4200; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const a = Math.random() * 0.28;
        const shade = Math.floor(Math.random() * variance);
        ctx.fillStyle = `rgba(${90 + shade},${88 + shade},${80 + shade},${a})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      const map = new THREE.CanvasTexture(c);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 8;
      const mat = new THREE.MeshStandardMaterial({
        map,
        roughness: 0.92,
        metalness: 0.04,
        color: "#d8d0c0",
      });
      return { mat, map };
    };

    const stone = mk("#c8c0b0", 36);
    stone.map.repeat.set(3, 2);
    const dark = mk("#9a9284", 30);
    dark.map.repeat.set(2, 2);

    return {
      stone: stone.mat,
      dark: dark.mat,
    };
  }, []);
}

function Merlons({
  length,
  axis,
  y,
  material,
}: {
  length: number;
  axis: "x" | "z";
  y: number;
  material: THREE.Material;
}) {
  const count = Math.max(6, Math.floor(length / 0.38));
  const items = useMemo(() => {
    const half = length / 2 - 0.2;
    return Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0 : i / (count - 1);
      return -half + t * half * 2;
    });
  }, [count, length]);

  return (
    <group>
      {items.map((p, i) =>
        i % 2 === 0 ? (
          <mesh
            key={i}
            castShadow
            position={axis === "x" ? [p, y, 0] : [0, y, p]}
            material={material}
          >
            <boxGeometry
              args={axis === "x" ? [0.28, 0.32, 0.34] : [0.34, 0.32, 0.28]}
            />
          </mesh>
        ) : null,
      )}
    </group>
  );
}

function RoundTower({
  position,
  radius = 0.95,
  height = 4.2,
  stone,
  dark,
}: {
  position: [number, number, number];
  radius?: number;
  height?: number;
  stone: THREE.Material;
  dark: THREE.Material;
}) {
  const slits = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.2;
        return {
          x: Math.cos(a) * (radius + 0.02),
          z: Math.sin(a) * (radius + 0.02),
          y: 1.1 + (i % 3) * 0.85,
          rot: -a + Math.PI / 2,
        };
      }),
    [radius],
  );

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]} material={stone}>
        <cylinderGeometry args={[radius, radius * 1.06, height, 20]} />
      </mesh>
      <mesh castShadow position={[0, height + 0.08, 0]} material={dark}>
        <cylinderGeometry args={[radius * 1.08, radius * 1.08, 0.18, 20]} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[
              Math.cos(a) * radius * 0.92,
              height + 0.32,
              Math.sin(a) * radius * 0.92,
            ]}
            material={stone}
          >
            <boxGeometry args={[0.28, 0.38, 0.22]} />
          </mesh>
        );
      })}
      <mesh position={[0, height + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.88, 20]} />
        <meshStandardMaterial color="#6a6558" roughness={0.95} />
      </mesh>
      {slits.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[0, s.rot, 0]}>
          <boxGeometry args={[0.08, 0.42, 0.06]} />
          <meshBasicMaterial color="#1a1814" />
        </mesh>
      ))}
      <mesh position={[0, 0.25, 0]} material={dark}>
        <cylinderGeometry args={[radius * 1.08, radius * 1.12, 0.5, 20]} />
      </mesh>
    </group>
  );
}

function CurtainWall({
  from,
  to,
  height,
  thickness,
  stone,
  dark,
}: {
  from: [number, number];
  to: [number, number];
  height: number;
  thickness: number;
  stone: THREE.Material;
  dark: THREE.Material;
}) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    height / 2,
    (from[1] + to[1]) / 2,
  ];
  const rot = Math.atan2(dx, dz);

  return (
    <group position={mid} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow material={stone}>
        <boxGeometry args={[thickness, height, len]} />
      </mesh>
      <mesh position={[0, height / 2 + 0.06, 0]} material={dark}>
        <boxGeometry args={[thickness * 1.25, 0.14, len]} />
      </mesh>
      <group position={[thickness * 0.35, height / 2 + 0.28, 0]}>
        <Merlons length={len - 0.4} axis="z" y={0} material={stone} />
      </group>
      {Array.from({ length: Math.floor(len / 1.1) }).map((_, i) => {
        const n = Math.floor(len / 1.1);
        const z = -len / 2 + ((i + 0.5) / n) * len;
        return (
          <mesh key={i} position={[thickness * 0.52, 0.2, z]}>
            <boxGeometry args={[0.06, 0.45, 0.1]} />
            <meshBasicMaterial color="#1a1814" />
          </mesh>
        );
      })}
    </group>
  );
}

function Gatehouse({
  stone,
  dark,
}: {
  stone: THREE.Material;
  dark: THREE.Material;
}) {
  return (
    <group position={[0, 0, 4.05]}>
      {[-1.15, 1.15].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow receiveShadow position={[0, 2.5, 0]} material={stone}>
            <boxGeometry args={[1.35, 5.0, 1.55]} />
          </mesh>
          <mesh castShadow position={[0, 5.15, 0]} material={dark}>
            <boxGeometry args={[1.5, 0.28, 1.7]} />
          </mesh>
          {[-0.45, 0, 0.45].map((ox, i) => (
            <mesh key={i} castShadow position={[ox, 5.45, 0.55]} material={stone}>
              <boxGeometry args={[0.32, 0.42, 0.28]} />
            </mesh>
          ))}
          {[-0.45, 0, 0.45].map((ox, i) => (
            <mesh
              key={`b${i}`}
              castShadow
              position={[ox, 5.45, -0.55]}
              material={stone}
            >
              <boxGeometry args={[0.32, 0.42, 0.28]} />
            </mesh>
          ))}
          {[1.4, 2.6, 3.8].map((y, i) => (
            <mesh key={i} position={[0, y, 0.8]}>
              <boxGeometry args={[0.35, 0.55, 0.08]} />
              <meshBasicMaterial color="#141210" />
            </mesh>
          ))}
        </group>
      ))}
      <mesh castShadow position={[0, 1.7, 0]} material={stone}>
        <boxGeometry args={[1.0, 3.4, 1.4]} />
      </mesh>
      <mesh position={[0, 1.15, 0.72]}>
        <boxGeometry args={[0.85, 2.1, 0.12]} />
        <meshStandardMaterial color="#1a1210" roughness={0.95} />
      </mesh>
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 1.3, 0.78]}>
          <boxGeometry args={[0.05, 1.8, 0.04]} />
          <meshStandardMaterial color="#2a2420" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 4.2, 0]} material={stone}>
        <boxGeometry args={[2.4, 1.2, 1.35]} />
      </mesh>
    </group>
  );
}

function MidTower({
  position,
  stone,
  dark,
}: {
  position: [number, number, number];
  stone: THREE.Material;
  dark: THREE.Material;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 2.15, 0]} material={stone}>
        <boxGeometry args={[1.15, 4.3, 1.15]} />
      </mesh>
      <mesh castShadow position={[0, 4.4, 0]} material={dark}>
        <boxGeometry args={[1.3, 0.22, 1.3]} />
      </mesh>
      {[
        [-0.4, 0.4],
        [0.4, 0.4],
        [-0.4, -0.4],
        [0.4, -0.4],
        [0, 0.45],
        [0, -0.45],
        [0.45, 0],
        [-0.45, 0],
      ].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 4.7, z]} material={stone}>
          <boxGeometry args={[0.28, 0.38, 0.28]} />
        </mesh>
      ))}
      <mesh position={[0, 2.2, 0.6]}>
        <boxGeometry args={[0.28, 0.5, 0.08]} />
        <meshBasicMaterial color="#141210" />
      </mesh>
    </group>
  );
}

/**
 * Bodiam-inspired fortress — moated quadrangle, round towers, gatehouse,
 * Zenith banner. Flat stone bailey (no grass / no terrain poking through).
 */
export default function BicheonCastle() {
  const ref = useRef<THREE.Group>(null);
  const mats = useStoneMaterials();

  useFrame(() => {
    if (ref.current)
      ref.current.position.y = terrainHeightAt.sample(1, 1) - 0.12;
  });

  const half = 3.55;
  const wallH = 3.35;
  const corners: [number, number, number][] = [
    [-half, 0, -half],
    [half, 0, -half],
    [-half, 0, half],
    [half, 0, half],
  ];

  return (
    <group ref={ref} position={[1, 0, 1]} scale={1.35}>
      <MoatWater />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={[4.85, 5.25, 48]} />
        <meshStandardMaterial color="#4a5048" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[7.3, 7.9, 48]} />
        <meshStandardMaterial color="#3a4038" roughness={0.95} />
      </mesh>

      {/* Solid foundation plug — buries any terrain / rock / pine that would clip in */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[6.2, 6.4, 2.4, 48]} />
        <meshStandardMaterial color="#3e3a34" roughness={1} />
      </mesh>

      {/* Thick stone bailey pad — seals terrain / rocks from poking through */}
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[5.0, 5.2, 1.4, 48]} />
        <meshStandardMaterial color="#5a554c" roughness={0.96} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 1.28, 0]}
        receiveShadow
      >
        <circleGeometry args={[4.9, 48]} />
        <meshStandardMaterial color="#7a7368" roughness={0.92} />
      </mesh>
      {/* Paved courtyard — stone, not grass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 1.3, 0]}
        receiveShadow
        material={mats.dark}
      >
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.31, 1.2]}>
        <planeGeometry args={[1.1, 3.8]} />
        <meshStandardMaterial color="#8a7a5a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[-0.8, 1.31, -0.4]}>
        <planeGeometry args={[0.7, 2.4]} />
        <meshStandardMaterial color="#8a7a5a" roughness={1} />
      </mesh>

      {[
        { x: 0, z: -2.6, w: 4.2, d: 0.85, h: 1.4 },
        { x: -2.5, z: 0.2, w: 0.9, d: 3.2, h: 1.6 },
        { x: 2.5, z: -0.3, w: 0.9, d: 2.8, h: 1.35 },
        { x: 0.6, z: 2.2, w: 2.2, d: 0.75, h: 1.2 },
      ].map((b, i) => (
        <mesh
          key={i}
          castShadow
          position={[b.x, 1.3 + b.h / 2, b.z]}
          material={mats.dark}
        >
          <boxGeometry args={[b.w, b.h, b.d]} />
        </mesh>
      ))}

      <CurtainWall
        from={[-half + 0.9, -half]}
        to={[half - 0.9, -half]}
        height={wallH}
        thickness={0.55}
        stone={mats.stone}
        dark={mats.dark}
      />
      <CurtainWall
        from={[-half + 0.9, half]}
        to={[-1.4, half]}
        height={wallH}
        thickness={0.55}
        stone={mats.stone}
        dark={mats.dark}
      />
      <CurtainWall
        from={[1.4, half]}
        to={[half - 0.9, half]}
        height={wallH}
        thickness={0.55}
        stone={mats.stone}
        dark={mats.dark}
      />
      <CurtainWall
        from={[-half, -half + 0.9]}
        to={[-half, half - 0.9]}
        height={wallH}
        thickness={0.55}
        stone={mats.stone}
        dark={mats.dark}
      />
      <CurtainWall
        from={[half, -half + 0.9]}
        to={[half, half - 0.9]}
        height={wallH}
        thickness={0.55}
        stone={mats.stone}
        dark={mats.dark}
      />

      {corners.map((c, i) => (
        <RoundTower
          key={i}
          position={c}
          radius={1.05}
          height={4.4}
          stone={mats.stone}
          dark={mats.dark}
        />
      ))}

      <MidTower position={[-half, 0, 0]} stone={mats.stone} dark={mats.dark} />
      <MidTower position={[half, 0, 0]} stone={mats.stone} dark={mats.dark} />
      <MidTower position={[0, 0, -half]} stone={mats.stone} dark={mats.dark} />

      <Gatehouse stone={mats.stone} dark={mats.dark} />

      <Suspense fallback={null}>
        <KenneyBridge />
      </Suspense>

      <ZenithFlag position={[0, 5.9, 4.55]} scale={1.05} />
      <ZenithFlag position={[1.15, 5.1, half]} scale={0.55} />

      {(
        [
          [0, 5.2, 4.4],
          [-half, 4.6, -half],
          [half, 4.6, -half],
          [-half, 4.6, half],
          [half, 4.6, half],
          [0, 4.5, -half],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#ff9a40" />
          </mesh>
          <pointLight
            color="#ff8a30"
            intensity={i === 0 ? 3.2 : 1.6}
            distance={i === 0 ? 16 : 10}
            decay={2}
          />
        </group>
      ))}
      <pointLight
        position={[0, 6.2, 3.5]}
        color="#d4af37"
        intensity={2.4}
        distance={18}
      />
    </group>
  );
}
