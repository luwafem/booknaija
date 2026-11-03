// src/components/ads/GoogleAd.jsx
import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT } from './adSlots';

// Module-scoped flags so the AdSense script is injected exactly once
// per browser session, regardless of how many <GoogleAd> instances
// mount on a single page.
let adsenseScriptLoaded = false;
let adsenseScriptLoading = false;

/**
 * Renders a single AdSense ad slot.
 *
 * Props:
 *   slot       — the AdSense slot ID (required). See adSlots.js.
 *   className  — extra classes for the wrapper div.
 *   format     — 'auto' (default), 'fluid', 'horizontal', etc.
 *   layoutKey  — optional AdSense layout key for in-feed units.
 */
export default function GoogleAd({
  slot,
  className = '',
  format = 'auto',
  layoutKey,
}) {
  const adRef = useRef(null);
  const hasPushed = useRef(false);

  useEffect(() => {
    if (hasPushed.current) return;
    hasPushed.current = true;

    const pushAd = () => {
      if (!adRef.current) return;
      try {
        if (
          window.adsbygoogle &&
          typeof window.adsbygoogle.push === 'function'
        ) {
          window.adsbygoogle.push({});
        }
      } catch (e) {
        // AdSense throws "already have ads in this element" on repeat
        // pushes for the same <ins>. This is expected — swallow it.
      }
    };

    // Fast path: script already on the page from a previous mount.
    if (adsenseScriptLoaded) {
      const timer = setTimeout(pushAd, 150);
      return () => clearTimeout(timer);
    }

    // Slow path: another instance is mid-load. Poll until it's ready.
    if (adsenseScriptLoading) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (adsenseScriptLoaded || attempts > 20) {
          clearInterval(interval);
          if (adsenseScriptLoaded) pushAd();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Cold path: inject the script.
    adsenseScriptLoading = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

    script.onload = () => {
      adsenseScriptLoaded = true;
      adsenseScriptLoading = false;
      const timer = setTimeout(pushAd, 100);
      script._timerCleanup = () => clearTimeout(timer);
    };

    script.onerror = () => {
      adsenseScriptLoading = false;
    };

    document.head.appendChild(script);

    return () => {
      if (script._timerCleanup) script._timerCleanup();
    };
  }, [slot, layoutKey]);

  return (
    <div
      className={`w-full flex justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
}