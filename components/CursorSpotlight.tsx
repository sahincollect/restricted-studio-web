'use client';

/**
 * Intentionally a no-op: per-frame pointermove + getBoundingClientRect() + CSS mask-composite
 * caused layout reflow and repaint jank across Chrome, Safari, and Firefox.
 * Card hover states are handled purely via GPU-friendly CSS transitions.
 */
export default function CursorSpotlight() {
  return null;
}
