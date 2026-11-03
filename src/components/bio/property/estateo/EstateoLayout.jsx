// src/components/bio/property/estateo/EstateoLayout.jsx
import EstateoHeader from './EstateoHeader';
import EstateoHero from './EstateoHero';
import EstateoAbout from './EstateoAbout';
import EstateoWhyChooseUs from './EstateoWhyChooseUs';
import EstateoProperties from './EstateoProperties';
import EstateoAgents from './EstateoAgents';
import EstateoTestimonials from './EstateoTestimonials';
import EstateoCTA from './EstateoCTA';
import EstateoFooter from './EstateoFooter';
// 👇 Shared ad primitives. Path is three levels up from
// src/components/bio/property/estateo/ to src/components/ads/.
// Before this change the Estateo template had no ad slots at all.
import AdSlot from '../../../ads/AdSlot';
import StickyAd from '../../../ads/StickyAd';
import {
  AD_SLOT_TOP,
  AD_SLOT_FOOTER,
  AD_SLOT_STICKY_MOBILE,
} from '../../../ads/adSlots';

// Fixed brand green used across the template
export const EGREEN = '#0f4c42';
export const EGREEN_DARK = '#0a3830';

export default function EstateoLayout({ biz, accent, isDark, onSelectProperty }) {
  // Ads kill-switch — same semantics as PropertyLayout, HavenlyLayout,
  // and DefaultLayout. When an admin disables ads for a business, every
  // slot on this template disappears.
  const adsEnabled = biz.adsEnabled !== false;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, body * { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900 antialiased">
        <EstateoHeader biz={biz} accent={accent} />
        <main>
          <EstateoHero biz={biz} accent={accent} />

          {/* ── TOP AD ──
              Sits between the hero and the About section. Wrapper
              matches Estateo's max-w-7xl / px-5 sm:px-8 lg:px-12
              rhythm so the ad aligns with sibling sections. */}
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <AdSlot
              slot={AD_SLOT_TOP}
              accent={accent}
              enabled={adsEnabled}
              format="horizontal"
              className="py-8 lg:py-12"
            />
          </div>

          <EstateoAbout biz={biz} accent={accent} />
          <EstateoWhyChooseUs biz={biz} accent={accent} />
          <EstateoProperties
            biz={biz}
            accent={accent}
            onSelectProperty={onSelectProperty}
          />
          <EstateoAgents biz={biz} accent={accent} />
          <EstateoTestimonials biz={biz} accent={accent} />
          <EstateoCTA biz={biz} accent={accent} />

          {/* ── FOOTER AD ──
              Sits between the CTA and the footer. */}
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
        <EstateoFooter biz={biz} accent={accent} />
      </div>

      {/* ── STICKY MOBILE AD ──
          Fixed bottom banner on phones only. Self-gates on scroll
          position and dwell time, and never renders at lg+. Lives
          outside the min-h-screen wrapper so it isn't clipped. */}
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