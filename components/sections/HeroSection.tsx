"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import TerminalText from "@/components/ui/TerminalText";

// Unicorn Studio is browser-only — SSR disabled.
const UnicornScene = dynamic(
  () =>
    import("unicornstudio-react/next").then((m) => ({ default: m.UnicornScene })),
  { ssr: false, loading: () => null }
);

// Prefer env var; fallback keeps the Vercel build working without it.
const UNICORN_PROJECT_ID =
  process.env.NEXT_PUBLIC_UNICORN_SCENE_ID ?? "4spOUVtR0qgdSv9wMwPH";

// Minimal types for the UnicornStudio JS global
interface USScene {
  updateVariable?: (key: string, value: number) => void;
}
interface USGlobal {
  getScene?: (id: string) => USScene | null | undefined;
}

/**
 * Drives the Unicorn Studio "scrollY" data-layer variable (0 → 1).
 *
 * Design goals:
 *  - Zero React state updates — scroll events never trigger re-renders.
 *  - RAF-throttled writes — at most one SDK call per animation frame (60fps).
 *  - Race-condition safe — if the user is already scrolled when the scene
 *    finishes loading, the current position is applied immediately.
 */
function useUnicornScrollBinding() {
  const sceneRef   = useRef<USScene | null>(null);
  const rafRef     = useRef<number | null>(null);
  const pendingRef = useRef(0); // latest scroll (0–1); flushed on next RAF or load

  // Schedule one RAF write per animation frame; skip if already queued.
  const push = useCallback((progress: number) => {
    pendingRef.current = progress;
    if (!sceneRef.current?.updateVariable) return;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      sceneRef.current?.updateVariable?.("scrollY", pendingRef.current);
    });
  }, []);

  // onLoad fires once the SDK has initialised the scene.
  // Capture the scene reference and flush any accumulated scroll position.
  const onSceneLoad = useCallback(() => {
    try {
      const us = (window as Window & { UnicornStudio?: USGlobal }).UnicornStudio;
      const scene = us?.getScene?.(UNICORN_PROJECT_ID) ?? null;
      sceneRef.current = scene;
      // Fix race condition: apply whatever scroll value arrived before load.
      scene?.updateVariable?.("scrollY", pendingRef.current);
    } catch {
      // Progressive enhancement — scroll binding failing is non-fatal.
    }
  }, []);

  // Passive scroll listener. No React state, no re-renders, full 60fps.
  useEffect(() => {
    const handleScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollable))
          : 0;
      push(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [push]);

  return { onSceneLoad };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);
  const { onSceneLoad } = useUnicornScrollBinding();

  // Mount guard: render UnicornScene only after hydration is complete.
  // next/script inside UnicornScene can throw during the hydration phase;
  // this ensures it is purely client-side before it enters the tree.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Unicorn Studio full-bleed background ─────────────────────────── */}
      {/*
       * Absolutely fills the section (inset-0). UnicornScene inherits 100%/100%
       * from its container so it is always fully responsive.
       * pointer-events: none ensures it never intercepts clicks/scroll.
       */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        {isMounted && (
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
            onError={(err) => {
              // Surface SDK errors in dev so they are diagnosable in DevTools.
              // In production the scene simply doesn't render; the void-black
              // background and all hero content remain fully intact.
              if (process.env.NODE_ENV !== "production") {
                console.warn("[UnicornScene] failed to load:", err.message);
              }
            }}
            // Replaces the SDK's built-in pink error card when load fails.
            // showPlaceholderOnError defaults to true; the transparent div
            // means failure is visually silent (void background stays).
            placeholder={<div aria-hidden="true" style={{ display: "none" }} />}
            altText="Living Vessel — interactive generative scene"
          />
        )}
      </div>

      {/* ── Vignette overlay ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-[2] w-full max-w-6xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
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

      {/* ── Footer metadata ──────────────────────────────────────────────── */}
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
