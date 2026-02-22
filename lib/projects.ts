export interface ProjectLayer {
  type: "ui" | "logic";
  headline: string;
  body: string;
  tags: string[];
}

export interface Project {
  id: string;
  index: string;
  title: string;
  company: string;
  year: string;
  logline: string;
  ui: ProjectLayer;
  logic: ProjectLayer;
  // SVG architecture nodes for the logic diagram
  architecture: {
    nodes: { id: string; label: string; x: number; y: number; type: "input" | "process" | "output" | "ai" }[];
    edges: { from: string; to: string }[];
  };
}

export const PROJECTS: Project[] = [
  {
    id: "hear-ai",
    index: "01",
    title: "Hear.ai Product System",
    company: "Hear.ai",
    year: "2024–Present",
    logline:
      "Converging AI inference, audiological data, and clinical UX into a single coherent product experience.",
    ui: {
      type: "ui",
      headline: "Where Hearing Meets Intelligence",
      body: "A product experience that makes complex AI-powered hearing analysis feel effortless. Progressive disclosure, real-time feedback, and clinical-grade precision wrapped in a human interface.",
      tags: ["Product Design", "AI UX", "Clinical Interface", "Design System"],
    },
    logic: {
      type: "logic",
      headline: "AI ∩ Audiological Pipeline",
      body: "Audio input → signal processing → ML inference → clinical scoring → UI state update. Every interaction triggers a deterministic pipeline with fallback states for each node.",
      tags: ["Audio DSP", "ML Inference", "State Machine", "Real-time API", "WebRTC"],
    },
    architecture: {
      nodes: [
        { id: "user", label: "User Input", x: 10, y: 45, type: "input" },
        { id: "audio", label: "Audio Capture\n(WebRTC)", x: 28, y: 45, type: "process" },
        { id: "dsp", label: "DSP Layer", x: 46, y: 30, type: "process" },
        { id: "ml", label: "ML Model\n(Inference)", x: 64, y: 30, type: "ai" },
        { id: "score", label: "Clinical Score", x: 82, y: 45, type: "output" },
        { id: "state", label: "UI State", x: 64, y: 60, type: "process" },
        { id: "ui", label: "Interface", x: 82, y: 65, type: "output" },
      ],
      edges: [
        { from: "user", to: "audio" },
        { from: "audio", to: "dsp" },
        { from: "dsp", to: "ml" },
        { from: "ml", to: "score" },
        { from: "ml", to: "state" },
        { from: "state", to: "ui" },
      ],
    },
  },
  {
    id: "product-os",
    index: "02",
    title: "Product OS",
    company: "Internal",
    year: "2025",
    logline:
      "A design-to-code operating system that eliminates the gap between intent and implementation.",
    ui: {
      type: "ui",
      headline: "Design Once, Deploy Everywhere",
      body: "A unified system where design tokens, component specs, and interaction rules live in a single source of truth. Designers and engineers speaking the same language through a shared schema.",
      tags: ["Design Systems", "Tokens", "Component Library", "Documentation"],
    },
    logic: {
      type: "logic",
      headline: "Token → Component → System",
      body: "Design tokens as the source node. Each token propagates through a transformation pipeline: Figma variables → style dictionary → CSS custom properties → component props → documentation.",
      tags: ["Style Dictionary", "Token Pipeline", "Figma API", "CI/CD", "TypeScript"],
    },
    architecture: {
      nodes: [
        { id: "figma", label: "Figma\nVariables", x: 10, y: 45, type: "input" },
        { id: "api", label: "Figma API", x: 28, y: 30, type: "process" },
        { id: "sd", label: "Style\nDictionary", x: 46, y: 30, type: "process" },
        { id: "css", label: "CSS Tokens", x: 64, y: 20, type: "output" },
        { id: "ts", label: "TS Types", x: 64, y: 45, type: "output" },
        { id: "comp", label: "Components", x: 82, y: 35, type: "output" },
        { id: "docs", label: "Docs Site", x: 82, y: 60, type: "output" },
      ],
      edges: [
        { from: "figma", to: "api" },
        { from: "api", to: "sd" },
        { from: "sd", to: "css" },
        { from: "sd", to: "ts" },
        { from: "ts", to: "comp" },
        { from: "css", to: "comp" },
        { from: "comp", to: "docs" },
      ],
    },
  },
];
