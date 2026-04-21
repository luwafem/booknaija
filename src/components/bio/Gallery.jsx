import { useState, useEffect, useRef } from 'react';
import { XIcon } from '../Icons';

export default function Gallery({ gallery, accent }) {
  const [lightbox, setLightbox] = useState({ isOpen: false, groupIdx: 0, imgIdx: 0 });

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
    document.body.style.overflow = lightbox.isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightbox.isOpen]);

  return (
    <>
      <section className="px-6 mt-8 max-w-xl mx-auto">
        <h2 className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.2em] mb-6 px-1">
          Our Work
        </h2>
        
        <div className="space-y-8">
          {groups.map((g, gIdx) => (
            <div key={gIdx}>
              {groups.length > 1 && (
                <h3 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-3 px-1">
                  {g.group}
                </h3>
              )}
              {/* Responsive Grid: 2 cols on mobile, 3 on desktop for breathing room */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {g.images.map((img, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => openLightbox(gIdx, iIdx)}
                    className="aspect-square rounded-2xl overflow-hidden bg-black border border-white/5 hover:border-white/20 transition-all duration-300 group relative shadow-lg"
                  >
                    <img
                      src={img}
                      alt={`${g.group} ${iIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {/* Subtle Vignette Hover Effect */}
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
        />
      )}
    </>
  );
}

function Lightbox({ image, current, total, onClose, onPrev, onNext, accent }) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const timeoutRef = useRef(null);

  // Auto-hide controls logic
  const showControls = () => {
    setControlsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  // Reset timeout on interactions
  const handleMouseMove = () => showControls();

  useEffect(() => {
    showControls(); // Show initially
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current]); // Reset when image changes

  // Keyboard Navigation
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
      onClick={onClose} // Click background to close
    >
      
      {/* Radial Vignette Overlay for Premium Look */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      {/* Close Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className={`absolute top-6 right-6 z-50 w-12 h-12 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center text-stone-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <XIcon className="w-5 h-5" />
      </button>

      {/* Counter with Accent */}
      <div 
        className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5 bg-black/40 transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="text-[10px] uppercase tracking-widest font-bold text-white">
          <span style={{ color: accent }}>{current}</span> / {total}
        </span>
      </div>

      {/* Prev Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className={`absolute left-4 sm:left-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-stone-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-12 sm:p-24 pointer-events-none">
        <img 
          src={image} 
          alt="Gallery full view" 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none pointer-events-auto"
          draggable="false"
        />
      </div>

      {/* Next Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className={`absolute right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-stone-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}