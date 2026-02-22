"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Void", index: "01" },
  { id: "extraction", label: "Extraction", index: "02" },
  { id: "blueprint", label: "Blueprint", index: "03" },
  { id: "experience", label: "Experience", index: "04" },
];

export default function HUDNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-0"
      aria-label="Section navigation"
    >
      {/* Vertical spine */}
      <div className="absolute right-[3px] top-0 bottom-0 w-px bg-muted-2" />

      {SECTIONS.map((section, i) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            className="relative flex items-center gap-3 py-4 pr-0 group"
            aria-label={`Go to ${section.label}`}
          >
            {/* Hover label */}
            <motion.span
              animate={{
                opacity: isHovered || isActive ? 1 : 0,
                x: isHovered || isActive ? 0 : 10,
              }}
              transition={{ duration: 0.2 }}
              className={`font-mono text-xs tracking-widest uppercase ${
                isActive ? "text-accent" : "text-muted"
              }`}
            >
              {section.index} {section.label}
            </motion.span>

            {/* Dot */}
            <div className="relative w-[7px] h-[7px] z-10">
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                }}
                className="absolute inset-0 rounded-full bg-accent"
              />
              <div
                className={`absolute inset-0 rounded-full border ${
                  isActive
                    ? "border-accent"
                    : "border-muted group-hover:border-text-primary"
                } transition-colors duration-200`}
              />
            </div>
          </button>
        );
      })}
    </nav>
  );
}
