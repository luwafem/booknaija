import { InstagramIcon, TikTokIcon, PhoneIcon, WhatsAppIcon, MapPinIcon, ClockIcon } from '../Icons';

export default function HeroSection({ biz }) {
  const accent = biz.accent || '#c8a97e';
  const initials = biz.name ? biz.name.split(' ').map((w) => w[0]).join('').substring(0, 2) : '??';
  
  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  const heroImages = isGrouped 
    ? biz.gallery.flatMap(g => g.images).slice(0, 4) 
    : (biz.gallery?.slice(0, 4) || []);
  
  const hasImages = heroImages.length > 0;

  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0a] text-white" style={{ minHeight: '85dvh' }}>
      
      {/* 1. Immersive Editorial Background */}
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
          
          <div className="absolute inset-0 h-full w-full overflow-hidden z-0">
            <div className="flex animate-hero-scroll h-full w-full opacity-60 grayscale-[40%]">
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

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0a0a0a] z-10" />
          
          <div 
            className="absolute inset-0 z-10 pointer-events-none opacity-[0.15] mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          />
        </>
      )}

      {/* 2. Content Layer */}
      <div className="relative z-20 max-w-lg mx-auto px-6 pt-16 pb-12 flex flex-col items-center justify-end h-full min-h-[85dvh]">
        
        {/* Unified Logo/Avatar Branding */}
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in-up">
          <div className="relative mb-8 group">
             {/* Dynamic Accent Glow */}
             <div 
                className="absolute blur-3xl inset-0 opacity-20 rounded-full scale-150 transition-transform group-hover:scale-[1.8] duration-1000"
                style={{ backgroundColor: accent }} 
             />
             
             <div className="relative w-32 h-32 bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
                {biz.logo || biz.avatar ? (
                  <img 
                    src={biz.logo || biz.avatar} 
                    alt={biz.name} 
                    className={`w-full h-full ${biz.logo ? 'object-contain p-6' : 'object-cover'}`} 
                  />
                ) : (
                  <span className="text-3xl font-bold tracking-tighter" style={{ color: accent }}>{initials}</span>
                )}
             </div>
          </div>

          <h1 className="text-5xl font-heading font-bold tracking-tight text-white mb-3 leading-[1.1] capitalize drop-shadow-2xl">
            {biz.name}
          </h1>
          
          

          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 font-medium max-w-[280px]">
            {biz.tagline}
          </p>
        </div>

        {/* Bio */}
        {biz.bio && (
          <p className="text-sm font-sans font-normal text-stone-300 leading-relaxed text-center mb-10 max-w-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {biz.bio}
          </p>
        )}

        {/* Info Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {biz.location && (
            <div className="px-5 py-2.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 shadow-sm">
              <MapPinIcon className="w-3 h-3" style={{ color: accent }} />
              <span className="text-[10px] font-bold text-stone-200 uppercase tracking-widest">{biz.location}</span>
            </div>
          )}
          {biz.hours && (
            <div className="px-5 py-2.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 shadow-sm">
              <ClockIcon className="w-3 h-3" style={{ color: accent }} />
              <span className="text-[10px] font-bold text-stone-200 uppercase tracking-widest">{biz.hours}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Minimalist Luxury Style */}
        <div className="w-full flex flex-col gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <a
            href={biz.whatsapp ? `https://wa.me/${biz.whatsapp}` : `https://wa.me/${biz.phone?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="group relative flex items-center justify-center gap-3 py-5 rounded-full overflow-hidden transition-all duration-500 active:scale-[0.97]"
            style={{ backgroundColor: accent }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <WhatsAppIcon className="w-4 h-4 text-black" />
            <span className="text-black font-bold uppercase tracking-[0.2em] text-[10px]">whatsapp</span>
          </a>
          
          <a
            href={`tel:${biz.phone}`}
            className="flex items-center justify-center gap-3 py-5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-white font-bold hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 uppercase tracking-[0.2em] text-[10px]"
          >
            <PhoneIcon className="w-3.5 h-3.5 opacity-60" /> Call 
          </a>
        </div>

        {/* Socials */}
        <div className="flex justify-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {biz.socials?.instagram && (
            <a href={biz.socials.instagram} target="_blank" rel="noreferrer" className="text-stone-500 hover:text-white transition-all duration-300 hover:scale-110">
              <InstagramIcon className="w-5 h-5" />
            </a>
          )}
          {biz.socials?.tiktok && (
            <a href={biz.socials.tiktok} target="_blank" rel="noreferrer" className="text-stone-500 hover:text-white transition-all duration-300 hover:scale-110">
              <TikTokIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
      
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