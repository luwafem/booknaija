// PropertyHero.jsx — FIXED image quality
import { useState, useEffect } from 'react';

export default function PropertyHero({ biz, accent, isDark }) {
  const whatsappLink = biz.whatsapp ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}` : null;

  const slides = biz.heroSlides?.length > 0 
    ? biz.heroSlides.map(s => ({
        image: s.image || s.desktopImage || s.url,
        mobileImage: s.mobileImage || s.image || s.desktopImage || s.url
      }))
    : (biz.hero ? [{ image: biz.hero, mobileImage: biz.hero }] : []);

  const isSlider = (biz.heroSlides || []).length > 0;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!isSlider) return;
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isSlider, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <style>{`
        .hero-img {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          will-change: auto;
        }
        @media (-webkit-min-device-pixel-ratio: 1) {
          .hero-img {
            image-rendering: auto;
          }
        }
        @media (min-resolution: 2dppx) {
          .hero-img {
            image-rendering: auto;
            -webkit-font-smoothing: antialiased;
          }
        }
      `}</style>

      {isSlider ? (
        <>
          <div className="hero-bg-wrapper absolute inset-0 z-0">
            {slides.map((slide, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                  currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={slide.image} 
                  alt="" 
                  fetchPriority={idx === 0 ? "high" : "low"}
                  className="hero-img hidden md:block absolute inset-0 w-full h-full object-cover"
                />
                <img 
                  src={slide.mobileImage || slide.image} 
                  alt="" 
                  fetchPriority={idx === 0 ? "high" : "low"}
                  className="hero-img md:hidden absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-black/25 z-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent opacity-90 z-20" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col items-center h-full py-20 md:py-0">
            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl text-center" />
            <div className="flex flex-col items-center gap-6 mb-10 md:mb-[8vh]">
              <div className="flex gap-3">
                {slides.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-[3px] rounded-full transition-all duration-500 ${
                      currentSlide === i ? 'w-16' : 'w-6 bg-white/20'
                    }`}
                    style={{ backgroundColor: currentSlide === i ? accent : undefined }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <a 
                  href="#listings" 
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/90 rounded-full shadow-sm"
                >
                  View Listings
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                
                {whatsappLink && (
                  <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:border-white/60 hover:bg-white/10 rounded-full"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Schedule Visit
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0">
            <img 
              src={slides[0].image} 
              alt={biz.name} 
              fetchPriority="high"
              className="hero-img w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col items-center justify-center h-full py-20">
            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl text-center" />

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 md:mb-[6vh]">
              <a 
                href="#listings" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/90 rounded-full shadow-sm"
              >
                View Listings
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              
              {whatsappLink && (
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:border-white/60 hover:bg-white/10 rounded-full"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Schedule Visit
                </a>
              )}
            </div>
          </div>

          <div className="absolute bottom-6 md:bottom-8 inset-x-0 z-10 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-[9px] tracking-[0.2em] uppercase text-white/40 font-semibold">Scroll</span>
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </>
      )}
    </section>
  );
}