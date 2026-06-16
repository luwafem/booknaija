import { useState, useEffect, useRef } from 'react';
import { XIcon } from '../Icons';

export default function Gallery({ gallery, accent, location, theme }) {
  const [lightbox, setLightbox] = useState({ isOpen: false, groupIdx: 0, imgIdx: 0 });
  const isDark = theme === 'dark';
  
  if (!gallery || gallery.length === 0) return null;
  
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
    document.body.style.overflow = lightbox.isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox.isOpen]);

  const allImages = groups.flatMap(g => g.images);
  const globalIdx = groups.slice(0, lightbox.groupIdx).reduce((sum, g) => sum + g.images.length, 0) + lightbox.imgIdx;

  return (
    <>
      <section className="mt-12 lg:mt-16 xl:mt-0" aria-label="Photo gallery">
        
        {/* ─── SECTION LABEL (MATCHED TO SectionHeading) ─── */}
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <div className="h-px flex-1" style={{ backgroundColor: accent + '15' }} />
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight whitespace-nowrap text-black">
            {groups.length > 1 ? 'Our Work' : 'Gallery'}
          </h2>
          <div className="h-px flex-1" style={{ backgroundColor: accent + '15' }} />
        </div>

        <div className="space-y-6 xl:space-y-8">
          {groups.map((g, gIdx) => (
            <div key={gIdx}>
              {groups.length > 1 && (
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 xl:mb-4" style={{ color: accent + '80' }}>
                  {g.group}
                </h3>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 xl:gap-3 2xl:gap-4">
                {g.images.map((img, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => openLightbox(gIdx, iIdx)}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-500"
                    style={{ 
                      boxShadow: `0 0 0 1px ${accent + '15'}`,
                    }}
                  >
                    <img
                      src={img}
                      alt={location ? `${g.group} in ${location}` : `${g.group} ${iIdx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      style={{ imageRendering: 'auto' }}
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    
                    {/* Zoom icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div 
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>

                    {/* Subtle accent border on hover */}
                    <div 
                      className="absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 0 1px ${accent}40` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightbox.isOpen && (
        <Lightbox
          images={allImages}
          currentIdx={globalIdx}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
          accent={accent}
          alt={location ? `${groups[lightbox.groupIdx].group} in ${location}` : "Gallery full view"}
        />
      )}
    </>
  );
}

function Lightbox({ images, currentIdx, onClose, onPrev, onNext, accent, alt }) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const timeoutRef = useRef(null);
  
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
  }, [currentIdx]);

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

  const goTo = (idx) => {
    const diff = idx - currentIdx;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) onNext();
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) onPrev();
    }
    showControls();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in"
      onMouseMove={handleMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClose}
    >
      {/* ─── TOP BAR ─── */}
      <div 
        className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 relative z-10 flex-shrink-0" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          <span className="text-white/50 text-[11px] font-medium tabular-nums">
            <span style={{ color: accent }}>{currentIdx + 1}</span> / {images.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0 rounded-full"
        >
          <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* ─── IMAGE AREA ─── */}
      <div 
        className="flex-1 flex items-center justify-center relative min-h-0 px-1 sm:px-4 md:px-16"
        onClick={e => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            onClick={onPrev}
            className={`hidden sm:flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all duration-300 z-10 rounded-full ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        <div className="max-w-5xl w-full h-full flex items-center justify-center p-2 sm:p-4 select-none">
          <img
            src={images[currentIdx]}
            alt={alt || "Gallery full view"}
            className="max-w-full max-h-full object-contain rounded-sm"
            draggable="false"
            style={{ imageRendering: 'auto' }}
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={onNext}
            className={`hidden sm:flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all duration-300 z-10 rounded-full ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── BOTTOM THUMBNAIL STRIP ─── */}
      {images.length > 1 && (
        <div 
          className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 flex flex-col items-center gap-2.5 relative z-10"
          onClick={e => e.stopPropagation()}
        >
          {images.length > 8 && (
            <p className="text-white/40 text-[11px] font-medium tabular-nums">
              {currentIdx + 1} / {images.length}
            </p>
          )}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 px-1 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-[4.5rem] md:h-[4.5rem] overflow-hidden rounded-lg transition-all duration-200 ${
                  idx === currentIdx 
                    ? 'scale-105' 
                    : 'opacity-30 hover:opacity-60'
                }`}
                style={{ 
                  border: idx === currentIdx ? `2px solid ${accent}` : '2px solid transparent',
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" draggable="false" style={{ imageRendering: 'auto' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}