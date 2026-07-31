"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bicheonWorldHeight, terrainHeightAt } from "@/lib/mapWorld";

export function useRiverCurve() {
  return useMemo(() => {
    // Arc south of Bicheon — never cut the courtyard / moat (castle at ~1,1)
    const anchors = [
      [-15, 12],
      [-10, 10.5],
      [-5, 11.2],
      [1.2, 11.8],
      [6.5, 10.2],
      [11, 7.5],
      [14.5, 5.5],
      [17, 8],
    ] as const;
    const pts = anchors.map(([x, z]) => {
      const y = Math.max(0.22, bicheonWorldHeight(x, z) - 0.22);
      return new THREE.Vector3(x, y, z);
    });
    return new THREE.CatmullRomCurve3(pts);
  }, []);
}

/** Animated glacial turquoise water with foam noise. */
export function GlacialRiver() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const curve = useRiverCurve();

  const geo = useMemo(
    () => new THREE.TubeGeometry(curve, 180, 0.95, 18, false),
    [curve],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#1a6a72") },
      uShallow: { value: new THREE.Color("#5ec4bc") },
      uFoam: { value: new THREE.Color("#eef9f8") },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh geometry={geo} renderOrder={1}>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vUv = uv;
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uFoam;
          varying vec2 vUv;
          varying vec3 vPos;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }
          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.05;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 flow = vUv * vec2(16.0, 4.0) + vec2(uTime * 0.42, uTime * 0.1);
            float n = fbm(flow);
            float edge = smoothstep(0.05, 0.22, vUv.y) * smoothstep(0.95, 0.78, vUv.y);
            float foam = smoothstep(0.55, 0.85, n) * edge;
            vec3 col = mix(uDeep, uShallow, n * 0.65 + 0.2);
            col = mix(col, uFoam, foam * 0.85);
            float alpha = 0.84 + foam * 0.12;
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
}

function useRockMaps() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, "#8a8e94");
    g.addColorStop(0.5, "#6e7278");
    g.addColorStop(1, "#9aa0a6");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 12000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const s = 55 + Math.random() * 90;
      ctx.fillStyle = `rgba(${s},${s + 6},${s - 4},${0.08 + Math.random() * 0.25})`;
      ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 2);
    }
    ctx.strokeStyle = "rgba(25,28,30,0.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 28; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        x += (Math.random() - 0.5) * 80;
        y += (Math.random() - 0.5) * 80;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${100 + Math.random() * 50},${150 + Math.random() * 60},${40},${0.2 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        Math.random() * 512,
        6 + Math.random() * 18,
        4 + Math.random() * 12,
        Math.random(),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 8;
    return map;
  }, []);
}

/** Dense river + clearing boulders with weathered albedo. */
export function RockField({ count = 140 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const curve = useRiverCurve();
  const map = useRockMaps();

  const transforms = useMemo(() => {
    const list: {
      x: number;
      y: number;
      z: number;
      sx: number;
      sy: number;
      sz: number;
      rx: number;
      ry: number;
      rz: number;
    }[] = [];
    for (let i = 0; i < count; i++) {
      let x: number;
      let z: number;
      let y: number;
      if (i < count * 0.55) {
        const t = (i + 0.2) / (count * 0.55);
        const p = curve.getPointAt(Math.min(0.99, t));
        const tan = curve.getTangentAt(Math.min(0.99, t)).normalize();
        const side = new THREE.Vector3(-tan.z, 0, tan.x);
        const off = (Math.random() - 0.5) * 3.2;
        x = p.x + side.x * off;
        z = p.z + side.z * off;
        y = Math.max(p.y - 0.05, bicheonWorldHeight(x, z) - 0.05);
      } else {
        x = (Math.random() - 0.5) * 40;
        z = (Math.random() - 0.5) * 40;
        if (Math.hypot(x - 1, z - 1) < 9) {
          x += 12;
        }
        y = terrainHeightAt.sample(x, z);
      }
      const s = 0.4 + Math.random() * 1.5;
      list.push({
        x,
        y,
        z,
        sx: s * (0.9 + Math.random() * 0.5),
        sy: s * (0.45 + Math.random() * 0.4),
        sz: s * (0.8 + Math.random() * 0.5),
        rx: Math.random() * 0.7,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * 0.5,
      });
    }
    return list;
  }, [count, curve]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    transforms.forEach((t, i) => {
      e.set(t.rx, t.ry, t.rz);
      q.setFromEuler(e);
      p.set(t.x, t.y + t.sy * 0.35, t.z);
      s.set(t.sx, t.sy, t.sz);
      m.compose(p, q, s);
      mesh.current!.setMatrixAt(i, m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.55, 2]} />
      <meshStandardMaterial
        map={map}
        color="#c4c8cc"
        roughness={0.95}
        metalness={0.04}
        envMapIntensity={0.35}
      />
    </instancedMesh>
  );
}

function usePineTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 256, 512);
    // Trunk
    ctx.fillStyle = "#3a2818";
    ctx.fillRect(118, 360, 20, 140);
    // Layered foliage
    const layers = [
      { y: 320, w: 110, h: 90, col: "#1a5a30" },
      { y: 250, w: 95, h: 85, col: "#226a38" },
      { y: 185, w: 78, h: 75, col: "#2a7a40" },
      { y: 125, w: 58, h: 65, col: "#348848" },
      { y: 75, w: 38, h: 55, col: "#3e9850" },
    ];
    for (const L of layers) {
      ctx.fillStyle = L.col;
      ctx.beginPath();
      ctx.moveTo(128, L.y - L.h);
      ctx.lineTo(128 - L.w, L.y);
      ctx.lineTo(128 + L.w, L.y);
      ctx.closePath();
      ctx.fill();
      // Soft highlight edge
      ctx.fillStyle = "rgba(120,200,100,0.15)";
      ctx.beginPath();
      ctx.moveTo(128, L.y - L.h);
      ctx.lineTo(128 - L.w * 0.35, L.y - L.h * 0.2);
      ctx.lineTo(128, L.y);
      ctx.closePath();
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Crossed billboard pines — denser, less “cone toy” silhouette. */
export function PineBillboards({ count = 420 }: { count?: number }) {
  const a = useRef<THREE.InstancedMesh>(null);
  const b = useRef<THREE.InstancedMesh>(null);
  const tex = usePineTexture();

  const transforms = useMemo(() => {
    const regions = [
      { cx: -8, cz: 5, spread: 6 },
      { cx: -3, cz: 9, spread: 5 },
      { cx: 3, cz: 10, spread: 5.5 },
      { cx: 8, cz: 6, spread: 4.5 },
      { cx: -11, cz: 1, spread: 4 },
      { cx: 11, cz: 3, spread: 4 },
      { cx: -1, cz: -5, spread: 3.5 },
      { cx: 5, cz: 3, spread: 3.5 },
      { cx: -6, cz: 12, spread: 4.5 },
    ];
    const list: { x: number; z: number; s: number; rot: number }[] = [];
    for (let i = 0; i < count * 1.4; i++) {
      const r = regions[i % regions.length];
      const ang = Math.random() * Math.PI * 2;
      const d = Math.random() * r.spread;
      const x = r.cx + Math.cos(ang) * d;
      const z = r.cz + Math.sin(ang) * d;
      if (Math.hypot(x - 1, z - 1) < 9.5) continue;
      list.push({
        x,
        z,
        s: 1.4 + Math.random() * 2.2,
        rot: Math.random() * Math.PI,
      });
      if (list.length >= count) break;
    }
    while (list.length < count) {
      list.push({
        x: -10 + Math.random() * 8,
        z: 4 + Math.random() * 8,
        s: 1.2 + Math.random() * 1.5,
        rot: Math.random() * Math.PI,
      });
    }
    return list;
  }, [count]);

  useLayoutEffect(() => {
    if (!a.current || !b.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    transforms.forEach((t, i) => {
      const y = terrainHeightAt.sample(t.x, t.z);
      e.set(0, t.rot, 0);
      q.setFromEuler(e);
      p.set(t.x, y + t.s * 0.5, t.z);
      s.set(t.s * 0.55, t.s, 1);
      m.compose(p, q, s);
      a.current!.setMatrixAt(i, m);
      e.set(0, t.rot + Math.PI / 2, 0);
      q.setFromEuler(e);
      m.compose(p, q, s);
      b.current!.setMatrixAt(i, m);
    });
    a.current.instanceMatrix.needsUpdate = true;
    b.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.35,
      depthWrite: true,
      roughness: 0.85,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  }, [tex]);

  return (
    <group>
      <instancedMesh
        ref={a}
        args={[undefined, undefined, count]}
        castShadow
        material={material}
      >
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
      <instancedMesh
        ref={b}
        args={[undefined, undefined, count]}
        castShadow
        material={material}
      >
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </group>
  );
}
