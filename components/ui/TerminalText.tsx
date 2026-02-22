"use client";

import { useState, useEffect, useRef } from "react";

interface Line {
  prefix: string;
  text: string;
  delay: number; // ms delay before this line starts typing
  color?: string;
}

const LINES: Line[] = [
  { prefix: "> ", text: "PRODUCT_MAKER.init()", delay: 800, color: "text-accent" },
  { prefix: "", text: "", delay: 400 },
  { prefix: "// ", text: "Title: Product Maker", delay: 200, color: "text-muted" },
  { prefix: "// ", text: "Role:  Lead Designer @ Hear.ai", delay: 100, color: "text-muted" },
  { prefix: "", text: "", delay: 300 },
  { prefix: ">> ", text: "mission.load()", delay: 200, color: "text-accent" },
  {
    prefix: "",
    text: "Building end-to-end digital products that",
    delay: 120,
    color: "text-text-primary",
  },
  {
    prefix: "",
    text: "bridge complex logic with human experience.",
    delay: 60,
    color: "text-text-primary",
  },
  { prefix: "", text: "", delay: 400 },
  { prefix: ">> ", text: "focus.define()", delay: 200, color: "text-accent" },
  {
    prefix: "",
    text: "I don't just design interfaces —",
    delay: 80,
    color: "text-text-primary",
  },
  {
    prefix: "",
    text: "I architect and build functional systems.",
    delay: 60,
    color: "text-text-primary",
  },
  { prefix: "", text: "", delay: 300 },
  { prefix: ">> ", text: "context.set({ ai: 'Hear.ai', role: 'convergence' })", delay: 200, color: "text-accent-blue" },
  { prefix: "", text: "∎  READY", delay: 400, color: "text-accent" },
];

const CHAR_DELAY = 30;

export default function TerminalText() {
  const [displayedLines, setDisplayedLines] = useState<
    { prefix: string; text: string; color?: string; done: boolean }[]
  >([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIdx >= LINES.length) return;

    const line = LINES[currentLineIdx];

    if (currentCharIdx === 0) {
      // New line: wait for its delay, then start
      const delayTimer = setTimeout(() => {
        if (line.text === "") {
          // Empty line — just add it immediately
          setDisplayedLines((prev) => [
            ...prev,
            { prefix: "", text: "", color: line.color, done: true },
          ]);
          setCurrentLineIdx((i) => i + 1);
        } else {
          setDisplayedLines((prev) => [
            ...prev,
            { prefix: line.prefix, text: "", color: line.color, done: false },
          ]);
          setCurrentCharIdx(1);
        }
      }, line.delay);
      return () => clearTimeout(delayTimer);
    }

    const fullText = line.text;
    if (currentCharIdx <= fullText.length) {
      const charTimer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          const last = { ...updated[updated.length - 1] };
          last.text = fullText.slice(0, currentCharIdx);
          last.done = currentCharIdx === fullText.length;
          updated[updated.length - 1] = last;
          return updated;
        });
        setCurrentCharIdx((c) => c + 1);
      }, CHAR_DELAY);
      return () => clearTimeout(charTimer);
    } else {
      // Line done
      setCurrentLineIdx((i) => i + 1);
      setCurrentCharIdx(0);
    }
  }, [currentLineIdx, currentCharIdx]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const isTypingActive = currentLineIdx < LINES.length;

  return (
    <div
      ref={containerRef}
      className="font-mono text-sm leading-6 max-h-[60vh] overflow-hidden"
      style={{ maxWidth: "520px" }}
    >
      {displayedLines.map((line, i) => (
        <div key={i} className="flex items-start">
          {line.prefix && (
            <span className="text-accent mr-0 select-none">{line.prefix}</span>
          )}
          <span className={line.color ?? "text-text-primary"}>
            {line.text}
          </span>
          {/* Cursor only on last line while active */}
          {i === displayedLines.length - 1 && isTypingActive && (
            <span className="inline-block w-[2px] h-[14px] bg-accent ml-[1px] cursor-blink" />
          )}
        </div>
      ))}
      {/* Final blinking cursor after done */}
      {!isTypingActive && displayedLines.length > 0 && (
        <div className="flex items-center mt-1">
          <span className="text-accent mr-1">{">"}</span>
          <span className="inline-block w-[2px] h-[14px] bg-accent cursor-blink" />
        </div>
      )}
    </div>
  );
}
