// src/components/bio/property/havenly/HavenlyLayout.jsx
import HavenlyHeader from './HavenlyHeader';
import HavenlyHero from './HavenlyHero';
import HavenlyWhyChooseUs from './HavenlyWhyChooseUs';
import HavenlyProperties from './HavenlyProperties';
import HavenlyShowcase from './HavenlyShowcase';
import HavenlyTestimonials from './HavenlyTestimonials';
import HavenlyFooter from './HavenlyFooter';

// Fixed design tokens for the Havenly template
export const HAVENLY_BG = '#f8f7f4';
export const HAVENLY_SURFACE = '#ffffff';
export const HAVENLY_DARK = '#1a1a1a';
export const HAVENLY_BORDER = '#e5e3dd';
export const HAVENLY_MUTED = '#6b6b6b';
export const HAVENLY_FAINT = '#a3a3a3';

export default function HavenlyLayout({ biz, accent, isDark, onSelectProperty }) {
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
          <HavenlyWhyChooseUs biz={biz} accent={accent} />
          <HavenlyProperties
            biz={biz}
            accent={accent}
            onSelectProperty={onSelectProperty}
          />
          <HavenlyShowcase biz={biz} accent={accent} />
          <HavenlyTestimonials biz={biz} accent={accent} />
        </main>
        <HavenlyFooter biz={biz} accent={accent} />
      </div>
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