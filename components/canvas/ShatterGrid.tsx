"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ShatterGridProps {
  scrollProgress: number;
}

const GRID_COUNT = 100; // 10x10 grid
const GRID_SIZE = 10;

export default function ShatterGrid({ scrollProgress }: ShatterGridProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Precompute grid target positions and random initial offsets
  const { gridPositions, randomPositions } = useMemo(() => {
    const gridPos: THREE.Vector3[] = [];
    const randPos: THREE.Vector3[] = [];

    for (let i = 0; i < GRID_COUNT; i++) {
      const col = i % GRID_SIZE;
      const row = Math.floor(i / GRID_SIZE);
      gridPos.push(
        new THREE.Vector3(
          (col - GRID_SIZE / 2 + 0.5) * 1.2,
          (row - GRID_SIZE / 2 + 0.5) * 1.2,
          0
        )
      );
      // Random starting scatter position
      randPos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15
        )
      );
    }
    return { gridPositions: gridPos, randomPositions: randPos };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;

    // Phase control:
    // scrollProgress 0.0 – 0.3 → scattered (invisible, transitioning in)
    // scrollProgress 0.3 – 0.7 → lerping to grid
    // scrollProgress 0.7 – 1.0 → grid formed, fading out

    const phase = scrollProgress;

    // Grid appears from scroll 0.2 onward
    const gridAlpha = Math.max(0, Math.min(1, (phase - 0.2) / 0.5));
    const visibility = Math.max(0, 1 - Math.max(0, (phase - 0.75) / 0.25));

    for (let i = 0; i < GRID_COUNT; i++) {
      const rand = randomPositions[i];
      const grid = gridPositions[i];

      // Lerp toward grid
      const x = THREE.MathUtils.lerp(rand.x, grid.x, gridAlpha);
      const y = THREE.MathUtils.lerp(rand.y, grid.y, gridAlpha);
      const z = THREE.MathUtils.lerp(rand.z, grid.z, gridAlpha);

      // Slight oscillation when in grid
      const settled = Math.max(0, gridAlpha - 0.5) * 2;
      const oscX = Math.sin(t * 0.5 + i * 0.3) * 0.02 * settled;
      const oscY = Math.cos(t * 0.4 + i * 0.2) * 0.02 * settled;

      dummy.position.set(x + oscX, y + oscY, z);

      // Scale: grow as they form the grid
      const scale = Math.max(0.01, gridAlpha * 0.3) * visibility;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color: accent green with slight variation
      const colorShift = (i / GRID_COUNT) * 0.1 + gridAlpha * 0.05;
      color.setHSL(0.38 + colorShift, 0.8, 0.5 * gridAlpha);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, GRID_COUNT]}>
      <boxGeometry args={[1, 1, 0.05]} />
      <meshBasicMaterial
        transparent
        opacity={0.7}
        color="#4fffb0"
        toneMapped={false}
      />
    </instancedMesh>
  );
}
