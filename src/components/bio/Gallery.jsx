import { useState, useEffect, useRef } from 'react';
import { XIcon } from '../Icons';

export default function Gallery({ gallery, accent, location, theme }) {
  const [lightbox, setLightbox] = useState({ isOpen: false, groupIdx: 0, imgIdx: 0 });
  const isDark = theme === 'dark';
  
  if (!gallery || gallery.length === 0) return null;
  
  const textColor = '#78716c'; // stone-600 - readable on light bg
  const textColorDark = '#d6d3d1'; // stone-300 - readable on dark bg
  
  const groups = typeof gallery[0] === 'string'
    ? [{ group: 'Gallery', images: gallery }]
    : gallery;

  function openLightbox(gIdx, iIdx) {
    setLightbox({ isOpen: true, groupIdx: gIdx, imgIdx: iIdx });
  }

  function closeLightbox() {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  }

  function next() {
    const len = groups[lightbox.groupIdx].images.length;
    setLightbox(prev => ({ ...prev, imgIdx: (prev.imgIdx + 1) % len }));
  }

  function prev() {
    const len = groups[lightbox.groupIdx].images.length;
    setLightbox(prev => ({ ...prev, imgIdx: (prev.imgIdx - 1 + len) % len }));
  }

  useEffect(() => {
    document.body.style.overflow = lightbox.isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightbox.isOpen]);

  return (
    <>
      {/* ✅ RAISED UP MAX - minimal margins for full view */}
      <section className="px-4 sm:px-6 lg:px-8 xl:px-10 mt-2 sm:mt-4 lg:mt-6 xl:mt-8" aria-label="Photo gallery">
        <h2 
          className={`text-xs sm:text-[11px] lg:text-sm xl:text-base font-semibold uppercase tracking-[0.2em] lg:tracking-[0.25em] mb-2 sm:mb-3 lg:mb-4 xl:mb-6 px-1 ${isDark ? textColorDark : textColor}`}
          style={{ color: isDark ? textColorDark : accent }}
        >
          Our Work
        </h2>
        
        {/* ✅ MINIMAL SPACING */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10">
          {groups.map((g, gIdx) => (
            <div key={gIdx}>
              {groups.length > 1 && (
                <h3 
                  className={`text-xs sm:text-[10px] lg:text-sm xl:text-base uppercase tracking-widest lg:tracking-[0.25em] font-bold mb-1 sm:mb-2 lg:mb-3 xl:mb-4 px-1 ${isDark ? textColorDark : textColor}`}
                  style={{ color: isDark ? textColorDark : accent }}
                >
                  {g.group}
                </h3>
              )}
              
              {/* ✅ 4 COLS ON DESKTOP = smaller images (75% width) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-3 xl:gap-4">
                {g.images.map((img, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => openLightbox(gIdx, iIdx)}
                    className={`aspect-[3/4] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 group relative shadow-md ${
                      isDark
                        ? 'bg-black border border-white/5 hover:border-white/20'
                        : 'bg-stone-100 border border-stone-200 hover:border-stone-300'
                    }`}
                    style={{ borderColor: isDark ? accent + '40' : accent + '80' }}
                  >
                    <img
                      src={img}
                      alt={location ? `${g.group} in ${location}` : `${g.group} ${iIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightbox.isOpen && (
        <Lightbox
          image={groups[lightbox.groupIdx].images[lightbox.imgIdx]}
          current={lightbox.imgIdx + 1}
          total={groups[lightbox.groupIdx].images.length}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
          accent={accent}
          alt={location ? `${groups[lightbox.groupIdx].group} in ${location}` : "Gallery full view"}
          theme={theme}
        />
      )}
    </>
  );
}

function Lightbox({ image, current, total, onClose, onPrev, onNext, accent, alt, theme }) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const timeoutRef = useRef(null);
  const isDark = theme === 'dark';
  
  const showControls = () => {
    setControlsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const handleMouseMove = () => showControls();

  useEffect(() => {
    showControls();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { onNext(); showControls(); }
      if (e.key === 'ArrowLeft') { onPrev(); showControls(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNext, onPrev]);

  const onTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) onNext();
    if (distance < -50) onPrev();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden animate-fade-in"
      onMouseMove={handleMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)' }}
      />
      
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className={`absolute top-4 sm:top-6 lg:top-8 xl:top-10 right-4 sm:right-6 lg:right-8 xl:right-10 z-50 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center text-stone-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ borderColor: accent + '40' }}
      >
        <XIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
      </button>

      <div
        className={`absolute top-4 sm:top-6 lg:top-8 xl:top-10 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-5 lg:px-6 xl:px-8 py-2 sm:py-2.5 lg:py-3 xl:py-3.5 rounded-full backdrop-blur-md border border-white/5 bg-black/40 transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ borderColor: accent + '40' }}
      >
        <span className="text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-widest font-bold text-white">
          <span style={{ color: accent }}>{current}</span> / {total}
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className={`absolute left-3 sm:left-4 lg:left-6 xl:left-8 z-50 w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 xl:w-22 xl:h-22 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-stone-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
        style={{ borderColor: accent + '40' }}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 pointer-events-none">
        <img
          src={image}
          alt={alt || "Gallery full view"}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none pointer-events-auto"
          draggable="false"
        />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className={`absolute right-3 sm:right-4 lg:right-6 xl:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 xl:w-22 xl:h-22 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-stone-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
        style={{ borderColor: accent + '40' }}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
