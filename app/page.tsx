"use client";

import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import dynamic from "next/dynamic";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import HeroSection from "@/components/sections/HeroSection";
import ExtractionSection from "@/components/sections/ExtractionSection";
import BlueprintSection from "@/components/sections/BlueprintSection";
import ExperienceTeaserSection from "@/components/sections/ExperienceTeaserSection";
import HUDNav from "@/components/ui/HUDNav";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// R3F canvas — browser + WebGL only
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track normalized scroll progress (0→1) across the full page height
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setScrollProgress(v);
  });

  return (
    <SmoothScrollProvider>
      {/*
       * R3F canvas — fixed, full-screen, pointer-events-none.
       * ErrorBoundary: if WebGL is unavailable or a shader compile fails,
       * the rest of the page continues to render.
       */}
      <ErrorBoundary label="R3F Scene">
        <Scene scrollProgress={scrollProgress} />
      </ErrorBoundary>

      {/* Fixed HUD nav */}
      <HUDNav />

      {/* Scrollable content */}
      <main className="relative" style={{ zIndex: 1 }}>
        {/*
         * Hero: Unicorn Studio scene as full background.
         * ErrorBoundary: if the WebGL scene or SDK fails to initialise,
         * the terminal text and page structure remain visible.
         */}
        <ErrorBoundary label="Hero UnicornScene">
          <HeroSection />
        </ErrorBoundary>

        <ExtractionSection />
        <BlueprintSection />
        <ExperienceTeaserSection />
      </main>
    </SmoothScrollProvider>
  );
}
