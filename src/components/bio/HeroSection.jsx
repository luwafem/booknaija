import { InstagramIcon, TikTokIcon, PhoneIcon, WhatsAppIcon, MapPinIcon, ClockIcon } from '../Icons';

export default function HeroSection({ biz }) {
  const accent = biz.accent || '#c8a97e';
  const initials = biz.name.split(' ').map((w) => w[0]).join('').substring(0, 2);
  
  // Grab first 4 images for the hero scroll
  const heroImages = biz.gallery?.slice(0, 4) || [];
  const hasImages = heroImages.length > 0;

  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ minHeight: '34rem' }}>
      
      {/* 1. Infinite Scrolling Images Background */}
      {hasImages && (
        <>
          <style>{`
            @keyframes hero-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-hero-scroll {
              animation: hero-scroll 25s linear infinite;
            }
          `}</style>
          <div className="absolute inset-0 flex">
            <div className="flex animate-hero-scroll h-full">
              {/* Duplicate the array to create a seamless infinite loop */}
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
        </>
      )}

      {/* 2. Dark Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{ background: `linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.4) 40%, #0a0a0a 95%)` }}
      />

      {/* 3. Content Layer */}
      <div className="relative z-20 max-w-md mx-auto px-6 pt-10 pb-8 flex flex-col justify-end h-full" style={{ minHeight: '34rem' }}>
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-20 h-20 rounded-2xl border-2 border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-bold bg-black/40 backdrop-blur-md"
            style={{ color: accent, boxShadow: `0 8px 24px -6px ${accent}40` }}
          >
            {biz.avatar ? (
              <img src={biz.avatar} alt={biz.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white truncate drop-shadow-lg">{biz.name}</h1>
            <p className="text-stone-200 text-sm mt-1 truncate drop-shadow-md">{biz.tagline}</p>
          </div>
        </div>

        {/* Bio */}
        {biz.bio && (
          <p className="text-stone-300 text-sm leading-relaxed mb-5 line-clamp-2 drop-shadow-sm">
            {biz.bio}
          </p>
        )}

        {/* Business Info (Compact Pill) */}
        {(biz.location || biz.hours) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-stone-300 text-xs mb-5 bg-white/5 backdrop-blur-md rounded-xl px-4 py-3 border border-white/[0.08]">
            {biz.location && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <MapPinIcon className="w-3.5 h-3.5 text-stone-400" />
                {biz.location}
              </span>
            )}
            {biz.location && biz.hours && (
              <span className="w-1 h-1 rounded-full bg-stone-600 hidden sm:block" />
            )}
            {biz.hours && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <ClockIcon className="w-3.5 h-3.5 text-stone-400" />
                {biz.hours}
              </span>
            )}
          </div>
        )}

        {/* Contact Actions */}
        <div className="flex gap-3 mb-5">
          <a
            href={`tel:${biz.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-sm text-stone-100 hover:bg-white/10 transition-all duration-200 font-medium"
          >
            <PhoneIcon className="w-4 h-4" /> Call
          </a>
          <a
            href={biz.whatsapp ? `https://wa.me/${biz.whatsapp}` : `https://wa.me/${biz.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 backdrop-blur-md"
            style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}50` }}
          >
            <WhatsAppIcon className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        {/* Social Links */}
        {(biz.socials?.instagram || biz.socials?.tiktok) && (
          <div className="flex justify-center gap-3">
            {biz.socials.instagram && (
              <a href={biz.socials.instagram} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
                <InstagramIcon className="w-5 h-5" />
              </a>
            )}
            {biz.socials.tiktok && (
              <a href={biz.socials.tiktok} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
                <TikTokIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
}