// src/components/ads/adSlots.js
//
// Central source of truth for all AdSense slot IDs.
// When you create a new ad unit in AdSense (Ads → By ad unit → Display),
// add its numeric ID here and reference it by name everywhere else.
//
// Slots currently in use:
//   TOP          — under the hero on every template
//   INFEED       — between content sections on Default layout
//   FOOTER       — above the footer on every template
//   STICKY_MOBILE — fixed bottom banner on phones only
//
// ⚠️ REPLACE THE PLACEHOLDERS below with the real slot IDs from your
// AdSense dashboard before deploying. The current values match your
// existing GoogleAd calls in BioPage.jsx / DefaultLayout.jsx.

export const AD_SLOT_TOP = '1234567890';
export const AD_SLOT_INFEED = '1111111111';
export const AD_SLOT_FOOTER = '0987654321';

// 👇 NEW — create this ad unit in AdSense:
//    Ads → By ad unit → Display → "Five9 Sticky Mobile" → Horizontal
//    Then replace the placeholder below with the real slot ID.
export const AD_SLOT_STICKY_MOBILE = '5555555555';

// AdSense publisher ID (same for every slot).
export const ADSENSE_CLIENT = 'ca-pub-1898000452698308';