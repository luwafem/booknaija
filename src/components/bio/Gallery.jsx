import { useState, useEffect, useRef } from 'react';
import { XIcon } from '../Icons';

export default function Gallery({ gallery, accent }) {
  const [lightbox, setLightbox] = useState({ isOpen: false, groupIdx: 0, imgIdx: 0 });

  if (!gallery || gallery.length === 0) return null;

  // Backward compatibility: if flat array is passed, convert to single group
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

  // Lock background scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox.isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightbox.isOpen]);

  return (
    <>
      <section className="px-6 mt-8">
        <h2 className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.15em] mb-4 px-1">
          Our Work
        </h2>
        
        <div className="space-y-6">
          {groups.map((g, gIdx) => (
            <div key={gIdx}>
              {/* Only show group title if there is more than one group */}
              {groups.length > 1 && (
                <h3 className="text-xs font-medium text-stone-400 mb-2 px-1">{g.group}</h3>
              )}
              <div className="grid grid-cols-3 gap-1.5">
                {g.images.map((img, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => openLightbox(gIdx, iIdx)}
                    className="aspect-square rounded-xl overflow-hidden bg-[#111] border border-white/[0.04] group relative"
                  >
                    <img
                      src={img}
                      alt={`${g.group} ${iIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightbox.isOpen && (
        <Lightbox 
          image={groups[lightbox.groupIdx].images[lightbox.imgIdx]} 
          current={lightbox.imgIdx + 1}
          total={groups[lightbox.groupIdx].images.length}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}

function Lightbox({ image, current, total, onClose, onPrev, onNext }) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Keyboard Navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNext, onPrev]);

  // Mobile Swipe Navigation
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
    if (distance > 50) onNext(); // Swiped Left
    if (distance < -50) onPrev(); // Swiped Right
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <XIcon className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-stone-300 font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
        {current} / {total}
      </div>

      {/* Prev Button */}
      <button 
        onClick={onPrev} 
        className="absolute left-4 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors hidden sm:flex"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Main Image */}
      <div className="w-full h-full flex items-center justify-center p-8 sm:p-16">
        <img 
          src={image} 
          alt="Gallery full view" 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
          draggable="false"
        />
      </div>

      {/* Next Button */}
      <button 
        onClick={onNext} 
        className="absolute right-4 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors hidden sm:flex"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}