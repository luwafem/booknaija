// src/components/ads/StickyAd.jsx
import { useState, useEffect } from 'react';
import GoogleAd from './GoogleAd';

/**
 * Fixed-bottom ad banner for mobile only.
 *
 * Behaviour:
 *   • Hidden until the user has scrolled 20% down AND been on page ≥5s.
 *   • Auto-hides when they reach 85% (they're at the footer — the ad
 *     would obscure the footer links).
 *   • Dismissible — once closed, stays closed for this page view.
 *   • Never renders at ≥lg (1024px) breakpoints.
 *
 * Props:
 *   slot    — AdSense slot ID (required). Use AD_SLOT_STICKY_MOBILE.
 *   enabled — if false, renders nothing (returns null).
 *   accent  — business accent (currently unused in styling but kept
 *             for future theming).
 */
export default function StickyAd({ slot, enabled = true, accent = '#c8a97e' }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!enabled || dismissed) return;

    const mountedAt = Date.now();

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = scrolled / docHeight;
      const timeOk = Date.now() - mountedAt > 5000;
      const positionOk = scrollPercent > 0.2 && scrollPercent < 0.85;

      setVisible(timeOk && positionOk);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, dismissed]);

  if (!enabled || !visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-white/10 p-2 lg:hidden"
      style={{ animation: 'slideUp 0.35s ease-out' }}
      role="complementary"
      aria-label="Sponsored content"
    >
      <div className="relative max-w-3xl mx-auto px-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute -top-3 right-0 w-7 h-7 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
          aria-label="Close sponsored content"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <GoogleAd slot={slot} format="horizontal" />
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}