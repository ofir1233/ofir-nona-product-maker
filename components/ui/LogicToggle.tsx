"use client";

import { motion } from "framer-motion";

interface LogicToggleProps {
  active: "ui" | "logic";
  onChange: (mode: "ui" | "logic") => void;
}

export default function LogicToggle({ active, onChange }: LogicToggleProps) {
  return (
    <div className="flex items-center gap-1 hud-border rounded-sm p-1 bg-surface/50 w-fit">
      {(["ui", "logic"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className="relative px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors duration-200"
        >
          {active === mode && (
            <motion.div
              layoutId="toggle-pill"
              className="absolute inset-0 bg-accent/15 border border-accent/40 rounded-sm"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span
            className={
              active === mode
                ? "relative text-accent"
                : "relative text-muted hover:text-text-primary transition-colors"
            }
          >
            {mode === "ui" ? "[ UI ]" : "[ LOGIC ]"}
          </span>
        </button>
      ))}
    </div>
  );
}
