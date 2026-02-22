"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import NeshmatDaat from "./NeshmatDaat";
import ShatterGrid from "./ShatterGrid";

interface SceneProps {
  scrollProgress: number;
}

export default function Scene({ scrollProgress }: SceneProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <NeshmatDaat scrollProgress={scrollProgress} />
          <ShatterGrid scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
