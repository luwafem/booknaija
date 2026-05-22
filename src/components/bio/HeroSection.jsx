import { InstagramIcon, TikTokIcon, PhoneIcon, WhatsAppIcon, MapPinIcon, ClockIcon } from '../Icons';

function formatWhatsAppNumber(num) {
  if (!num) return '';
  let digits = num.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '234' + digits.substring(1);
  }
  return digits;
}

export default function HeroSection({ biz }) {
  const accent = biz.accent || '#c8a97e';
  const textColor = '#78716c'; // stone-600 - readable on light bg
  const textColorDark = '#d6d3d1'; // stone-300 - readable on dark bg
  const initials = biz.name ? biz.name.split(' ').map((w) => w[0]).join('').substring(0, 2) : '??';
  const theme = biz.theme || 'light';
  const isDark = theme === 'dark';
  
  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  const heroImages = isGrouped 
    ? biz.gallery.flatMap(g => g.images).slice(0, 4) 
    : (biz.gallery?.slice(0, 4) || []);
  
  const hasImages = heroImages.length > 0;
  const mapQuery = biz.location ? encodeURIComponent(biz.name + ' ' + biz.location) : encodeURIComponent(biz.name || '');
  const waNumber = formatWhatsAppNumber(biz.whatsapp || biz.phone);

  return (
    <div className={`relative w-full overflow-hidden text-white ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'} min-h-screen`}
      style={{ minHeight: '100vh' }}
    >
      
      {/* ── STATIC BACKGROUND IMAGES (NO SCROLL) ── */}
      {hasImages && (
        <div className="absolute inset-0 h-full w-full z-0" aria-hidden="true">
          <img 
            src={heroImages[0]} 
            alt="" 
            className="h-full w-full object-cover" 
            loading="eager"
          />
          <div 
            className="absolute inset-0 z-10 pointer-events-none opacity-[0.15] mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* ── DESKTOP: Subtle gradient overlay ── */}
      <div className={`hidden lg:block absolute inset-0 z-0 ${isDark ? 'bg-gradient-to-b from-[#111] via-[#0a0a0a] to-[#0a0a0a]' : 'bg-gradient-to-b from-stone-100 via-stone-50 to-stone-50'}`} />

      <header className={`
        relative z-20 mx-auto flex flex-col items-center justify-center
        px-5 pt-20 sm:pt-24 pb-8 min-h-screen
        lg:px-8 lg:pt-12 lg:pb-10 lg:min-h-0 lg:w-full lg:max-w-none
      `}
      style={{ minHeight: 'auto' }}
      >
        <style>{`
          @media (min-width: 1024px) {
            [style*="min-height"] {
              min-height: unset !important;
            }
          }
        `}</style>
        
        {/* ── LOGO / AVATAR ── */}
        <div className="mb-5 sm:mb-7 lg:mb-8 animate-fade-in-up">
          <div className="relative">
            <div className={`
              relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 
              rounded-full overflow-hidden flex items-center justify-center 
              shadow-2xl ring-4 ring-white/10
              ${isDark ? 'bg-[#0a0a0a] border-2' : 'bg-white border-2'}
            `}
              style={{ borderColor: isDark ? accent + '40' : accent + '80' }}
            >
              {biz.logo || biz.avatar ? (
                <img 
                  src={biz.logo || biz.avatar} 
                  alt={`${biz.name} logo`}
                  className="w-full h-full object-cover"
                  itemProp="logo"
                />
              ) : (
                <span 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter" 
                  style={{ color: accent }}
                >
                  {initials}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── NAME & TAGLINE ── */}
        <div className="mb-3 sm:mb-5 lg:mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 
            className={`
              text-3xl sm:text-4xl lg:text-5xl 
              font-heading font-bold tracking-tight mb-2 
              leading-[1.1] capitalize drop-shadow-2xl
              ${isDark ? 'text-white' : 'text-stone-900'}
            `}
            itemProp="name"
          >
            {biz.name}
          </h1>
          
          <p 
            className={`
              text-xs sm:text-sm lg:text-base
              uppercase tracking-[0.25em] lg:tracking-[0.3em] 
              font-semibold
              ${isDark ? textColorDark : textColor}
            `}
            style={{ color: isDark ? textColorDark : textColor }}
          >
            {biz.tagline}
          </p>
        </div>

        {/* ── BIO ── */}
        {biz.bio && (
          <p 
            className={`
              text-sm sm:text-base lg:text-lg
              font-sans font-normal leading-relaxed text-center 
              mb-6 sm:mb-8 lg:mb-10
              max-w-xs sm:max-w-sm lg:max-w-md
              animate-fade-in-up
              ${isDark ? textColorDark : textColor}
            `}
            style={{ animationDelay: '0.15s', color: isDark ? textColorDark : textColor }}
            itemProp="description"
          >
            {biz.bio}
          </p>
        )}

        {/* ── LOCATION & HOURS BUTTONS ── */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-5 sm:mb-7 lg:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {biz.location && (
            <button
              type="button"
              onClick={function() { 
                var mapEl = document.getElementById('location-map');
                if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`
                px-5 sm:px-6 py-2.5 sm:py-3 lg:py-3.5 
                border-2 rounded-full flex items-center gap-2.5 
                shadow-lg transition-all duration-300 cursor-pointer hover:scale-105
                ${isDark 
                  ? 'bg-white/[0.05] backdrop-blur-xl border-white/15 hover:bg-white/[0.1] hover:border-white/25' 
                  : 'bg-white border-stone-300 hover:bg-stone-50 hover:border-stone-400 hover:shadow-xl'}
              `}
              style={{ borderColor: isDark ? accent + '40' : accent + '80' }}
              aria-label="View location on map"
            >
              <MapPinIcon className="w-4 h-4 sm:w-5 lg:w-5" style={{ color: accent }} />
              <span 
                className={`
                  text-xs sm:text-sm lg:text-base
                  font-bold uppercase tracking-widest
                  ${isDark ? textColorDark : textColor}
                `}
                style={{ color: isDark ? textColorDark : textColor }}
              >
                {biz.location}
              </span>
            </button>
          )}
          {biz.hours && (
            <div 
              className={`
                px-5 sm:px-6 py-2.5 sm:py-3 lg:py-3.5 
                border-2 rounded-full flex items-center gap-2.5 
                shadow-lg
                ${isDark 
                  ? 'bg-white/[0.05] backdrop-blur-xl border-white/15' 
                  : 'bg-white border-stone-300 hover:bg-stone-50 hover:border-stone-400 hover:shadow-xl transition-all duration-300'}
              `}
              style={{ borderColor: isDark ? accent + '40' : accent + '80' }}
            >
              <ClockIcon className="w-4 h-4 sm:w-5 lg:w-5" style={{ color: accent }} />
              <time 
                className={`
                  text-xs sm:text-sm lg:text-base
                  font-bold uppercase tracking-widest
                  ${isDark ? textColorDark : textColor}
                `} 
                itemProp="openingHours"
                style={{ color: isDark ? textColorDark : textColor }}
              >
                {biz.hours}
              </time>
            </div>
          )}
        </div>

        {/* ── MAP ── */}
        {biz.location && (
          <div 
            id="location-map"
            className={`
              w-full mb-6 sm:mb-8 lg:mb-10
              rounded-2xl overflow-hidden border-2
              animate-fade-in-up relative
              h-[130px] lg:h-[180px]
              ${isDark ? 'bg-white/[0.02]' : 'bg-white'}
            `}
            style={{ 
              animationDelay: '0.25s',
              borderColor: isDark ? accent + '40' : accent + '80'
            }}
          >
            <style>{`
              @media (min-width: 640px) {
                #location-map { height: 130px !important; }
              }
              @media (min-width: 1024px) {
                #location-map { height: 180px !important; }
              }
            `}</style>
            <iframe
              title={`Map showing ${biz.name} located at ${biz.location}`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={biz.lat && biz.lng 
                ? `https://maps.google.com/maps?q=${biz.lat},${biz.lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`
                : `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`
              }
              style={isDark ? { filter: 'invert(90%) hue-rotate(180deg) saturate(0.8) contrast(1.1) brightness(0.9)', border: '0' } : { border: '0' }}
              loading="lazy"
            />
            <div 
              className={`
                absolute bottom-3 right-3 
                flex items-center gap-1.5 rounded-lg px-3 py-2 
                border-2 backdrop-blur-md
                ${isDark ? 'bg-black/70 border-white/15' : 'bg-white border-stone-200 shadow-xl'}
              `}
              style={{ borderColor: isDark ? accent + '40' : accent + '80' }}
            >
              <svg className={`w-4 h-4 sm:w-5 lg:w-5 ${isDark ? textColorDark : textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <a 
                href={biz.lat && biz.lng
                  ? `https://www.google.com/maps/search/?api=1&query=${biz.lat},${biz.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
                }
                target="_blank"
                rel="noreferrer"
                className={`
                  text-xs sm:text-sm lg:text-base
                  font-semibold transition-colors
                  ${isDark ? 'text-stone-300 hover:text-white' : textColor}
                `}
                style={{ color: isDark ? textColorDark : textColor }}
              >
                Open in Maps
              </a>
            </div>
          </div>
        )}

        {/* ── WHATSAPP & PHONE ── */}
        <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-8 lg:mb-10 animate-fade-in-up justify-center" style={{ animationDelay: '0.3s' }}>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-3 py-3.5 sm:py-4 lg:py-5 rounded-full overflow-hidden transition-all duration-500 active:scale-[0.97] hover:scale-105 flex-1 sm:flex-none sm:min-w-[220px] lg:min-w-[280px]"
              style={{ backgroundColor: accent }}
              aria-label={`Contact ${biz.name} on WhatsApp`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <WhatsAppIcon className="w-5 h-5 sm:w-6 lg:w-7 text-black relative z-10" />
              <span className="text-black font-bold uppercase tracking-[0.2em] text-sm sm:text-base lg:text-lg relative z-10">
                whatsapp
              </span>
            </a>
          )}
          
          {biz.phone && (
            <a
              href={`tel:${biz.phone}`}
              className={`
                flex items-center justify-center gap-3 py-3.5 sm:py-4 lg:py-5 
                rounded-full border-2 font-bold transition-all duration-300 
                uppercase tracking-[0.2em] text-sm sm:text-base lg:text-lg
                hover:scale-105
                flex-1 sm:flex-none sm:min-w-[220px] lg:min-w-[280px]
                ${isDark 
                  ? 'bg-white/[0.03] backdrop-blur-md text-white hover:bg-white/[0.08]' 
                  : 'bg-white text-stone-900 hover:bg-stone-50 shadow-lg'}
              `}
              style={{ 
                borderColor: isDark ? accent + '40' : accent + '80'
              }}
              itemProp="telephone"
              aria-label={`Call ${biz.name} at ${biz.phone}`}
            >
              <PhoneIcon className={`w-5 h-5 sm:w-6 lg:w-7 ${isDark ? 'opacity-70' : 'opacity-90'}`} style={{ color: accent }} /> 
              <span style={{ color: isDark ? '#e7e5e4' : textColor }}>Call</span>
            </a>
          )}
        </div>

        {/* ── SOCIALS ── */}
        <nav className="flex justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }} aria-label="Social media links">
          {biz.socials?.instagram && (
            <a 
              href={biz.socials.instagram} 
              target="_blank" 
              rel="noreferrer" 
              className={`transition-all duration-300 hover:scale-110 ${isDark ? 'text-stone-500 hover:text-white' : textColor}`} 
              aria-label={`Follow ${biz.name} on Instagram`}
            >
              <InstagramIcon className="w-7 h-7 sm:w-8 lg:w-10" style={{ color: accent }} />
            </a>
          )}
          {biz.socials?.tiktok && (
            <a 
              href={biz.socials.tiktok} 
              target="_blank" 
              rel="noreferrer" 
              className={`transition-all duration-300 hover:scale-110 ${isDark ? 'text-stone-500 hover:text-white' : textColor}`} 
              aria-label={`Follow ${biz.name} on TikTok`}
            >
              <TikTokIcon className="w-7 h-7 sm:w-8 lg:w-10" style={{ color: accent }} />
            </a>
          )}
        </nav>
      </header>
      
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
