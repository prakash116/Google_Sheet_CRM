"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useTheme } from "@/lib/theme";

const COUNT = 2600;

/** A slowly turning aperture of warm light particles. */
function Aperture({ animate, light }: { animate: boolean; light: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const warm = new THREE.Color("#c8792c");
    const pale = new THREE.Color(light ? "#5b4632" : "#f4d9a0");
    const tmp = new THREE.Color();
    // Deterministic pseudo-random so the shape is stable between renders.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    for (let i = 0; i < COUNT; i++) {
      const t = rand() * Math.PI * 2;
      const ring = 2.1 + (rand() - 0.5) * 0.9 * Math.pow(rand(), 2);
      const blade = Math.sin(t * 6) * 0.18;
      const r = ring + blade;
      pos[i * 3] = Math.cos(t) * r;
      pos[i * 3 + 1] = Math.sin(t) * r;
      pos[i * 3 + 2] = (rand() - 0.5) * 0.6;
      tmp.copy(pale).lerp(warm, rand());
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return [pos, col];
  }, [light]);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points || !animate) return;
    points.rotation.z += delta * 0.06;
    const { x, y } = state.pointer;
    points.rotation.x += (y * 0.25 - points.rotation.x) * 0.04;
    points.rotation.y += (x * 0.35 - points.rotation.y) * 0.04;
  });

  return (
    <points ref={ref} rotation={[0.35, -0.2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroScene() {
  const light = useTheme() === "light";
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.2], fov: 50 }}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
    >
      <Aperture animate={!reduced} light={light} />
    </Canvas>
  );
}
