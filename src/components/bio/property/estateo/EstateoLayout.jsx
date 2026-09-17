import EstateoHeader from './EstateoHeader';
import EstateoHero from './EstateoHero';
import EstateoAbout from './EstateoAbout';
import EstateoWhyChooseUs from './EstateoWhyChooseUs';
import EstateoProperties from './EstateoProperties';
import EstateoAgents from './EstateoAgents';
import EstateoTestimonials from './EstateoTestimonials';
import EstateoCTA from './EstateoCTA';
import EstateoFooter from './EstateoFooter';

// Fixed brand green used across the template
export const EGREEN = '#0f4c42';
export const EGREEN_DARK = '#0a3830';

export default function EstateoLayout({ biz, accent, isDark, onSelectProperty }) {
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
        </main>
        <EstateoFooter biz={biz} accent={accent} />
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