"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

export interface SceneConfig {
  preset: string;
  accent: string;
  secondary: string;
  count: number;
  size: number;
  speed: number;
  mouse: boolean;
  /** Light theme: normal blending so points/lines stay visible on a pale background. */
  light: boolean;
}

type Pointer = RefObject<{ x: number; y: number }>;

/** Deterministic PRNG so a preset looks the same on every render. */
function prng(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

/** Soft round sprite so points render as glowing dots instead of squares. */
function useDotTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Eases a group toward the pointer for a subtle parallax. */
function useParallax(ref: RefObject<THREE.Group | null>, pointer: Pointer, enabled: boolean, strength = 0.25) {
  useFrame(() => {
    const group = ref.current;
    if (!group || !enabled) return;
    group.rotation.y += (pointer.current.x * strength - group.rotation.y) * 0.04;
    group.rotation.x += (-pointer.current.y * strength * 0.6 - group.rotation.x) * 0.04;
  });
}

function FloatingParticles({ config, pointer }: { config: SceneConfig; pointer: Pointer }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const dot = useDotTexture();

  const { base, positions, colors, phases } = useMemo(() => {
    const rand = prng(11);
    const n = config.count;
    const base = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const phases = new Float32Array(n);
    const a = new THREE.Color(config.accent);
    const b = new THREE.Color(config.secondary);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      base[i * 3] = (rand() - 0.5) * 14;
      base[i * 3 + 1] = (rand() - 0.5) * 8;
      base[i * 3 + 2] = (rand() - 0.5) * 6;
      c.copy(a).lerp(b, rand() < 0.75 ? rand() * 0.25 : 0.6 + rand() * 0.4);
      colors.set([c.r, c.g, c.b], i * 3);
      phases[i] = rand() * Math.PI * 2;
    }
    return { base, positions: base.slice(), colors, phases };
  }, [config.count, config.accent, config.secondary]);
  const blending = config.light ? THREE.NormalBlending : THREE.AdditiveBlending;

  useParallax(group, pointer, config.mouse);

  useFrame(({ clock }) => {
    const attr = points.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const t = clock.elapsedTime * config.speed;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      attr.setXY(i, base[i * 3] + Math.sin(t * 0.6 + p) * 0.35, base[i * 3 + 1] + Math.cos(t * 0.8 + p * 1.3) * 0.45);
    }
    attr.needsUpdate = true;
    if (group.current) group.current.rotation.z = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={dot}
          size={config.size * 0.09}
          vertexColors
          transparent
          depthWrite={false}
          blending={blending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

const LINE_POINTS = 140;

function FlowingLines({ config, pointer }: { config: SceneConfig; pointer: Pointer }) {
  const group = useRef<THREE.Group>(null);
  const lineCount = Math.max(8, Math.min(36, Math.round(config.count / 3)));

  const lines = useMemo(() => {
    const a = new THREE.Color(config.accent);
    const b = new THREE.Color(config.secondary);
    return Array.from({ length: lineCount }, (_, i) => {
      const f = i / (lineCount - 1);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(LINE_POINTS * 3), 3));
      const material = new THREE.LineBasicMaterial({
        color: a.clone().lerp(b, f * f),
        transparent: true,
        opacity: (config.light ? 0.2 : 0.12) + (1 - Math.abs(f - 0.5) * 2) * 0.4,
        blending: config.light ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      });
      return new THREE.Line(geometry, material);
    });
  }, [lineCount, config.accent, config.secondary, config.light]);

  useEffect(
    () => () =>
      lines.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }),
    [lines],
  );

  useParallax(group, pointer, config.mouse, 0.15);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * config.speed;
    lines.forEach((line, i) => {
      const attr = line.geometry.attributes.position as THREE.BufferAttribute;
      const offset = (i - lineCount / 2) * 0.14;
      for (let j = 0; j < LINE_POINTS; j++) {
        const x = (j / (LINE_POINTS - 1) - 0.5) * 16;
        const y =
          offset +
          Math.sin(x * 0.45 + t * 1.2 + i * 0.18) * 0.9 +
          Math.sin(x * 0.17 - t * 0.7 + i * 0.05) * 0.6;
        attr.setXYZ(j, x, y, Math.cos(x * 0.3 + t + i * 0.1) * 0.6);
      }
      attr.needsUpdate = true;
    });
  });

  return (
    <group ref={group} rotation={[0, 0, -0.12]}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

function GeometricWave({ config, pointer }: { config: SceneConfig; pointer: Pointer }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const dot = useDotTexture();
  const segments = Math.max(24, Math.min(64, Math.round(Math.sqrt(config.count) * 5)));

  const geometry = useMemo(() => new THREE.PlaneGeometry(22, 14, segments, segments), [segments]);
  const base = useMemo(() => (geometry.attributes.position.array as Float32Array).slice(), [geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useParallax(group, pointer, config.mouse, 0.12);

  useFrame(({ clock }) => {
    const attr = mesh.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const t = clock.elapsedTime * config.speed;
    for (let i = 0; i < attr.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      attr.setZ(i, Math.sin(x * 0.45 + t * 1.4) * 0.55 + Math.cos(y * 0.55 + t) * 0.45 + Math.sin((x + y) * 0.25 - t * 0.6) * 0.3);
    }
    attr.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <group rotation={[-1.05, 0, 0]} position={[0, -1.2, 0]}>
        <mesh ref={mesh} geometry={geometry}>
          <meshBasicMaterial color={config.secondary} wireframe transparent opacity={config.light ? 0.18 : 0.1} depthWrite={false} />
        </mesh>
        <points geometry={geometry}>
          <pointsMaterial
            map={dot}
            color={config.accent}
            size={config.size * 0.07}
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={config.light ? THREE.NormalBlending : THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      </group>
    </group>
  );
}

const PRESETS: Record<string, typeof FloatingParticles> = {
  "floating-particles": FloatingParticles,
  "flowing-lines": FlowingLines,
  "geometric-wave": GeometricWave,
};

export default function HeroScene({ config, running }: { config: SceneConfig; running: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!config.mouse) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [config.mouse]);

  const Preset = PRESETS[config.preset] ?? FloatingParticles;

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 55 }}
      frameloop={running ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Preset config={config} pointer={pointer} />
    </Canvas>
  );
}
