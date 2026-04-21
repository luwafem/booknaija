import { InstagramIcon, TikTokIcon, PhoneIcon, WhatsAppIcon, MapPinIcon, ClockIcon } from '../Icons';

export default function HeroSection({ biz }) {
  const accent = biz.accent || '#c8a97e';
  const initials = biz.name.split(' ').map((w) => w[0]).join('').substring(0, 2);
  // FIX: Handle both Flat (legacy) and Grouped (new) gallery structures
  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  let heroImages = [];
  if (isGrouped) {
      // Flatten grouped structure to get just image strings
      heroImages = biz.gallery.flatMap(g => g.images).slice(0, 4);
  } else if (biz.gallery) {
      // Use flat structure directly
      heroImages = biz.gallery.slice(0, 4);
  }
  
  const hasImages = heroImages.length > 0;

  return (
    <div className="relative w-full overflow-hidden bg-black text-white" style={{ minHeight: '60dvh' }}>
      
      {/* 1. Infinite Scrolling Images (100% Full Height) */}
      {hasImages && (
        <>
          <style>{`
            @keyframes hero-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-hero-scroll {
              animation: hero-scroll 35s linear infinite;
            }
          `}</style>
          
          {/* Image Container */}
          <div className="absolute inset-0 h-full w-full overflow-hidden z-0">
            <div className="flex animate-hero-scroll h-full w-full grayscale-[30%]">
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

          {/* Global Dimmer */}
          <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
          
          {/* Noise Texture overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />
        </>
      )}

      {/* 2. Content Layer */}
      {/* RESPONSIVE UPDATE: max-w-2xl for wider desktop support, px-4 sm:px-6 for adaptive padding */}
      <div className="relative z-20 max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-8 flex flex-col justify-end h-full">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* LOGIC: Logo Overrides Avatar */}
          {biz.logo ? (
             <div className="relative mb-6 group">
               {/* Accent Border */}
               <div 
                  className="absolute -inset-1 rounded-2xl transition-transform group-hover:scale-105 duration-300"
                  style={{ backgroundColor: accent }} 
               />
               {/* Logo Image */}
               <div className="relative w-28 h-28 bg-black rounded-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center">
                  <img 
                      src={biz.logo} 
                      alt={biz.name} 
                      className="w-full h-full object-contain" 
                  />
               </div>
             </div>
          ) : (
             // EXISTING AVATAR LOGIC
             <div className="relative mb-6 group">
               {/* Accent Border */}
               <div 
                  className="absolute -inset-1 rounded-2xl transition-transform group-hover:scale-105 duration-300"
                  style={{ backgroundColor: accent }} 
               />
               {/* Image Container */}
               <div className="relative w-28 h-28 bg-black rounded-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center">
                  {biz.avatar ? (
                    <img src={biz.avatar} alt={biz.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{initials}</span>
                  )}
               </div>
             </div>
          )}

          <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight text-white mb-2 leading-tight drop-shadow-lg capitalize">
            {biz.name}
          </h1>
          
          {/* Tagline: Clean Sans-Serif */}
          <p className="text-[11px] uppercase tracking-[0.15em] text-stone-300 font-sans font-medium mb-1">
            {biz.tagline}
          </p>
        </div>

        {/* Bio: Clean Sans-Serif for Readability */}
        {biz.bio && (
          <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             <p className="text-base font-sans font-normal text-stone-100 leading-relaxed max-w-lg mx-auto">
               {biz.bio}
             </p>
          </div>
        )}

        {/* Business Info (Responsive Grid (1 col mobile, 2 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {biz.location && (
            <div className="bg-black/60 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <MapPinIcon className="w-4 h-4 mb-1.5 opacity-80" style={{ color: accent }} />
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">Location</span>
              <span className="text-xs text-stone-200 font-medium">{biz.location}</span>
            </div>
          )}
          {biz.hours && (
            <div className="bg-black/60 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <ClockIcon className="w-4 h-4 mb-1.5 opacity-80" style={{ color: accent }} />
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">Hours</span>
              <span className="text-xs text-stone-200 font-medium">{biz.hours}</span>
            </div>
          )}
        </div>

        {/* Contact Actions */}
        <div className="flex flex-col gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          
          {/* Secondary Action: Call (Outline) */}
          <a
            href={`tel:${biz.phone}`}
            className="flex items-center justify-center gap-3 py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 hover:border-white/40 transition-all duration-300 uppercase tracking-wide text-sm drop-shadow-md"
          >
            <PhoneIcon className="w-4 h-4" /> Call Now
          </a>
          
          {/* Primary Action: WhatsApp (Solid Accent) */}
          <a
            href={biz.whatsapp ? `https://wa.me/${biz.whatsapp}` : `https://wa.me/${biz.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 py-4 rounded-xl text-white font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide text-sm"
            style={{ backgroundColor: accent, color: '#0a0a0a' }}
          >
            <WhatsAppIcon className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {biz.socials?.instagram && (
            <a href={biz.socials.instagram} target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center hover:border-white/40 hover:bg-black/60 transition-all duration-300 text-stone-300">
              <InstagramIcon className="w-4 h-4" />
            </a>
          )}
          {biz.socials?.tiktok && (
            <a href={biz.socials.tiktok} target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center hover:border-white/40 hover:bg-black/60 transition-all duration-300 text-stone-300">
              <TikTokIcon className="w-4 h-4" />
            </a>
          )}
        </div>

      </div>
      
      {/* CSS for Animations */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}