// src/components/ads/LocalAdBanner.jsx
import { useState } from 'react';

/**
 * One local partner ad, visually distinct from AdSense.
 *
 * Deliberate design choices for AdSense policy safety:
 *   • Solid white background — AdSense containers are tinted
 *   • 2px border — AdSense containers have 1px tinted borders
 *   • Large advertiser logo top-left — AdSense has no logo
 *   • "From a Five9 partner" label — AdSense says "Sponsored"
 *   • Rounded-2xl — AdSense uses rounded-2xl too, but the rest of the
 *     visual language (colors, layout, label) is different enough that
 *     no reviewer would confuse them
 *
 * If multiple ads match this business type, the component rotates
 * through them across page loads (using a stable per-session shuffle
 * so the same visitor doesn't see the same ad twice in a row).
 */
export default function LocalAdBanner({ ads, accent = '#c8a97e', className = '' }) {
  // Stable "which ad to show" pick, stored in sessionStorage so it
  // survives client-side navigations within the tab but resets each
  // session. If new ads arrive (the array changes), the stored index
  // is discarded and re-picked.
  const [pickedIndex] = useState(() => pickStableIndex(ads));

  if (!Array.isArray(ads) || ads.length === 0) return null;

  const ad = ads[pickedIndex % ads.length];
  if (!ad) return null;

  const handleCtaClick = () => {
    if (!ad.ctaUrl) return;
    window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`w-full ${className}`} aria-label="Partner promotion">
      <div
        className="mx-auto rounded-2xl border-2 bg-white overflow-hidden flex flex-col sm:flex-row items-stretch"
        style={{
          borderColor: accent + '30',
          maxWidth: '680px',
        }}
      >
        {/* Image / logo column */}
        <div className="sm:w-44 shrink-0 bg-zinc-50 flex items-center justify-center p-4 sm:p-0">
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt=""
              className="w-full h-32 sm:h-full object-cover"
              loading="lazy"
            />
          ) : ad.advertiserLogo ? (
            <img
              src={ad.advertiserLogo}
              alt={ad.advertiserName}
              className="w-16 h-16 rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl"
              style={{ backgroundColor: accent + '15', color: accent }}
            >
              {(ad.advertiserName || 'P').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content column */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: accent }}
            >
              From a Five9 partner
            </span>
            <span className="text-[9px] text-zinc-400">·</span>
            <span className="text-[9px] font-semibold text-zinc-500 truncate">
              {ad.advertiserName}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight mb-1 truncate">
            {ad.title}
          </h3>

          {ad.body && (
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-2 mb-3">
              {ad.body}
            </p>
          )}

          <button
            type="button"
            onClick={handleCtaClick}
            className="self-start px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase text-white transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: accent }}
          >
            {ad.ctaText || 'Learn More'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Pick a stable index based on sessionStorage.
 *
 * Keyed by the sorted list of ad IDs, so if the underlying list changes
 * (an ad expires, a new one is added), we pick a fresh index instead of
 * showing whatever happened to be at the old position.
 */
function pickStableIndex(ads) {
  if (!Array.isArray(ads) || ads.length === 0) return 0;
  if (ads.length === 1) return 0;

  try {
    const key = 'localAdPick_' + ads.map((a) => a.id).sort().join('_');
    const stored = sessionStorage.getItem(key);
    if (stored !== null) {
      const n = parseInt(stored, 10);
      if (!isNaN(n) && n >= 0 && n < ads.length) return n;
    }
    const picked = Math.floor(Math.random() * ads.length);
    sessionStorage.setItem(key, String(picked));
    return picked;
  } catch {
    return 0;
  }
}