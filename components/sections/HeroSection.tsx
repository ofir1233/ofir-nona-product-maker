"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import TerminalText from "@/components/ui/TerminalText";

// Unicorn Studio is browser-only — SSR disabled
const UnicornScene = dynamic(
  () => import("unicornstudio-react/next").then((m) => m.UnicornScene),
  { ssr: false, loading: () => null }
);

const UNICORN_PROJECT_ID = "4spOUVtR0qgdSv9wMwPH";

// Scroll → Unicorn Studio variable binding
// The scene exposes a data layer variable "scrollY" (0..1)
// which drives the fluid→grid shader transition.
function useUnicornScrollBinding(scrollProgress: number) {
  const sceneReadyRef = useRef(false);
  const lastScrollRef = useRef(0);

  const onSceneLoad = useCallback(() => {
    sceneReadyRef.current = true;
  }, []);

  useEffect(() => {
    if (!sceneReadyRef.current) return;
    if (Math.abs(scrollProgress - lastScrollRef.current) < 0.002) return;
    lastScrollRef.current = scrollProgress;

    try {
      // UnicornStudio JS API: update a named data-layer variable on the scene
      // Variable "scrollY" is mapped inside the scene to control the
      // fluid-motion → structured-grid transition (0 = fluid, 1 = grid).
      const us = (window as typeof window & { UnicornStudio?: { getScene?: (id: string) => { updateVariable?: (k: string, v: number) => void } } }).UnicornStudio;
      if (us?.getScene) {
        const scene = us.getScene(UNICORN_PROJECT_ID);
        scene?.updateVariable?.("scrollY", scrollProgress);
      }
    } catch {
      // Silent fail — scroll binding is progressive enhancement
    }
  }, [scrollProgress]);

  return { onSceneLoad };
}

interface HeroSectionProps {
  scrollProgress: number;
}

export default function HeroSection({ scrollProgress }: HeroSectionProps) {
  const { onSceneLoad } = useUnicornScrollBinding(scrollProgress);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Unicorn Studio full-bleed background ── */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        <UnicornScene
          projectId={UNICORN_PROJECT_ID}
          width="100%"
          height="100%"
          fps={60}
          scale={1}
          dpi={1.5}
          production={true}
          lazyLoad={false}
          className="w-full h-full"
          onLoad={onSceneLoad}
          altText="Living Vessel — interactive generative scene"
        />
      </div>

      {/* ── Vignette overlay so terminal text stays legible ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div
        className="relative z-[2] w-full max-w-6xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
      >
        {/* Terminal panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hud-border rounded-sm p-6 bg-black/40 backdrop-blur-md">
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-muted-2">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <div className="w-2 h-2 rounded-full bg-muted" />
              <div className="w-2 h-2 rounded-full bg-accent opacity-60" />
              <span className="ml-3 font-mono text-xs text-muted">
                SYSTEM://product-maker/init
              </span>
            </div>
            <TerminalText />
          </div>
        </motion.div>

        {/* Right ambient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 2.5 }}
          className="hidden md:flex flex-col items-end gap-4"
        >
          <p className="font-mono text-xs text-muted tracking-[0.3em] uppercase">
            Scroll to descend
          </p>
          <div className="w-px h-16 bg-gradient-to-b from-accent/40 to-transparent" />
        </motion.div>
      </div>

      {/* ── Footer metadata ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-8 left-0 right-0 z-[2] flex justify-between items-end px-8 md:px-16"
      >
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-muted">PM.v1 // 2026</span>
          <span className="font-mono text-xs text-muted opacity-50">
            Lead Designer @ Hear.ai
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted">[01] VOID</span>
          <div className="w-8 h-px bg-muted" />
        </div>
      </motion.div>
    </section>
  );
}
