// src/components/bio/property/havenly/HavenlyLayout.jsx
import HavenlyHeader from './HavenlyHeader';
import HavenlyHero from './HavenlyHero';
import HavenlyWhyChooseUs from './HavenlyWhyChooseUs';
import HavenlyProperties from './HavenlyProperties';
import HavenlyShowcase from './HavenlyShowcase';
import HavenlyTestimonials from './HavenlyTestimonials';
import HavenlyFooter from './HavenlyFooter';
// 👇 Shared ad primitives. Same import shape as PropertyLayout — this
// template previously had no ad slots at all, so Havenly businesses
// showed no ads regardless of the ads_enabled flag.
import AdSlot from '../../../ads/AdSlot';
import StickyAd from '../../../ads/StickyAd';
import {
  AD_SLOT_TOP,
  AD_SLOT_FOOTER,
  AD_SLOT_STICKY_MOBILE,
} from '../../../ads/adSlots';

// Fixed design tokens for the Havenly template
export const HAVENLY_BG = '#f8f7f4';
export const HAVENLY_SURFACE = '#ffffff';
export const HAVENLY_DARK = '#1a1a1a';
export const HAVENLY_BORDER = '#e5e3dd';
export const HAVENLY_MUTED = '#6b6b6b';
export const HAVENLY_FAINT = '#a3a3a3';

export default function HavenlyLayout({ biz, accent, isDark, onSelectProperty }) {
  // Ads kill-switch — same semantics as PropertyLayout and DefaultLayout.
  const adsEnabled = biz.adsEnabled !== false;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, body * { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
        html { scroll-behavior: smooth; }
        .havenly-no-scrollbar::-webkit-scrollbar { display: none; }
        .havenly-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen antialiased" style={{ backgroundColor: HAVENLY_BG }}>
        <HavenlyHeader biz={biz} accent={accent} />
        <main>
          <HavenlyHero biz={biz} accent={accent} />

          {/* ── TOP AD ──
              Sits between the hero and the WhyChooseUs section.
              Container padding matches the max-w-7xl pattern used by
              sibling Havenly sections, so the ad aligns with them. */}
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <AdSlot
              slot={AD_SLOT_TOP}
              accent={accent}
              enabled={adsEnabled}
              format="horizontal"
              className="py-8 lg:py-12"
            />
          </div>

          <HavenlyWhyChooseUs biz={biz} accent={accent} />
          <HavenlyProperties
            biz={biz}
            accent={accent}
            onSelectProperty={onSelectProperty}
          />
          <HavenlyShowcase biz={biz} accent={accent} />
          <HavenlyTestimonials biz={biz} accent={accent} />

          {/* ── FOOTER AD ──
              Sits between the last content section and the footer. */}
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <AdSlot
              slot={AD_SLOT_FOOTER}
              accent={accent}
              enabled={adsEnabled}
              format="auto"
              className="py-8 lg:py-12"
            />
          </div>
        </main>
        <HavenlyFooter biz={biz} accent={accent} />
      </div>

      {/* ── STICKY MOBILE AD ──
          Fixed bottom banner on phones only. Self-gates on scroll
          position and dwell time, and never renders at lg+. Lives
          outside the main wrapper so it isn't clipped by any parent
          overflow rules. */}
      <StickyAd
        slot={AD_SLOT_STICKY_MOBILE}
        enabled={adsEnabled}
        accent={accent}
      />
    </>
  );
}

// Shared utility used by children
export function buildWhatsAppLink(num, message) {
  if (!num) return null;
  let digits = String(num).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '234' + digits.substring(1);
  else if (!digits.startsWith('234') && digits.length === 10) digits = '234' + digits;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}