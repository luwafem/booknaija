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
    <div 
      className={`
        relative w-full overflow-hidden text-white
        min-h-0 xl:min-h-screen
        ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'}
      `}
    >
      
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
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3Cfilter id='noise'%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            aria-hidden="true"
          />
        </div>
      )}

      {hasImages ? (
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/50 to-black/80" aria-hidden="true" />
      ) : (
        <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'}`} />
      )}

      <header className={`
        relative z-20 mx-auto flex flex-col items-center justify-start
        px-5 pb-[48px]
        pt-[58px] sm:pt-[68px] md:pt-[70px]
        lg:px-10 lg:pt-[77px] lg:pb-[77px]
        xl:px-8 xl:pt-12 xl:pb-12
        2xl:px-10
      `}>
        
        <div className="mb-[24px] sm:mb-6 lg:mb-8 xl:mb-6 animate-fade-in-up">
          <div 
            className={`
              relative w-24 h-24 sm:w-28 sm:h-28 md:w-28 md:h-28
              lg:w-32 lg:h-32
              xl:w-28 xl:h-28
              rounded-full overflow-hidden flex items-center justify-center 
              shadow-2xl ring-4 ring-white/10
              ${useOverlayStyle ? 'bg-[#0a0a0a]' : 'bg-white'}
            `}
            style={{ border: `2px solid ${useOverlayStyle ? accent + '40' : accent + '80'}` }}
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
                className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-4xl font-bold tracking-tighter" 
                style={{ color: accent }}
              >
                {initials}
              </span>
            )}
          </div>
        </div>

        <div className="mb-[14px] sm:mb-4 lg:mb-6 xl:mb-4 animate-fade-in-up text-center" style={{ animationDelay: '0.1s' }}>
          <h1 
            className={`
              text-3xl sm:text-4xl md:text-4xl
              lg:text-5xl
              xl:text-4xl 2xl:text-5xl
              font-heading font-bold tracking-tight mb-[10px]
              leading-[1.1] capitalize drop-shadow-2xl
              ${useOverlayStyle ? 'text-white' : 'text-stone-900'}
            `}
            itemProp="name"
          >
            {biz.name}
          </h1>
          
          <p 
            className={`
              text-xs sm:text-sm
              lg:text-base xl:text-sm
              uppercase tracking-[0.2em]
              font-semibold
              ${useOverlayStyle ? 'text-white/80' : 'text-stone-600'}
            `}
          >
            {biz.tagline}
          </p>
        </div>

        {biz.bio && (
          <p 
            className={`
              text-sm sm:text-sm
              lg:text-lg xl:text-base
              font-sans font-normal leading-relaxed text-center 
              mb-[29px] sm:mb-[39px]
              lg:mb-10 xl:mb-8
              max-w-xs sm:max-w-sm
              lg:max-w-lg xl:max-w-md
              mx-auto
              animate-fade-in-up
              ${useOverlayStyle ? 'text-white/90' : 'text-stone-600'}
            `}
            style={{ animationDelay: '0.15s' }}
            itemProp="description"
          >
            {biz.bio}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-[14px] sm:gap-4 mb-[24px] sm:mb-[39px] lg:mb-10 xl:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {biz.location && (
            <button
              type="button"
              onClick={() => { 
                const el = document.getElementById('location-map');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`
                px-5 sm:px-6 py-[11px] sm:py-3
                border-2 rounded-full flex items-center gap-2.5
                shadow-lg transition-all duration-300 cursor-pointer hover:scale-105
                ${useOverlayStyle 
                  ? 'bg-white/[0.05] backdrop-blur-xl border-white/15 hover:bg-white/[0.1] hover:border-white/25' 
                  : 'bg-white border-stone-300 hover:bg-stone-50 hover:border-stone-400 hover:shadow-xl'}
              `}
              style={{ borderColor: useOverlayStyle ? accent + '40' : accent + '80' }}
              aria-label="View location on map"
            >
              <MapPinIcon className="w-4 h-4 sm:w-5" style={{ color: accent }} />
              <span 
                className={`
                  text-xs sm:text-sm
                  font-bold uppercase tracking-widest
                  ${useOverlayStyle ? 'text-white' : 'text-stone-600'}
                `}
              >
                {biz.location}
              </span>
            </button>
          )}
          {biz.hours && (
            <div 
              className={`
                px-5 sm:px-6 py-[11px] sm:py-3
                border-2 rounded-full flex items-center gap-2.5
                shadow-lg
                ${useOverlayStyle 
                  ? 'bg-white/[0.05] backdrop-blur-xl border-white/15' 
                  : 'bg-white border-stone-300 hover:bg-stone-50 hover:border-stone-400 hover:shadow-xl transition-all duration-300'}
              `}
              style={{ borderColor: useOverlayStyle ? accent + '40' : accent + '80' }}
            >
              <ClockIcon className="w-4 h-4 sm:w-5" style={{ color: accent }} />
              <time 
                className={`
                  text-xs sm:text-sm
                  font-bold uppercase tracking-widest
                  ${useOverlayStyle ? 'text-white' : 'text-stone-600'}
                `} 
                itemProp="openingHours"
              >
                {biz.hours}
              </time>
            </div>
          )}
        </div>

        {biz.location && (
          <div 
            id="location-map"
            className={`
              w-full mb-[29px] sm:mb-[39px]
              lg:mb-10 xl:mb-8
              rounded-2xl overflow-hidden border-2
              animate-fade-in-up relative
              h-[145px] sm:h-[157px]
              lg:h-[200px] xl:h-[160px]
              ${useOverlayStyle ? 'bg-white/[0.05] backdrop-blur-md' : 'bg-white'}
            `}
            style={{ 
              animationDelay: '0.25s',
              borderColor: useOverlayStyle ? accent + '40' : accent + '80'
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
              className={`
                absolute bottom-3 right-3
                flex items-center gap-1.5 rounded-lg px-3 py-2
                border-2 backdrop-blur-md
                ${useOverlayStyle ? 'bg-black/70 border-white/15' : 'bg-white border-stone-200 shadow-xl'}
              `}
              style={{ borderColor: useOverlayStyle ? accent + '40' : accent + '80' }}
            >
              <svg className={`w-4 h-4 ${useOverlayStyle ? 'text-stone-300' : 'text-stone-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  text-xs sm:text-sm
                  font-semibold transition-colors
                  ${useOverlayStyle ? 'text-stone-300 hover:text-white' : 'text-stone-600'}
                `}
              >
                Open in Maps
              </a>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row gap-[14px] sm:gap-4 mb-[39px] sm:mb-[39px] lg:mb-12 xl:mb-10 animate-fade-in-up justify-center" style={{ animationDelay: '0.3s' }}>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-3 py-[17px] sm:py-4 rounded-full overflow-hidden transition-all duration-500 active:scale-[0.97] hover:scale-105 flex-1 sm:flex-none sm:min-w-[220px] lg:min-w-[260px] xl:min-w-[240px]"
              style={{ backgroundColor: accent }}
              aria-label={`Contact ${biz.name} on WhatsApp`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <WhatsAppIcon className="w-5 h-5 sm:w-6 text-black relative z-10" />
              <span className="text-black font-bold uppercase tracking-[0.2em] text-sm sm:text-base relative z-10">
                whatsapp
              </span>
            </a>
          )}
          
          {biz.phone && (
            <a
              href={`tel:${biz.phone}`}
              className={`
                flex items-center justify-center gap-3 py-[17px] sm:py-4
                rounded-full border-2 font-bold transition-all duration-300 
                uppercase tracking-[0.2em] text-sm sm:text-base
                hover:scale-105
                flex-1 sm:flex-none sm:min-w-[220px] lg:min-w-[260px] xl:min-w-[240px]
                ${useOverlayStyle 
                  ? 'bg-white/[0.03] backdrop-blur-md text-white hover:bg-white/[0.08]' 
                  : 'bg-white text-stone-900 hover:bg-stone-50 shadow-lg'}
              `}
              style={{ borderColor: useOverlayStyle ? accent + '40' : accent + '80' }}
              itemProp="telephone"
              aria-label={`Call ${biz.name} at ${biz.phone}`}
            >
              <PhoneIcon className={`w-5 h-5 sm:w-6 ${useOverlayStyle ? 'opacity-70' : 'opacity-90'}`} style={{ color: accent }} /> 
              <span style={{ color: useOverlayStyle ? '#e7e5e4' : '#78716c' }}>Call</span>
            </a>
          )}
        </div>

        <nav className="flex justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }} aria-label="Social media links">
          {biz.socials?.instagram && (
            <a 
              href={biz.socials.instagram} 
              target="_blank" 
              rel="noreferrer" 
              className="transition-all duration-300 hover:scale-110" 
              aria-label={`Follow ${biz.name} on Instagram`}
            >
              <InstagramIcon className="w-7 h-7 sm:w-8 lg:w-9 xl:w-8" style={{ color: accent }} />
            </a>
          )}
          {biz.socials?.tiktok && (
            <a 
              href={biz.socials.tiktok} 
              target="_blank" 
              rel="noreferrer" 
              className="transition-all duration-300 hover:scale-110" 
              aria-label={`Follow ${biz.name} on TikTok`}
            >
              <TikTokIcon className="w-7 h-7 sm:w-8 lg:w-9 xl:w-8" style={{ color: accent }} />
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