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
    <div className={`relative w-full overflow-hidden text-white ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'}`} style={{ minHeight: '85dvh' }}>
      
      {hasImages && (
        <>
          <style>{`
            @keyframes hero-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-hero-scroll {
              animation: hero-scroll 45s linear infinite;
            }
          `}</style>
          
          <div className="absolute inset-0 h-full w-full overflow-hidden z-0" aria-hidden="true">
            <div className={`flex animate-hero-scroll h-full w-full ${isDark ? 'opacity-60 grayscale-[40%]' : 'opacity-30 grayscale-[20%]'}`}>
              {[...heroImages, ...heroImages].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="h-full w-full object-cover flex-shrink-0"
                  loading="eager"
                />
              ))}
            </div>
          </div>

          <div className={`absolute inset-0 z-10 ${isDark ? 'bg-gradient-to-b from-black/20 via-black/40 to-[#0a0a0a]' : 'bg-gradient-to-b from-black/5 via-black/10 to-stone-50'}`} />
          
          <div 
            className="absolute inset-0 z-10 pointer-events-none opacity-[0.15] mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            aria-hidden="true"
          />
        </>
      )}

      <header className="relative z-20 max-w-lg mx-auto px-6 pt-16 pb-12 flex flex-col items-center justify-end h-full min-h-[85dvh]">
        
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in-up">
          <div className="relative mb-8">
             <div className={`relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center shadow-2xl ${isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-stone-200 shadow-md'}`}>
                {biz.logo || biz.avatar ? (
                  <img 
                    src={biz.logo || biz.avatar} 
                    alt={`${biz.name} logo`}
                    className="w-full h-full object-cover"
                    itemProp="logo"
                  />
                ) : (
                  <span className="text-3xl font-bold tracking-tighter" style={{ color: accent }}>{initials}</span>
                )}
             </div>
          </div>

          <h1 
            className={`text-5xl font-heading font-bold tracking-tight mb-3 leading-[1.1] capitalize drop-shadow-2xl ${isDark ? 'text-white' : 'text-stone-900'}`}
            itemProp="name"
          >
            {biz.name}
          </h1>
          
          <p className={`text-[11px] uppercase tracking-[0.3em] font-medium max-w-[280px] ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
            {biz.tagline}
          </p>
        </div>

        {biz.bio && (
          <p 
            className={`text-sm font-sans font-normal leading-relaxed text-center mb-10 max-w-sm animate-fade-in-up ${isDark ? 'text-stone-300' : 'text-stone-600'}`}
            style={{ animationDelay: '0.1s' }}
            itemProp="description"
          >
            {biz.bio}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {biz.location && (
            <button
              type="button"
              onClick={function() { 
                var mapEl = document.getElementById('location-map');
                if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`px-5 py-2.5 border rounded-full flex items-center gap-2 shadow-sm transition-colors cursor-pointer ${isDark ? 'bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.08]' : 'bg-white border-stone-200 hover:bg-stone-100'}`}
              aria-label="View location on map"
            >
              <MapPinIcon className="w-3 h-3" style={{ color: accent }} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{biz.location}</span>
            </button>
          )}
          {biz.hours && (
            <div className={`px-5 py-2.5 border rounded-full flex items-center gap-2 shadow-sm ${isDark ? 'bg-white/[0.04] backdrop-blur-xl border-white/10' : 'bg-white border-stone-200'}`}>
              <ClockIcon className="w-3 h-3" style={{ color: accent }} />
              <time className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-stone-200' : 'text-stone-700'}`} itemProp="openingHours">{biz.hours}</time>
            </div>
          )}
        </div>

        {biz.location && (
          <div 
            id="location-map"
            className={`w-full mb-10 rounded-2xl overflow-hidden border animate-fade-in-up relative ${isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-stone-200 bg-white'}`}
            style={{ animationDelay: '0.25s', height: '180px' }}
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
              style={isDark ? { filter: 'invert(90%) hue-rotate(180deg) saturate(0.8) contrast(1.1) brightness(0.9)', border: '0' } : { border: '0' }}
              loading="lazy"
            />
            <div 
              className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 border ${isDark ? 'bg-black/60 backdrop-blur-md border-white/10' : 'bg-white border-stone-200 shadow-sm'}`}
            >
              <svg className={`w-3 h-3 ${isDark ? 'text-stone-400' : 'text-stone-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                className={`text-[10px] font-medium transition-colors ${isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Open in Maps
              </a>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-3 py-5 rounded-full overflow-hidden transition-all duration-500 active:scale-[0.97]"
              style={{ backgroundColor: accent }}
              aria-label={`Contact ${biz.name} on WhatsApp`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <WhatsAppIcon className="w-4 h-4 text-black" />
              <span className="text-black font-bold uppercase tracking-[0.2em] text-[10px]">whatsapp</span>
            </a>
          )}
          
          {biz.phone && (
            <a
              href={`tel:${biz.phone}`}
              className={`flex items-center justify-center gap-3 py-5 rounded-full border font-bold transition-all duration-300 uppercase tracking-[0.2em] text-[10px] ${isDark ? 'border-white/10 bg-white/[0.03] backdrop-blur-md text-white hover:bg-white/[0.08] hover:border-white/20' : 'border-stone-200 bg-white text-stone-900 hover:bg-stone-100 hover:border-stone-300 shadow-sm'}`}
              itemProp="telephone"
              aria-label={`Call ${biz.name} at ${biz.phone}`}
            >
              <PhoneIcon className={`w-3.5 h-3.5 ${isDark ? 'opacity-60' : 'opacity-80'}`} /> Call 
            </a>
          )}
        </div>

        <nav className="flex justify-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }} aria-label="Social media links">
          {biz.socials?.instagram && (
            <a 
              href={biz.socials.instagram} 
              target="_blank" 
              rel="noreferrer" 
              className={`transition-all duration-300 hover:scale-110 ${isDark ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-900'}`}
              aria-label={`Follow ${biz.name} on Instagram`}
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
          )}
          {biz.socials?.tiktok && (
            <a 
              href={biz.socials.tiktok} 
              target="_blank" 
              rel="noreferrer" 
              className={`transition-all duration-300 hover:scale-110 ${isDark ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-900'}`}
              aria-label={`Follow ${biz.name} on TikTok`}
            >
              <TikTokIcon className="w-5 h-5" />
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