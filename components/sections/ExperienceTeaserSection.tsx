"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ExperienceTeaserSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      id="experience"
      className="relative min-h-screen py-32 px-8 md:px-16"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs text-muted tracking-[0.3em] uppercase">
            [04] Experience
          </span>
          <div className="flex-1 h-px bg-muted-2" />
          <span className="font-mono text-xs text-muted">system.log</span>
        </div>

        {/* Nodes */}
        <motion.div
          ref={sectionRef}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col gap-6"
        >
          {/* CURRENT_NODE — fully visible */}
          <motion.div variants={itemVariants}>
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-muted shrink-0">
                [CURRENT_NODE]
              </span>
              <span className="font-mono text-sm text-accent">
                Product Maker @ Hear.ai
              </span>
            </div>
          </motion.div>

          {/* NODE_01 — fades to black */}
          <motion.div
            variants={itemVariants}
            style={{
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
            }}
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-muted shrink-0">
                [NODE_01]
              </span>
              <span className="font-mono text-sm text-text-primary">
                UX/UI Designer @ Intune · May 2023 — 2024
              </span>
            </div>
          </motion.div>

          {/* NODE_02 — near-invisible ghost line */}
          <motion.div
            variants={itemVariants}
            style={{ opacity: 0.15 }}
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-muted shrink-0">
                [NODE_02]
              </span>
              <span className="font-mono text-sm text-text-primary">
                User Experience Designer @ Tap Mobile · June 2022 — May 2023
              </span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={itemVariants}
            className="mt-8"
          >
            <Link
              href="/architecture"
              className="font-mono text-sm text-accent hover:text-accent/70 transition-colors duration-200"
            >
              › INITIALIZE_FULL_ARCHITECTURE
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
