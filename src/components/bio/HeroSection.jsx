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
  const theme = biz.theme || 'light';
  const isDark = theme === 'dark';
  
  const initials = biz.name ? biz.name.split(' ').map((w) => w[0]).join('').substring(0, 2) : '??';
  
  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  const heroImages = isGrouped 
    ? biz.gallery.flatMap(g => g.images).slice(0, 4) 
    : (biz.gallery?.slice(0, 4) || []);
  
  const hasImages = heroImages.length > 0;
  const mapQuery = biz.location ? encodeURIComponent(biz.name + ' ' + biz.location) : encodeURIComponent(biz.name || '');
  const waNumber = formatWhatsAppNumber(biz.whatsapp || biz.phone);
  const useOverlayStyle = hasImages || isDark;

  return (
    <div className={`relative w-full overflow-hidden min-h-0 xl:min-h-screen transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      {/* ─── BACKGROUND IMAGE ─── */}
      {hasImages && (
        <div className="absolute inset-0 h-full w-full z-0" aria-hidden="true">
          <img 
            src={heroImages[0]} 
            alt="" 
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      )}

      {/* ─── OVERLAY GRADIENT ─── */}
      {hasImages ? (
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" aria-hidden="true" />
      ) : (
        <div className={`absolute inset-0 z-0 ${isDark ? 'bg-black' : 'bg-white'}`} />
      )}

      <header className="relative z-20 mx-auto flex flex-col items-center justify-start px-6 sm:px-10 lg:px-8 xl:px-10 pt-[20vh] pb-12 lg:pb-10">
        
        {/* ─── LOGO / AVATAR ─── */}
        <div className="mb-6 xl:mb-6 animate-fade-in-up">
          <div 
            className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 xl:w-28 xl:h-28 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-500 hover:scale-105"
            style={{ boxShadow: `0 0 0 1px ${useOverlayStyle ? accent + '40' : accent + '60'}` }}
          >
            {biz.logo || biz.avatar ? (
              <img 
                src={biz.logo || biz.avatar} 
                alt={`${biz.name} logo`}
                className="w-full h-full object-cover"
                itemProp="logo"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: accent + '15' }}
              >
                <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-4xl font-semibold tracking-tight" style={{ color: accent }}>
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ─── NAME & TAGLINE ─── */}
        <div className="mb-4 xl:mb-4 animate-fade-in-up text-center" style={{ animationDelay: '0.1s' }}>
          <h1 
            className={`text-3xl sm:text-4xl lg:text-5xl xl:text-4xl 2xl:text-5xl font-semibold tracking-tight mb-2 leading-[1.1] capitalize drop-shadow-2xl ${useOverlayStyle ? 'text-white' : 'text-black'}`}
            itemProp="name"
          >
            {biz.name}
          </h1>
          
          {biz.tagline && (
            <p className="text-xs sm:text-sm lg:text-base xl:text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: useOverlayStyle ? 'rgba(255,255,255,0.8)' : accent }}>
              {biz.tagline}
            </p>
          )}
        </div>

        {/* ─── PILLS: LOCATION & HOURS ─── */}
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-8 xl:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {biz.location && (
            <button
              type="button"
              onClick={() => { 
                const el = document.getElementById('location-map');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="group px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: useOverlayStyle ? 'rgba(255,255,255,0.1)' : accent + '10', border: `1px solid ${useOverlayStyle ? 'rgba(255,255,255,0.15)' : accent + '25'}` }}
              aria-label="View location on map"
            >
              <MapPinIcon className="w-3.5 h-3.5 sm:w-4" style={{ color: accent }} />
              <span className={`text-[11px] sm:text-xs font-semibold tracking-[0.1em] uppercase ${useOverlayStyle ? 'text-white/90' : ''}`} style={!useOverlayStyle ? { color: accent } : {}}>
                {biz.location}
              </span>
            </button>
          )}
          {biz.hours && (
            <div 
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-2"
              style={{ backgroundColor: useOverlayStyle ? 'rgba(255,255,255,0.1)' : accent + '10', border: `1px solid ${useOverlayStyle ? 'rgba(255,255,255,0.15)' : accent + '25'}` }}
            >
              <ClockIcon className="w-3.5 h-3.5 sm:w-4" style={{ color: accent }} />
              <time className={`text-[11px] sm:text-xs font-semibold tracking-[0.1em] uppercase ${useOverlayStyle ? 'text-white/90' : ''}`} style={!useOverlayStyle ? { color: accent } : {}} itemProp="openingHours">
                {biz.hours}
              </time>
            </div>
          )}
        </div>

        {/* ─── MAP ─── */}
        {biz.location && (
          <div 
            id="location-map"
            className="w-full mb-8 xl:mb-8 rounded-2xl overflow-hidden animate-fade-in-up relative h-[145px] sm:h-[157px] lg:h-[200px] xl:h-[160px]"
            style={{ 
              animationDelay: '0.25s',
              border: `1px solid ${useOverlayStyle ? 'rgba(255,255,255,0.1)' : accent + '20'}`
            }}
          >
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
              style={useOverlayStyle ? { filter: 'invert(90%) hue-rotate(180deg) saturate(0.8) contrast(1.1) brightness(0.9)', border: '0' } : { border: '0' }}
              loading="lazy"
            />
            <div 
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-3 py-2 backdrop-blur-md transition-all duration-300"
              style={{ 
                backgroundColor: useOverlayStyle ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)', 
                border: `1px solid ${useOverlayStyle ? 'rgba(255,255,255,0.15)' : accent + '25'}` 
              }}
            >
              <svg className="w-3.5 h-3.5" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                className="text-[11px] sm:text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: accent }}
              >
                Open in Maps
              </a>
            </div>
          </div>
        )}

        {/* ─── CTA BUTTONS ─── */}
        <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-3 mb-10 xl:mb-10 animate-fade-in-up justify-center" style={{ animationDelay: '0.3s' }}>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 rounded-full overflow-hidden transition-all duration-300 active:scale-[0.98] hover:brightness-110 flex-1 sm:flex-none sm:min-w-[220px] lg:min-w-[240px] shadow-sm"
              style={{ backgroundColor: accent }}
              aria-label={`Contact ${biz.name} on WhatsApp`}
            >
              <WhatsAppIcon className="w-4 h-4 sm:w-5 text-black relative z-10" />
              <span className="text-black text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase relative z-10">
                WhatsApp
              </span>
            </a>
          )}
          
          {biz.phone && (
            <a
              href={`tel:${biz.phone}`}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 rounded-full font-bold transition-all duration-300 uppercase tracking-[0.15em] text-[11px] sm:text-xs hover:brightness-110 flex-1 sm:flex-none sm:min-w-[220px] lg:min-w-[240px]"
              style={{ 
                border: `1px solid ${useOverlayStyle ? 'rgba(255,255,255,0.2)' : accent + '40'}`,
                color: useOverlayStyle ? '#fff' : accent,
                backgroundColor: useOverlayStyle ? 'rgba(255,255,255,0.05)' : accent + '08'
              }}
              itemProp="telephone"
              aria-label={`Call ${biz.name} at ${biz.phone}`}
            >
              <PhoneIcon className="w-4 h-4 sm:w-5" /> 
              <span>Call Now</span>
            </a>
          )}
        </div>

        {/* ─── SOCIALS ─── */}
        {biz.socials && (biz.socials.instagram || biz.socials.tiktok) && (
          <nav className="flex justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }} aria-label="Social media links">
            {biz.socials.instagram && (
              <a 
                href={biz.socials.instagram} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: useOverlayStyle ? 'rgba(255,255,255,0.1)' : accent + '10', border: `1px solid ${useOverlayStyle ? 'rgba(255,255,255,0.15)' : accent + '20'}` }}
                aria-label={`Follow ${biz.name} on Instagram`}
              >
                <InstagramIcon className="w-4 h-4" style={{ color: accent }} />
              </a>
            )}
            {biz.socials.tiktok && (
              <a 
                href={biz.socials.tiktok} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: useOverlayStyle ? 'rgba(255,255,255,0.1)' : accent + '10', border: `1px solid ${useOverlayStyle ? 'rgba(255,255,255,0.15)' : accent + '20'}` }}
                aria-label={`Follow ${biz.name} on TikTok`}
              >
                <TikTokIcon className="w-4 h-4" style={{ color: accent }} />
              </a>
            )}
          </nav>
        )}
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