// PropertyEstates.jsx — COMPLETE FILE
import { useState, useEffect } from 'react';

export default function PropertyEstates({ biz, accent, isDark, onSelectProperty }) {
  const estates = biz.estates || [];
  const whatsappBase = biz.whatsapp ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}` : null;

  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], currentIndex: 0, name: '' });
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') setLightbox(prev => ({ ...prev, isOpen: false }));
      if (e.key === 'ArrowRight') setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
      if (e.key === 'ArrowLeft') setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }));
    };
    if (lightbox.isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox.isOpen, lightbox.images.length]);

  const openLightbox = (images, startIndex = 0, name = '') => {
    if (!images || images.length === 0) return;
    setLightbox({ isOpen: true, images, currentIndex: startIndex, name });
  };

  const closeLightbox = () => setLightbox(prev => ({ ...prev, isOpen: false }));

  // Mobile swipe handling for lightbox
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null || lightbox.images.length <= 1) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
      else setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }));
    }
    setTouchStart(null);
  };

  const getGalleryImages = (estate) => {
    let imgs = [];
    if (estate.heroImage) imgs.push(estate.heroImage);
    if (estate.images?.length > 0) {
      estate.images.forEach(img => { if (!imgs.includes(img)) imgs.push(img); });
    }
    return imgs;
  };

  const theme = isDark
    ? {
        bg: 'bg-black',
        text: 'text-white',
        sub: 'text-zinc-300',
        muted: 'text-zinc-400',
        card: 'bg-white/[0.03] rounded-2xl',
        pillBg: 'bg-white/[0.06]',
        pillText: 'text-zinc-300',
        altBg: 'bg-black',
        placeholder: 'bg-white/[0.03]',
      }
    : {
        bg: 'bg-white',
        text: 'text-black',
        sub: 'text-gray-600',
        muted: 'text-gray-500',
        card: 'bg-white rounded-2xl',
        pillBg: 'bg-gray-100',
        pillText: 'text-gray-600',
        altBg: 'bg-white',
        placeholder: 'bg-gray-100',
      };

  const formatPrice = (price) => {
    if (!price) return 'POA';
    if (price >= 1e9) return `₦${(price / 1e9).toFixed(1)}B`;
    if (price >= 1e6) return `₦${(price / 1e6).toFixed(0)}M`;
    return `₦${Number(price).toLocaleString()}`;
  };

  if (estates.length === 0) return null;

  const WaIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  const PinIcon = ({ size = "w-3 h-3" }) => (
    <svg className={size} style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const GalleryIcon = ({ className = "w-3 h-3" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const GalleryStrip = ({ images, name, isFeatured = false, skip = 1 }) => {
    const additional = images.slice(skip);
    if (additional.length === 0) return null;

    const maxShow = 4;
    const visible = additional.slice(0, maxShow);
    const leftover = additional.length - maxShow;
    
    return (
      // Horizontal scroll on mobile, grid on desktop
      <div className={`flex gap-2 mt-2 sm:mt-3 overflow-x-auto no-scrollbar pb-2 sm:pb-0 snap-x snap-mandatory sm:grid sm:grid-cols-4 sm:overflow-visible ${isFeatured ? 'sm:gap-3' : ''}`}>
        {visible.map((img, i) => {
          const globalIdx = skip + i;
          const isLast = i === maxShow - 1 && leftover > 0;
          return (
            <div
              key={i}
              className="relative aspect-[4/3] w-32 sm:w-auto flex-shrink-0 overflow-hidden cursor-zoom-in group/thumb rounded-xl snap-start"
              onClick={() => openLightbox(images, globalIdx, name)}
            >
              <img
                src={img}
                alt={`${name} — ${globalIdx + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105"
                loading="lazy"
                draggable={false}
                style={{ imageRendering: 'auto' }}
              />
              {isLast && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base font-medium">+{leftover}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const featured = estates[0];
  const others = estates.slice(1);

  return (
    <section id="estates" className={`relative ${theme.bg} transition-colors duration-500`}>
      {/* Global style to hide scrollbars on mobile without breaking native scroll on desktop */}
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-24 md:pt-32 lg:pt-40 pb-6 sm:pb-10">
        <div className="text-center">
          <h2 className={`text-3xl md:text-5xl font-medium tracking-tight ${theme.text}`}>
            Our Estates
          </h2>
        </div>
      </div>

      {featured && (() => {
        const fImages = getGalleryImages(featured);
        return (
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pb-16 sm:pb-24 lg:pb-32">

            <div
              className="group/banner relative aspect-[4/3] sm:aspect-[2/1] lg:aspect-[21/9] overflow-hidden cursor-zoom-in rounded-2xl"
              onClick={() => openLightbox(fImages, 0, featured.name)}
            >
              {fImages.length > 0 ? (
                <img
                  src={fImages[0]}
                  alt={featured.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover/banner:scale-[1.03]"
                  style={{ imageRendering: 'auto' }}
                />
              ) : (
                <div className={`absolute inset-0 ${theme.placeholder}`} />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5 pointer-events-none rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent hidden lg:block pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-10 xl:p-14 pointer-events-none">
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                  <span className="px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-white rounded-full" style={{ backgroundColor: accent }}>
                    Featured
                  </span>
                  {fImages.length > 1 && (
                    <span className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-md flex items-center gap-1.5 rounded-full">
                      <GalleryIcon className="w-3 h-3" /> {fImages.length} Photos
                    </span>
                  )}
                  {featured.completionDate && (
                    <span className="hidden sm:inline-flex px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-md rounded-full">
                      {featured.completionDate}
                    </span>
                  )}
                </div>

                {featured.location && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <PinIcon size="w-3 h-3" />
                    <span className="text-white/80 text-[11px] sm:text-xs font-bold tracking-[0.12em] uppercase">
                      {featured.location}
                    </span>
                  </div>
                )}

                <h3 className="text-[1.5rem] sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-[1.1] max-w-3xl">
                  {featured.name}
                </h3>

                {featured.tagline && (
                  <p className="text-white/70 text-sm sm:text-base mt-2 max-w-xl leading-relaxed hidden sm:block">
                    {featured.tagline}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mt-5 pointer-events-auto">
                  <div>
                    <p className="text-white/50 text-[10px] font-bold tracking-[0.15em] uppercase">Starting from</p>
                    <p className="text-white text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight">
                      {formatPrice(featured.priceRange?.min)}
                    </p>
                  </div>
                  <a
                    href={whatsappBase ? `${whatsappBase}&text=${encodeURIComponent(`Hi, I'm interested in ${featured.name}. Please share more details.`)}` : '#'}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 text-sm font-medium text-white transition-all duration-300 hover:brightness-110 active:scale-[0.98] w-full sm:w-auto rounded-full shadow-sm"
                    style={{ backgroundColor: accent }}
                  >
                    <WaIcon className="w-4 h-4" />
                    Enquire Now
                  </a>
                </div>
              </div>

              {/* Desktop Hover Gallery Button */}
              <div className="hidden lg:flex absolute inset-0 bg-black/0 group-hover/banner:bg-black/10 transition-colors duration-500 items-center justify-center pointer-events-none rounded-2xl">
                <span className="px-5 py-2.5 bg-white text-gray-900 text-xs font-bold tracking-wider uppercase opacity-0 group-hover/banner:opacity-100 translate-y-3 group-hover/banner:translate-y-0 transition-all duration-500 shadow-lg flex items-center gap-2 pointer-events-auto rounded-full">
                  <GalleryIcon className="w-4 h-4" /> View Gallery
                </span>
              </div>
            </div>

            {/* Mobile Only Gallery CTA */}
            {fImages.length > 1 && (
              <button 
                onClick={() => openLightbox(fImages, 0, featured.name)}
                className="lg:hidden mt-3 w-full flex items-center justify-center gap-2 py-3 text-xs font-bold tracking-[0.15em] uppercase rounded-full border transition-colors active:scale-[0.98]"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e5e5', color: theme.sub }}
              >
                <GalleryIcon className="w-4 h-4" />
                View All {fImages.length} Photos
              </button>
            )}

            <GalleryStrip images={fImages} name={featured.name} isFeatured skip={1} />

            <div className={`mt-4 sm:mt-6 p-5 sm:p-6 lg:p-8 ${theme.card}`}>
              {featured.description && (
                <p className={`text-sm leading-relaxed ${theme.sub} ${(featured.amenities?.length || featured.totalUnits) ? 'mb-8' : ''}`}>
                  {featured.description}
                </p>
              )}

              {(featured.totalUnits || featured.unitTypes?.length) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
                  {featured.totalUnits && (
                    <div>
                      <p className={`text-[10px] font-bold tracking-[0.15em] uppercase mb-1 ${theme.muted}`}>Availability</p>
                      <p className={`text-lg font-medium tracking-tight ${theme.text}`}>
                        {featured.availableUnits || 0}
                        <span className={`text-sm font-normal ${theme.muted}`}> / {featured.totalUnits} Units</span>
                      </p>
                    </div>
                  )}
                  {featured.completionDate && (
                    <div>
                      <p className={`text-[10px] font-bold tracking-[0.15em] uppercase mb-1 ${theme.muted}`}>Completion</p>
                      <p className={`text-lg font-medium tracking-tight ${theme.text}`}>{featured.completionDate}</p>
                    </div>
                  )}
                  {featured.unitTypes?.length > 0 && (
                    <div>
                      <p className={`text-[10px] font-bold tracking-[0.15em] uppercase mb-1 ${theme.muted}`}>Unit Types</p>
                      <p className={`text-lg font-medium tracking-tight ${theme.text}`}>{featured.unitTypes.length}</p>
                    </div>
                  )}
                </div>
              )}

              {featured.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {featured.amenities.map((a, i) => (
                    <span key={i} className={`px-4 py-1.5 text-[11px] font-medium rounded-full ${theme.pillBg} ${theme.pillText}`}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {others.length > 0 && (
        <div className={`${theme.altBg} py-16 sm:py-24 lg:py-32 transition-colors duration-500`}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">

            <div className="text-center mb-12 sm:mb-16">
              <h2 className={`text-2xl md:text-3xl font-medium tracking-tight ${theme.text}`}>
                More Estates
              </h2>
            </div>

            {/* Desktop 2-Column Grid / Mobile Single Column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {others.map((estate) => {
                const eImages = getGalleryImages(estate);
                return (
                  <div key={estate.id}>

                    <div
                      className="group/banner relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] overflow-hidden cursor-zoom-in rounded-2xl"
                      onClick={() => openLightbox(eImages, 0, estate.name)}
                    >
                      {eImages.length > 0 ? (
                        <img
                          src={eImages[0]}
                          alt={estate.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover/banner:scale-[1.03]"
                          loading="lazy"
                          style={{ imageRendering: 'auto' }}
                        />
                      ) : (
                        <div className={`absolute inset-0 ${theme.placeholder}`} />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5 pointer-events-none rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent hidden lg:block pointer-events-none" />

                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 pointer-events-none">
                        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                          {estate.completionDate && (
                            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-white rounded-full" style={{ backgroundColor: accent }}>
                              {estate.completionDate}
                            </span>
                          )}
                          {eImages.length > 1 && (
                            <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-md flex items-center gap-1 rounded-full">
                              <GalleryIcon className="w-2.5 h-2.5" /> {eImages.length}
                            </span>
                          )}
                          {estate.unitTypes?.length > 0 && (
                            <span className="hidden sm:inline-flex px-2 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-md rounded-full">
                              {estate.unitTypes.length} Types
                            </span>
                          )}
                        </div>

                        {estate.location && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <PinIcon size="w-2.5 h-2.5" />
                            <span className="text-white/80 text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase">
                              {estate.location}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight">
                              {estate.name}
                            </h4>
                            {estate.tagline && (
                              <p className="text-white/70 text-sm mt-1 max-w-md leading-relaxed hidden sm:line-clamp-2">
                                {estate.tagline}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 pointer-events-auto flex-shrink-0 w-full sm:w-auto">
                            <div className="min-w-[80px]">
                              <p className="text-white/50 text-[10px] font-bold tracking-[0.15em] uppercase">From</p>
                              <p className="text-white text-lg sm:text-xl font-medium tracking-tight">
                                {formatPrice(estate.priceRange?.min)}
                              </p>
                            </div>
                            <a
                              href={whatsappBase ? `${whatsappBase}&text=${encodeURIComponent(`Hi, I'm interested in ${estate.name}.`)}` : '#'}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:brightness-110 active:scale-[0.97] rounded-full shadow-sm"
                              style={{ backgroundColor: accent }}
                            >
                              Enquire
                              <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Hover Gallery Button */}
                      <div className="hidden lg:flex absolute inset-0 bg-black/0 group-hover/banner:bg-black/10 transition-colors duration-500 items-center justify-center pointer-events-none rounded-2xl">
                        <span className="px-4 py-2 bg-white text-gray-900 text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover/banner:opacity-100 translate-y-2 group-hover/banner:translate-y-0 transition-all duration-500 shadow-lg flex items-center gap-1.5 pointer-events-auto rounded-full">
                          <GalleryIcon className="w-3.5 h-3.5" /> View Gallery
                        </span>
                      </div>
                    </div>

                    <GalleryStrip images={eImages} name={estate.name} skip={1} />

                    <div className={`mt-3 sm:mt-4 p-4 sm:p-5 ${theme.card}`}>
                      {estate.description && (
                        <p className={`text-[13px] sm:text-sm leading-relaxed ${theme.sub} ${estate.amenities?.length ? 'mb-4' : ''}`}>
                          {estate.description}
                        </p>
                      )}
                      {estate.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {estate.amenities.slice(0, 6).map((a, i) => (
                            <span key={i} className={`px-4 py-1 text-[10px] font-medium rounded-full ${theme.pillBg} ${theme.pillText}`}>
                              {a}
                            </span>
                          ))}
                          {estate.amenities.length > 6 && (
                            <span className={`px-4 py-1 text-[10px] font-medium rounded-full ${theme.pillBg} ${theme.pillText}`}>
                              +{estate.amenities.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-16 sm:mt-24 lg:mt-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pb-16 sm:pb-24 lg:pb-32 text-center">
          <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight ${theme.text} leading-tight mb-4`}>
            Ready to find your home?
          </h3>
          <p className={`text-sm max-w-md mx-auto leading-relaxed mb-8 ${theme.sub}`}>
            Book a site visit, get payment plan details, or speak with a consultant today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {whatsappBase && (
              <a
                href={`${whatsappBase}&text=${encodeURIComponent("Hi, I'm interested in your estate developments. Please share available options.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:brightness-110 active:scale-[0.98] w-full sm:w-auto justify-center rounded-full shadow-sm"
                style={{ backgroundColor: accent }}
              >
                <WaIcon className="w-4 h-4" />
                WhatsApp Consultant
              </a>
            )}
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className={`inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium ${theme.text} transition-all duration-300 ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'} active:scale-[0.98] w-full sm:w-auto justify-center rounded-full`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {biz.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {lightbox.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col" onClick={closeLightbox}>
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 relative z-10 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <h4 className="text-white text-sm sm:text-base font-medium tracking-tight truncate pr-4">
              {lightbox.name}
            </h4>
            <button
              onClick={closeLightbox}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div 
            className="flex-1 flex items-center justify-center relative min-h-0 px-1 sm:px-4 md:px-16" 
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {lightbox.images.length > 1 && (
              <button
                onClick={() => setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }))}
                className="hidden sm:flex absolute left-1 sm:left-3 md:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors z-10 rounded-full"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="max-w-5xl w-full h-full flex items-center justify-center p-2 sm:p-4 select-none">
              <img
                src={lightbox.images[lightbox.currentIndex]}
                alt={`${lightbox.name} — ${lightbox.currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-sm"
                draggable={false}
                style={{ imageRendering: 'auto' }}
              />
            </div>

            {lightbox.images.length > 1 && (
              <button
                onClick={() => setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }))}
                className="hidden sm:flex absolute right-1 sm:right-3 md:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors z-10 rounded-full"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 flex flex-col items-center gap-2.5 relative z-10" onClick={e => e.stopPropagation()}>
            <p className="text-white/50 text-[11px] font-medium tabular-nums">
              {lightbox.currentIndex + 1} / {lightbox.images.length}
            </p>
            {lightbox.images.length > 1 && (
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 px-1 no-scrollbar">
                {lightbox.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightbox(prev => ({ ...prev, currentIndex: idx }))}
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-[4.5rem] md:h-[4.5rem] overflow-hidden border-2 transition-all duration-200 rounded-lg ${
                      idx === lightbox.currentIndex ? 'border-white opacity-100 scale-105' : 'border-transparent opacity-35 hover:opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}