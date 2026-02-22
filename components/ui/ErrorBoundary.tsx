"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** Rendered in place of crashed children. Defaults to a minimal dark fallback. */
  fallback?: ReactNode;
  /** Optional label shown in the default fallback for debugging */
  label?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * React class Error Boundary.
 *
 * Catches exceptions thrown during render, in lifecycle methods, and in
 * constructors of any child component. Prevents a single shader/WebGL
 * failure from cascading and unmounting the whole tree.
 *
 * Usage:
 *   <ErrorBoundary label="Hero 3D">
 *     <Scene />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev; swap for a real error reporter in production
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[ErrorBoundary] ${this.props.label ?? "Component"} crashed:`,
        error,
        info.componentStack
      );
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      // Default: invisible to the user but non-crashing
      return (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "transparent",
            pointerEvents: "none",
          }}
        />
      );
    }

    return this.props.children;
  }
}
