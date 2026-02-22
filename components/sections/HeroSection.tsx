"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import TerminalText from "@/components/ui/TerminalText";

// ─── Config ──────────────────────────────────────────────────────────────────

const PROJECT_ID =
  process.env.NEXT_PUBLIC_UNICORN_SCENE_ID ?? "pHiEAnP2IEksAqDgEcZH";

// Versioned CDN URL — pinned to match unicornstudio-react v2.0.1-1
const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.1/dist/unicornStudio.umd.js";

// Stable DOM element ID the SDK renders the canvas into
const CANVAS_ELEMENT_ID = "unicorn-hero-canvas";

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1500; // 1.5 s → 3 s → 6 s (exponential)

// ─── Types ───────────────────────────────────────────────────────────────────

// Lifecycle handle returned by addScene() — typed from the SDK's d.ts
interface USLifecycle {
  destroy: () => void;
  resize?: () => void;
}

// Internal data-layer handle returned by getScene() — undocumented but stable
interface USDataLayer {
  updateVariable?: (key: string, value: number) => void;
}

interface UnicornStudioGlobal {
  addScene: (cfg: Record<string, unknown>) => Promise<USLifecycle>;
  getScene?: (id: string) => USDataLayer | null | undefined;
}

// ─── SDK loader ──────────────────────────────────────────────────────────────

/**
 * Injects the Unicorn Studio UMD script into <head> exactly once.
 * If it has already been injected (or already ran), resolves immediately.
 * Using useEffect script injection instead of next/script to guarantee
 * the onLoad callback fires AFTER window.UnicornStudio is fully initialised.
 */
function loadSDK(): Promise<void> {
  const w = window as Window & { UnicornStudio?: UnicornStudioGlobal };

  // Fast path — SDK already on the page
  if (w.UnicornStudio?.addScene) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Reuse an in-flight tag if one already exists (e.g. HMR)
    let tag = document.querySelector<HTMLScriptElement>("[data-us-sdk]");

    if (!tag) {
      tag = document.createElement("script");
      tag.src = SDK_URL;
      tag.async = true;
      tag.setAttribute("data-us-sdk", "");
      document.head.appendChild(tag);
    }

    const onLoad = () => {
      cleanup();
      // Double-check the global was actually set by the script
      if ((window as Window & { UnicornStudio?: UnicornStudioGlobal }).UnicornStudio?.addScene) {
        resolve();
      } else {
        reject(new Error("SDK loaded but window.UnicornStudio.addScene is missing"));
      }
    };
    const onError = () => {
      cleanup();
      reject(new Error("UnicornStudio SDK script failed to load from CDN"));
    };
    const cleanup = () => {
      tag!.removeEventListener("load", onLoad);
      tag!.removeEventListener("error", onError);
    };

    tag.addEventListener("load", onLoad);
    tag.addEventListener("error", onError);
  });
}

// ─── Scene initialiser ───────────────────────────────────────────────────────

/**
 * Calls window.UnicornStudio.addScene() with the given production flag.
 * Returns the lifecycle handle on success, throws on failure.
 *
 * We try production: true first (published scene), then fall back to
 * production: false (draft/development scene). This covers the common
 * case where the scene exists but has not yet been deployed in the
 * Unicorn Studio editor.
 */
async function mountScene(
  elementId: string,
  projectId: string,
  productionMode: boolean
): Promise<USLifecycle> {
  const us = (window as Window & { UnicornStudio?: UnicornStudioGlobal })
    .UnicornStudio;
  if (!us?.addScene) throw new Error("UnicornStudio.addScene is unavailable");

  return us.addScene({
    elementId,
    projectId,
    scale: 1,
    dpi: 1.5,
    fps: 60,
    production: productionMode,
    lazyLoad: false,
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroSection() {
  const canvasRef    = useRef<HTMLDivElement>(null);
  const lifecycleRef = useRef<USLifecycle | null>(null); // addScene() handle → destroy
  const dataRef      = useRef<USDataLayer | null>(null);  // getScene() handle → updateVariable
  const rafRef       = useRef<number | null>(null);
  const scrollRef    = useRef(0);  // latest scroll progress (0–1)
  const aliveRef     = useRef(true);

  const [isMounted, setIsMounted] = useState(false);

  // ── 1. Mount guard — renders nothing until hydration completes ─────────────
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── 2. SDK load + scene init (with retry + production fallback) ────────────
  useEffect(() => {
    if (!isMounted) return;

    aliveRef.current = true;
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const attempt = async () => {
      if (!aliveRef.current || !canvasRef.current) return;

      // Ensure the container has the stable ID the SDK will populate
      canvasRef.current.id = CANVAS_ELEMENT_ID;

      try {
        // Step 1: load SDK (no-op if already on page)
        await loadSDK();
        if (!aliveRef.current) return;

        // Step 2: try published scene first, then draft fallback
        let lifecycle: USLifecycle;
        try {
          lifecycle = await mountScene(CANVAS_ELEMENT_ID, PROJECT_ID, true);
        } catch (prodErr) {
          if (!aliveRef.current) return;
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "[UnicornScene] production mode failed, trying development mode:",
              prodErr instanceof Error ? prodErr.message : prodErr
            );
          }
          lifecycle = await mountScene(CANVAS_ELEMENT_ID, PROJECT_ID, false);
        }

        if (!aliveRef.current) {
          lifecycle.destroy();
          return;
        }

        // Step 3: store lifecycle handle and capture data-layer handle
        lifecycleRef.current = lifecycle;

        const us = (window as Window & { UnicornStudio?: UnicornStudioGlobal })
          .UnicornStudio;
        dataRef.current = us?.getScene?.(PROJECT_ID) ?? null;

        // Flush any scroll that accumulated while the SDK was loading
        dataRef.current?.updateVariable?.("scrollY", scrollRef.current);

        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[UnicornScene] ✓ scene mounted — project: ${PROJECT_ID}`
          );
        }
      } catch (err) {
        if (!aliveRef.current) return;

        const msg = err instanceof Error ? err.message : String(err);

        if (retries < MAX_RETRIES) {
          const delay = RETRY_BASE_MS * Math.pow(2, retries);
          retries++;
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[UnicornScene] attempt ${retries}/${MAX_RETRIES} failed: ${msg}` +
              ` — retrying in ${delay}ms`
            );
          }
          retryTimer = setTimeout(attempt, delay);
        } else if (process.env.NODE_ENV !== "production") {
          console.error(
            `[UnicornScene] all ${MAX_RETRIES} retries exhausted.`,
            "\nProject ID:", PROJECT_ID,
            "\nLast error:", msg,
            "\nCheck: (1) scene is published in Unicorn Studio, " +
            "(2) project ID matches the embed code, " +
            "(3) network is reachable from the browser."
          );
        }
      }
    };

    // 200 ms breathing room for the page to finish hydrating
    // before the first network fetch goes out.
    const kickoff = setTimeout(attempt, 200);

    return () => {
      aliveRef.current = false;
      clearTimeout(kickoff);
      if (retryTimer) clearTimeout(retryTimer);
      lifecycleRef.current?.destroy();
      lifecycleRef.current = null;
      dataRef.current = null;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isMounted]);

  // ── 3. Scroll → "scrollY" variable binding ────────────────────────────────
  // Pure DOM listener + RAF — zero React state updates, full 60 fps.
  // Drives the fluid-motion → structured-grid shader transition (0 → 1).
  useEffect(() => {
    if (!isMounted) return;

    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current =
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;

      if (!dataRef.current?.updateVariable) return;
      if (rafRef.current !== null) return; // already queued for this frame

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        dataRef.current?.updateVariable?.("scrollY", scrollRef.current);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isMounted]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Unicorn Studio canvas container ──────────────────────────────── */}
      {/*
       * Empty div on the server. After mount the SDK populates it with a
       * full-screen <canvas>. absolute inset-0 makes it fill the section;
       * pointer-events: none keeps all scroll/click events flowing to the
       * content layers above it.
       */}
      {isMounted && (
        <div
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          style={{
            zIndex: -1,
            pointerEvents: "none",
            opacity: 1,
          }}
        />
      )}

      {/* ── Radial vignette — keeps terminal text legible over the scene ── */}
      {/*
       * Two layers:
       *  1. Edge darkening (radial) — kills any bright spill around the frame.
       *  2. Left-side shadow (linear) — creates a reading surface behind the
       *     terminal panel regardless of the scene's colour at that point.
       */}
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
          <div className="hud-border rounded-sm p-6 bg-black/40 backdrop-blur-md">
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
