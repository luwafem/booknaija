// src/components/ads/AdSlot.jsx
import GoogleAd from './GoogleAd';

/**
 * Styled ad container for use inside business page layouts.
 *
 * Props:
 *   slot       — AdSense slot ID (required).
 *   accent     — business accent hex (e.g. '#c8a97e').
 *   className  — extra wrapper classes.
 *   label      — sponsored label text (default 'Sponsored').
 *   format     — passed through to GoogleAd (default 'auto').
 *   enabled    — if false, renders nothing (returns null).
 *   maxWidth   — container max width (default '680px').
 */
export default function AdSlot({
  slot,
  accent = '#c8a97e',
  className = '',
  label = 'Sponsored',
  format = 'auto',
  enabled = true,
  maxWidth = '680px',
}) {
  if (!enabled) return null;

  return (
    <div
      className={`w-full ${className}`}
      aria-label="Sponsored content"
    >
      <div
        className="rounded-2xl p-5 sm:p-6 lg:p-8 flex flex-col items-center mx-auto"
        style={{
          backgroundColor: accent + '08',
          borderColor: accent + '15',
          borderWidth: '1px',
          maxWidth,
        }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold text-center block"
          style={{ color: accent }}
        >
          {label}
        </span>
        <GoogleAd slot={slot} className="w-full" format={format} />
      </div>
    </div>
  );
}