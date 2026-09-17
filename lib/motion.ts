/**
 * ─── Shared Motion Design System ───────────────────────────────────────────
 * Single source of truth for all Framer Motion variants & helpers.
 * Import from here instead of redefining per-component.
 */

import type { Variants } from 'framer-motion'

// ── Easing curves ────────────────────────────────────────────────────────────
export const ease = {
  out: [0.0, 0.0, 0.2, 1.0] as const,          // smooth deceleration (material)
  inOut: [0.4, 0.0, 0.2, 1.0] as const,         // symmetric
  spring: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as const,
  springGentle: { type: 'spring', stiffness: 180, damping: 24, mass: 0.9 } as const,
}

// ── Viewport defaults ─────────────────────────────────────────────────────────
/** Use on every whileInView component. `once:true` prevents re-triggering. */
export const viewport = {
  default: { once: true, amount: 0.15 },
  eager:   { once: true, amount: 0.05 },
  lazy:    { once: true, amount: 0.30 },
} as const

// ── Section-level reveal (wrapping element) ───────────────────────────────────
/** Fade + slide-up for section containers. */
export const sectionReveal: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: ease.out },
  },
}

/** Fade only — for sections already at their final y position. */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: ease.out } },
}

// ── Children stagger container ────────────────────────────────────────────────
/** Wrap a list in this to auto-stagger children. */
export function staggerContainer(staggerChildren = 0.09, delayChildren = 0.05): Variants {
  return {
    hidden:  {},
    visible: { transition: { staggerChildren, delayChildren } },
  }
}

// ── Individual item animations ────────────────────────────────────────────────

/** Fade + slide up — standard card / list item. */
export const itemReveal: Variants = {
  hidden:  { opacity: 0, y: 22, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: ease.out },
  },
}

/** Fade + slide in from left. */
export const itemFromLeft: Variants = {
  hidden:  { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: ease.out } },
}

/** Fade + slide in from right. */
export const itemFromRight: Variants = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: ease.out } },
}

/** Scale pop — great for stat numbers / badges. */
export const scalePop: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: ease.springGentle,
  },
}

/** Heading line — slides up through a clip. */
export const headingReveal: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: ease.out },
  },
}

// ── Helper: create per-index delay variants (without stagger container) ───────
/** Use when you need custom per-item control rather than stagger container. */
export function delayedReveal(delay: number): Variants {
  return {
    hidden:  { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: ease.out, delay },
    },
  }
}

// ── Page-transition wrapper (for route changes) ───────────────────────────────
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ease.out } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.3, ease: ease.inOut } },
}
