"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PILLARS = [
  {
    id: "01",
    label: "Schema",
    subtitle: "Data Architecture",
    description:
      "Every product begins as a data model. I define the entities, relationships, and contracts before the first pixel is placed.",
    code: `type Product = {
  id: string
  state: ProductState
  schema: DataSchema
  logic: BusinessRule[]
}`,
  },
  {
    id: "02",
    label: "State",
    subtitle: "System Logic",
    description:
      "UI is a function of state. I design the state machines that govern every interaction, every transition, every edge case.",
    code: `const machine = createMachine({
  initial: 'idle',
  states: {
    idle: { on: { ACTIVATE: 'running' }},
    running: { on: { COMPLETE: 'done' }}
  }
})`,
  },
  {
    id: "03",
    label: "Logic",
    subtitle: "Execution Layer",
    description:
      "The bridge between human intention and machine action. I wire API flows, orchestrate AI pipelines, and close the feedback loop.",
    code: `async function processIntent(
  input: UserIntent
): Promise<ProductAction> {
  const ctx = await ai.understand(input)
  const action = logic.resolve(ctx)
  return action.execute()
}`,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
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

export default function ExtractionSection() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  const headlineInView = useInView(headlineRef, { once: true, margin: "-20%" });
  const pillarsInView = useInView(pillarsRef, { once: true, margin: "-10%" });

  return (
    <section
      id="extraction"
      className="relative min-h-screen py-32 px-8 md:px-16"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs text-muted tracking-[0.3em] uppercase">
            [02] Extraction
          </span>
          <div className="flex-1 h-px bg-muted-2" />
          <span className="font-mono text-xs text-muted">
            designer → maker
          </span>
        </div>

        {/* Main headline */}
        <div ref={headlineRef} className="mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={headlineInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <motion.span
                initial={{ y: "100%" }}
                animate={headlineInView ? { y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block font-sans font-light text-5xl md:text-7xl text-muted line-through decoration-accent/60 decoration-2"
              >
                Designer
              </motion.span>
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={headlineInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block font-mono text-xl text-muted"
              >
                →
              </motion.span>
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={headlineInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block font-sans font-semibold text-5xl md:text-7xl text-text-primary"
              >
                Maker
              </motion.span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headlineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 max-w-xl text-muted font-sans font-light text-lg leading-relaxed"
          >
            The evolution isn't aesthetic — it's architectural. A Maker builds
            the{" "}
            <span className="text-text-primary font-normal">House</span>,
            doesn't just sketch the blueprint.
          </motion.p>
        </div>

        {/* Three pillars */}
        <motion.div
          ref={pillarsRef}
          variants={containerVariants}
          initial="hidden"
          animate={pillarsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {PILLARS.map((pillar) => (
            <motion.div key={pillar.id} variants={itemVariants}>
              <div className="hud-border rounded-sm p-6 h-full flex flex-col gap-5 bg-surface/20 group hover:bg-surface/40 transition-colors duration-300">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-muted">{pillar.id}</span>
                    <h3 className="font-sans font-semibold text-2xl text-text-primary mt-1">
                      {pillar.label}
                    </h3>
                    <p className="font-mono text-xs text-accent mt-1">
                      {pillar.subtitle}
                    </p>
                  </div>
                  {/* Corner accent */}
                  <div className="w-2 h-2 border border-accent/30 group-hover:border-accent transition-colors duration-300" />
                </div>

                {/* Description */}
                <p className="font-sans font-light text-sm text-muted leading-relaxed flex-1">
                  {pillar.description}
                </p>

                {/* Code snippet */}
                <div className="border-t border-muted-2 pt-4">
                  <pre className="font-mono text-xs text-accent-blue/70 leading-5 overflow-x-auto whitespace-pre-wrap">
                    <code>{pillar.code}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider to next section */}
        <div className="mt-32 flex items-center gap-4">
          <div className="flex-1 h-px bg-muted-2" />
          <span className="font-mono text-xs text-muted tracking-[0.3em]">
            NEXT: THE BLUEPRINT
          </span>
        </div>
      </div>
    </section>
  );
}
