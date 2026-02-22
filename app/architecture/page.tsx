"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

// ─── Data ────────────────────────────────────────────────────────────────────

const NODES = [
  {
    version: "v2024.Current",
    badge: "[CURRENT]",
    company: "Hear.ai",
    role: "Product Maker",
    period: "2024 — Present",
    description:
      "Architecting consciousness into AI systems; bridging complex logic with human experience.",
    tags: ["PRODUCT_DESIGN", "AI_SYSTEMS", "FULL_STACK_UX"],
    isCurrent: true,
  },
  {
    version: "v2023.01",
    badge: null,
    company: "Intune · Tel Aviv",
    role: "UX/UI Designer",
    period: "May 2023 — 2024",
    description:
      "UI/UX initiatives for enterprise-level applications, focusing on high-performance computing solutions. Designed data-driven dashboards and monitoring tools, improving analytics accessibility. Created scalable design systems, enhancing efficiency and consistency across teams. Conducted UX research and user testing to refine complex workflows.",
    tags: ["DESIGN_SYSTEMS", "DATA_VIZ", "ENTERPRISE_UX", "HPC"],
    isCurrent: false,
  },
  {
    version: "v2022.01",
    badge: null,
    company: "Tap Mobile · Beersheba",
    role: "User Experience Designer",
    period: "June 2022 — May 2023",
    description:
      "Spearheaded the design of multiple high-impact applications with a focus on user engagement. Analyzed user behavior through funnel analytics to optimize UX strategies. Collaborated with PMs and developers to integrate seamless experiences. Applied best practices in typography, color theory, and iconography for intuitive UI.",
    tags: ["MOBILE_UX", "FUNNEL_ANALYTICS", "BEHAVIOR_MODELING"],
    isCurrent: false,
  },
  {
    version: "v2020.02",
    badge: null,
    company: "Qualish · Beersheba",
    role: "UX/UI Designer",
    period: "May 2020 — Dec 2020",
    description:
      "Translated customer needs into wireframes, workflows, and interactive prototypes. Designed end-to-end experiences, ensuring usability for diverse user bases. Worked closely with high-level management to align UX goals with business strategy.",
    tags: ["WIREFRAMING", "PROTOTYPING", "UX_STRATEGY"],
    isCurrent: false,
  },
  {
    version: "v2020.01",
    badge: null,
    company: "VPlan Solutions · Tel Aviv",
    role: "UX/UI Designer",
    period: "March 2020 — June 2020",
    description:
      "Designed and developed interfaces for global clients, adapting to varied cultural contexts. Created clear and satisfying UX solutions for complex concepts. Enhanced visual communication through branding and interaction design.",
    tags: ["BRANDING", "INTERACTION_DESIGN", "GLOBAL_UX"],
    isCurrent: false,
  },
  {
    version: "v????.??",
    badge: null,
    company: "Self Employed",
    role: "3D Artist",
    period: "Independent",
    description:
      "Developed robotic mechanics and character designs for animation projects. Focused on bringing detailed, high-fidelity characters to life in various digital environments.",
    tags: ["3D_DESIGN", "CHARACTER_DESIGN", "ANIMATION", "UNREAL_ENGINE"],
    isCurrent: false,
  },
  {
    version: "v2015.01",
    badge: null,
    company: "IDF",
    role: "Combat Medic",
    period: "Nov 2015 — July 2018",
    description:
      "Managed medical operations and provided emergency care. Led a team responsible for health and safety protocols.",
    tags: ["LEADERSHIP", "CRITICAL_SYSTEMS", "TEAM_MANAGEMENT"],
    isCurrent: false,
  },
];

const SKILLS = [
  {
    category: "UX",
    label: "User Experience",
    items: ["Research", "Wireframing", "User Flows", "Interaction Design"],
  },
  {
    category: "UI",
    label: "User Interface",
    items: [
      "High-Fidelity Prototyping",
      "Component Libraries",
      "Design Systems",
    ],
  },
  {
    category: "DATA",
    label: "Data Visualization",
    items: [
      "Complex Dashboards",
      "Analytics Tools",
      "Monitoring Interfaces",
    ],
  },
  {
    category: "A11Y",
    label: "Accessibility & Usability",
    items: ["Inclusive Design (WCAG)", "Cognitive Load Optimization"],
  },
  {
    category: "TOOLS",
    label: "Design Tools",
    items: [
      "Figma",
      "Sketch",
      "Adobe Creative Suite",
      "InVision",
      "Studio",
      "Wordpress",
      "Unreal Engine",
    ],
  },
  {
    category: "DEV",
    label: "Front-End Knowledge",
    items: ["HTML", "CSS", "JavaScript"],
  },
  {
    category: "BRAND",
    label: "Branding & Identity",
    items: ["Logo Design", "Style Guides", "Brand Consistency"],
  },
  {
    category: "COLLAB",
    label: "Collaboration",
    items: [
      "Cross-functional Teams",
      "PMs & Developers",
      "Stakeholder Alignment",
    ],
  },
];

const LANGUAGES = [
  { name: "English", level: "Fluent" },
  { name: "Hebrew", level: "Native" },
];

const HOBBIES = [
  "Exploring innovative design trends + experimenting with new UI/UX concepts",
  "Gaming — analyzing game mechanics from a UX perspective",
  "Diving into sci-fi and futuristic art for creative inspiration",
  "Practicing mindfulness and self-improvement through philosophy and spirituality",
  "Staying active — skating and hiking",
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ index, label, right }: { index: string; label: string; right?: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="font-mono text-xs text-muted tracking-[0.3em] uppercase">
        [{index}] {label}
      </span>
      <div className="flex-1 h-px bg-muted-2" />
      {right && (
        <span className="font-mono text-xs text-muted">{right}</span>
      )}
    </div>
  );
}

function NodeCard({ node }: { node: (typeof NODES)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <motion.div
        variants={itemVariants}
        className="hud-border rounded-sm p-6 bg-surface/20 hover:bg-surface/40 transition-colors duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted">{node.version}</span>
            {node.badge && (
              <span className="font-mono text-xs text-accent border border-accent/30 px-1.5 py-0.5 rounded-sm">
                {node.badge}
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-muted">{node.period}</span>
        </div>

        <p className="font-mono text-xs text-muted mb-1">{node.company}</p>
        <h2
          className={`font-sans font-semibold text-xl mb-4 ${
            node.isCurrent ? "text-accent" : "text-text-primary"
          }`}
        >
          {node.role}
        </h2>

        <p className="font-sans font-light text-sm text-muted leading-relaxed mb-5">
          {node.description}
        </p>

        <div className="flex flex-wrap gap-2 border-t border-muted-2 pt-4">
          {node.tags.map((tag) => (
            <span key={tag} className="font-mono text-xs text-accent-blue/70">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkillsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {SKILLS.map((skill) => (
        <motion.div
          key={skill.category}
          variants={itemVariants}
          className="hud-border rounded-sm p-5 bg-surface/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-accent">[{skill.category}]</span>
            <span className="font-mono text-xs text-muted">{skill.label}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {skill.items.map((item) => (
              <span key={item} className="font-mono text-xs text-text-primary/70">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ProtocolsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {/* Languages */}
      <motion.div variants={itemVariants} className="hud-border rounded-sm p-5 bg-surface/20">
        <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
          Languages
        </p>
        <div className="flex flex-col gap-3">
          {LANGUAGES.map((lang) => (
            <div key={lang.name} className="flex items-center justify-between">
              <span className="font-mono text-sm text-text-primary">{lang.name}</span>
              <span className="font-mono text-xs text-accent">{lang.level}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Hobbies */}
      <motion.div variants={itemVariants} className="hud-border rounded-sm p-5 bg-surface/20">
        <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
          Signal Sources
        </p>
        <ul className="flex flex-col gap-2">
          {HOBBIES.map((hobby, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-mono text-xs text-accent mt-0.5">›</span>
              <span className="font-sans font-light text-xs text-muted leading-relaxed">
                {hobby}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArchitecturePage() {
  return (
    <SmoothScrollProvider>
      <div
        className="min-h-screen bg-void text-text-primary px-8 md:px-16 py-16"
        style={{ zIndex: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-16">
            <Link
              href="/"
              className="font-mono text-xs text-muted hover:text-accent transition-colors duration-200"
            >
              ← [HOME]
            </Link>
            <div className="flex items-center gap-6">
              <span className="font-mono text-xs text-muted tracking-[0.3em] uppercase">
                ARCHITECTURE_LOG.v1
              </span>
              <a
                href="/Ofir_Nona.pdf"
                download
                className="font-mono text-xs text-muted hover:text-accent transition-colors duration-200"
              >
                [Export_Raw_Data.pdf]
              </a>
            </div>
          </div>

          <div className="h-px bg-muted-2 mb-16" />

          {/* ── Employment History ── */}
          <div className="mb-20">
            <SectionLabel index="01" label="Employment_History" right="chronological.desc" />
            <div className="flex flex-col gap-6">
              {NODES.map((node) => (
                <NodeCard key={node.version} node={node} />
              ))}
            </div>
          </div>

          {/* ── Skills Matrix ── */}
          <div className="mb-20">
            <SectionLabel index="02" label="Skills_Matrix" right="expertise.map" />
            <SkillsGrid />
          </div>

          {/* ── Protocols ── */}
          <div className="mb-20">
            <SectionLabel index="03" label="Protocols" right="lang + signal_sources" />
            <ProtocolsSection />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-muted-2" />
            <span className="font-mono text-xs text-muted tracking-[0.3em]">
              END_OF_LOG
            </span>
          </div>
        </div>
      </div>
    </SmoothScrollProvider>
  );
}
