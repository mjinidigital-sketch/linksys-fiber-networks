import React from 'react'

/**
 * Global background layer featuring:
 * 1. A subtle, multi-stop ambient gradient mesh.
 * 2. A refined, subtle SVG tech-grid pattern with micro-crosshairs and vertex nodes
 *    that is distinctly visible as an accent, yet soft and elegant.
 */
export function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-50 overflow-hidden select-none"
    >
      {/* ── 1. Subtle Ambient Gradient Mesh ───────────────────────────────── */}
      {/* Top brand primary ambient glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[95vw] max-w-[1300px] rounded-full blur-[130px] opacity-60 dark:opacity-35"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(3, 74, 113, 0.22) 0%, rgba(3, 74, 113, 0.05) 50%, transparent 75%)',
        }}
      />

      {/* Top-right subtle secondary (fiber green) glow */}
      <div
        className="absolute -top-16 -right-16 h-[500px] w-[500px] rounded-full blur-[130px] opacity-40 dark:opacity-25"
        style={{
          background:
            'radial-gradient(circle at center, rgba(119, 192, 65, 0.2) 0%, rgba(119, 192, 65, 0.04) 50%, transparent 70%)',
        }}
      />

      {/* Mid-left sky/cyan highlight */}
      <div
        className="absolute top-[35%] -left-28 h-[550px] w-[550px] rounded-full blur-[140px] opacity-35 dark:opacity-20"
        style={{
          background:
            'radial-gradient(circle at center, rgba(13, 164, 245, 0.18) 0%, transparent 70%)',
        }}
      />

      {/* ── 2. Subtle SVG Tech Grid & Crosshairs Pattern ──────────────────── */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none text-primary/10 dark:text-cyan-400/15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="subtle-tech-pattern"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            {/* Fine grid lines (0.5px equivalent) */}
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              className="opacity-70 dark:opacity-50"
            />
            {/* Micro crosshair intersection at vertex */}
            <path
              d="M -2.5 0 H 2.5 M 0 -2.5 V 2.5"
              stroke="currentColor"
              strokeWidth="0.8"
              className="opacity-90 dark:opacity-75 text-primary dark:text-cyan-300"
            />
            {/* Subtle dot at center of tile */}
            <circle
              cx="18"
              cy="18"
              r="0.9"
              fill="currentColor"
              className="opacity-60 dark:opacity-50"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#subtle-tech-pattern)" />
      </svg>
    </div>
  )
}
