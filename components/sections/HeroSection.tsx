"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import TerminalText from "@/components/ui/TerminalText";

// ─── Config ──────────────────────────────────────────────────────────────────

const PROJECT_ID = "BkVV79z7AKFPARg65oXp";

const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js";

// ─── Lazy-load the component — no SSR (WebGL + window APIs) ─────────────────

const UnicornScene = dynamic(
  () => import("unicornstudio-react/next"),
  { ssr: false, loading: () => null }
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface USDataLayer {
  updateVariable?: (key: string, value: number) => void;
}

interface UnicornStudioGlobal {
  getScene?: (id: string) => USDataLayer | null | undefined;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroSection() {
  const rafRef    = useRef<number | null>(null);
  const scrollRef = useRef(0);
  const sceneRef  = useRef<USDataLayer | null>(null);

  // ── Scroll → "scrollY" variable binding ───────────────────────────────────
  // Polls for the scene handle after the UnicornScene component mounts,
  // then drives it at 60 fps via a passive scroll listener + RAF.
  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout>;

    const pollForScene = () => {
      const us = (window as Window & { UnicornStudio?: UnicornStudioGlobal })
        .UnicornStudio;
      const handle = us?.getScene?.(PROJECT_ID) ?? null;
      if (handle) {
        sceneRef.current = handle;
        // Flush any scroll that built up while the SDK was loading
        handle.updateVariable?.("scrollY", scrollRef.current);
      } else {
        pollTimer = setTimeout(pollForScene, 300);
      }
    };

    // Give the UnicornScene component 600 ms to initialise before polling
    pollTimer = setTimeout(pollForScene, 600);

    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current =
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;

      if (!sceneRef.current?.updateVariable) return;
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        sceneRef.current?.updateVariable?.("scrollY", scrollRef.current);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(pollTimer);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Unicorn Studio scene — full-bleed background ─────────────────── */}
      <div
        className="absolute inset-0 z-0 w-full h-full"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        <UnicornScene
          projectId={PROJECT_ID}
          sdkUrl={SDK_URL}
          width="100%"
          height="100%"
        />
      </div>

      {/* ── Radial vignette — keeps terminal text legible over the scene ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.82) 100%)",
            "linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 55%)",
          ].join(", "),
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
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(18,18,18,0.82) 0%, rgba(6,6,6,0.75) 100%)",
              backdropFilter: "blur(32px) saturate(180%) brightness(0.85)",
              WebkitBackdropFilter:
                "blur(32px) saturate(180%) brightness(0.85)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              boxShadow: [
                /* top edge — light catching glass */
                "inset 0 1.5px 0 rgba(255,255,255,0.13)",
                /* left edge — primary light refraction */
                "inset 1.5px 0 0 rgba(255,255,255,0.10)",
                /* right edge — warm scene-light spill */
                "inset -1px 0 0 rgba(255,200,100,0.07)",
                /* bottom edge — shadow */
                "inset 0 -1px 0 rgba(0,0,0,0.4)",
                /* outer ambient */
                "0 0 0 1px rgba(255,255,255,0.03)",
                "0 24px 56px rgba(0,0,0,0.85)",
                "0 4px 16px rgba(0,0,0,0.6)",
              ].join(", "),
            }}
            className="p-6"
          >
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
