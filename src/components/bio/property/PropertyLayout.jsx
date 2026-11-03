// src/components/bio/property/PropertyLayout.jsx
import PropertyHeader from './PropertyHeader';
import PropertyHero from './PropertyHero';
import PropertyEstates from './PropertyEstates';
import PropertyListings from './PropertyListings';
import PropertyAbout from './PropertyAbout';
import PropertyFooter from './PropertyFooter';
// 👇 Shared ad primitives. Property businesses previously had NO ad slots
// at all — this is what closes that gap.
import AdSlot from '../../ads/AdSlot';
import StickyAd from '../../ads/StickyAd';
import {
  AD_SLOT_TOP,
  AD_SLOT_FOOTER,
  AD_SLOT_STICKY_MOBILE,
} from '../../ads/adSlots';

export default function PropertyLayout({ biz, accent, isDark, onSelectProperty }) {
  const estatesEnabled = biz.estatesEnabled === true;
  const propertiesEnabled = biz.propertiesEnabled === true;

  const rawEstates = biz.estates || [];
  const estates = rawEstates.slice().sort(function (a, b) {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  const showEstates = estatesEnabled && estates.length > 0;
  const showProperties = propertiesEnabled && (biz.properties || []).length > 0;

  // Ads kill-switch: same flag that drives the Default layout. When
  // an admin disables ads for a business (AdSense policy violation,
  // for example), this whole layout stops rendering every ad slot.
  const adsEnabled = biz.adsEnabled !== false;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
      <style>{`body, body * { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }`}</style>
      <div className="min-h-screen scroll-smooth">
        <PropertyHeader biz={biz} accent={accent} isDark={isDark} />
        <PropertyHero biz={biz} accent={accent} isDark={isDark} />

        {/* ── TOP AD ──
            Sits between the hero and the property listings. Uses the
            shared <AdSlot> so styling matches the Default layout. */}
        <div className="px-6 sm:px-10 lg:px-14">
          <AdSlot
            slot={AD_SLOT_TOP}
            accent={accent}
            enabled={adsEnabled}
            format="horizontal"
            className="py-8 lg:py-12"
          />
        </div>

        {showProperties && (
          <PropertyListings
            biz={biz}
            accent={accent}
            isDark={isDark}
            onSelectProperty={onSelectProperty}
          />
        )}

        {showEstates && (
          <PropertyEstates
            biz={{ ...biz, estates }}
            accent={accent}
            isDark={isDark}
            onSelectProperty={onSelectProperty}
          />
        )}

        <PropertyAbout biz={biz} accent={accent} isDark={isDark} />

        {/* ── FOOTER AD ──
            Sits between the About section and the footer. */}
        <div className="px-6 sm:px-10 lg:px-14">
          <AdSlot
            slot={AD_SLOT_FOOTER}
            accent={accent}
            enabled={adsEnabled}
            format="auto"
            className="py-8 lg:py-12"
          />
        </div>

        <PropertyFooter biz={biz} accent={accent} isDark={isDark} />
      </div>

      {/* ── STICKY MOBILE AD ──
          Fixed bottom banner on phones only. Self-gates on scroll
          position and dwell time, and never renders at lg+. Lives
          outside the main div so it isn't clipped. */}
      <StickyAd
        slot={AD_SLOT_STICKY_MOBILE}
        enabled={adsEnabled}
        accent={accent}
      />
    </>
  );
}