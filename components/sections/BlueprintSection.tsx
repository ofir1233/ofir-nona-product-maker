"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import LogicToggle from "@/components/ui/LogicToggle";
import { PROJECTS, type Project } from "@/lib/projects";

// SVG Architecture Diagram
function ArchDiagram({ project }: { project: Project }) {
  const { nodes, edges } = project.architecture;

  // Map normalized coords (0–100) to SVG viewport
  const W = 500;
  const H = 200;

  const getPos = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0 };
    return { x: (node.x / 100) * W, y: (node.y / 100) * H };
  };

  const nodeColors: Record<string, string> = {
    input: "#4fffb0",
    process: "#4fc3ff",
    output: "#a78bfa",
    ai: "#fbbf24",
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: "200px" }}
    >
      {/* Edges */}
      {edges.map((edge, i) => {
        const from = getPos(edge.from);
        const to = getPos(edge.to);
        const mx = (from.x + to.x) / 2;
        return (
          <motion.path
            key={`${edge.from}-${edge.to}`}
            d={`M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`}
            stroke="rgba(79,255,176,0.3)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const cx = (node.x / 100) * W;
        const cy = (node.y / 100) * H;
        const color = nodeColors[node.type] ?? "#e8e8e8";

        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {/* Node box */}
            <rect
              x={cx - 28}
              y={cy - 14}
              width={56}
              height={28}
              rx={2}
              fill="rgba(10,10,10,0.9)"
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            {/* Label */}
            {node.label.split("\n").map((line, li) => (
              <text
                key={li}
                x={cx}
                y={cy + (li - (node.label.split("\n").length - 1) / 2) * 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fontFamily="monospace"
                fill={color}
                fillOpacity="0.9"
              >
                {line}
              </text>
            ))}
          </motion.g>
        );
      })}
    </svg>
  );
}

// Single project card
function ProjectCard({ project }: { project: Project }) {
  const [mode, setMode] = useState<"ui" | "logic">("ui");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  const activeLayer = mode === "ui" ? project.ui : project.logic;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="hud-border rounded-sm overflow-hidden bg-surface/20"
    >
      {/* Card header */}
      <div className="flex items-start justify-between p-6 pb-4 border-b border-muted-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs text-muted">{project.index}</span>
            <span className="font-mono text-xs text-accent border border-accent/30 px-2 py-0.5 rounded-sm">
              {project.company}
            </span>
            <span className="font-mono text-xs text-muted">{project.year}</span>
          </div>
          <h3 className="font-sans font-semibold text-xl text-text-primary">
            {project.title}
          </h3>
          <p className="font-sans font-light text-sm text-muted mt-1 max-w-md">
            {project.logline}
          </p>
        </div>
        <LogicToggle active={mode} onChange={setMode} />
      </div>

      {/* Card body — animated layer swap */}
      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="p-6"
          >
            {mode === "ui" ? (
              <div className="space-y-5">
                {/* UI Layer */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span className="font-mono text-xs text-accent uppercase tracking-wider">
                    Interface Layer
                  </span>
                </div>
                <h4 className="font-sans font-medium text-lg text-text-primary">
                  {activeLayer.headline}
                </h4>
                <p className="font-sans font-light text-sm text-muted leading-relaxed max-w-lg">
                  {activeLayer.body}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {activeLayer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-muted border border-muted-2 px-2 py-1 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Visual placeholder — abstract UI mockup */}
                <div className="mt-4 hud-border rounded-sm bg-surface/30 h-24 flex items-center justify-center overflow-hidden">
                  <div className="flex gap-3 items-end opacity-40">
                    {[40, 70, 55, 85, 45, 60, 75].map((h, i) => (
                      <div
                        key={i}
                        className="w-2 bg-accent/60 rounded-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Logic Layer */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-blue rounded-full" />
                  <span className="font-mono text-xs text-accent-blue uppercase tracking-wider">
                    Architecture Layer
                  </span>
                </div>
                <h4 className="font-sans font-medium text-lg text-text-primary">
                  {activeLayer.headline}
                </h4>
                <p className="font-sans font-light text-sm text-muted leading-relaxed max-w-lg">
                  {activeLayer.body}
                </p>
                {/* Architecture SVG */}
                <div className="mt-2 hud-border rounded-sm bg-surface/50 p-4">
                  <ArchDiagram project={project} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeLayer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-accent-blue/70 border border-accent-blue/20 px-2 py-1 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function BlueprintSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-20%" });

  return (
    <section
      id="blueprint"
      className="relative min-h-screen py-32 px-8 md:px-16"
      style={{ zIndex: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs text-muted tracking-[0.3em] uppercase">
            [03] Blueprint
          </span>
          <div className="flex-1 h-px bg-muted-2" />
          <span className="font-mono text-xs text-muted">
            the.work
          </span>
        </div>

        {/* Heading */}
        <div ref={headingRef} className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans font-light text-4xl md:text-6xl text-text-primary"
          >
            The Work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 font-mono text-sm text-muted max-w-lg"
          >
            Toggle{" "}
            <span className="text-accent">[ UI ]</span> /{" "}
            <span className="text-accent-blue">[ LOGIC ]</span> to see the
            full stack — from human experience to machine architecture.
          </motion.p>
        </div>

        {/* Project cards */}
        <div className="flex flex-col gap-8">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Footer / CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-32 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-t border-muted-2 pt-12"
        >
          <div>
            <p className="font-sans font-light text-xl text-text-primary">
              Dual Agent — Spirit in the World of Action
            </p>
            <p className="font-mono text-sm text-muted mt-2">
              Building stable vessels for infinite lights.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-start md:items-end">
            <span className="font-mono text-xs text-muted">
              Available for conversation
            </span>
            <a
              href="mailto:hello@productmaker.io"
              className="font-mono text-sm text-accent hover:text-glow transition-all duration-200 border-b border-accent/30 hover:border-accent pb-px"
            >
              hello@productmaker.io
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
