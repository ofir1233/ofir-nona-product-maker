"use client";

import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import HeroSection from "@/components/sections/HeroSection";
import ExtractionSection from "@/components/sections/ExtractionSection";
import BlueprintSection from "@/components/sections/BlueprintSection";
import HUDNav from "@/components/ui/HUDNav";

// R3F canvas for ShatterGrid — client only
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track normalized scroll progress across the full page
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setScrollProgress(v);
  });

  return (
    <SmoothScrollProvider>
      {/* R3F ShatterGrid canvas — fixed behind extraction/blueprint sections */}
      <Scene scrollProgress={scrollProgress} />

      {/* HUD navigation */}
      <HUDNav />

      {/* Scrollable content */}
      <main ref={mainRef} className="relative" style={{ zIndex: 1 }}>
        {/* Hero: Unicorn Studio scene as full background */}
        <HeroSection scrollProgress={scrollProgress} />

        {/* Extraction: Designer → Maker + ShatterGrid overlay */}
        <ExtractionSection />

        {/* Blueprint: Projects + Logic Toggle */}
        <BlueprintSection />
      </main>
    </SmoothScrollProvider>
  );
}
