import { useState } from 'react';

export default function CarList({ cars, selectedCar, onSelect, accent, location, theme }) {
  const isDark = theme === 'dark';

  const rentals = cars.filter(c => c.type === 'rent');
  const sales = cars.filter(c => c.type === 'sale');

  return (
    <section className="px-4 sm:px-6 mt-8" aria-label="Vehicle listings">
      
      {rentals.length > 0 && (
        <>
          <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 px-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Available for Rent
          </h2>
          {/* Responsive: 1 col mobile, 2 col desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-8">
            {rentals.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                active={selectedCar?.id === car.id}
                accent={accent}
                onClick={() => onSelect(car)}
                location={location}
                theme={theme}
              />
            ))}
          </div>
        </>
      )}

      {sales.length > 0 && (
        <>
          <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 px-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Cars for Sale
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {sales.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                active={selectedCar?.id === car.id}
                accent={accent}
                onClick={() => onSelect(car)}
                location={location}
                theme={theme}
              />
            ))}
          </div>
        </>
      )}

      {cars.length === 0 && (
        <div className={`text-center py-8 text-sm ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
          No cars available at the moment.
        </div>
      )}
    </section>
  );
}

function CarCard({ car, active, accent, onClick, location, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const isDark = theme === 'dark';
  const images = car.images || [car.image];
  const isRent = car.type === 'rent';

  const badgeColor = isRent 
    ? (isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200') 
    : (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200');

  const seoAlt = location ? `${car.name} in ${location}` : car.name;

  const cardBg = isDark 
    ? (active ? 'bg-white/5' : 'bg-white/[0.02] hover:bg-white/[0.04]') 
    : (active ? 'bg-stone-50' : 'bg-white hover:bg-stone-50');
  
  const cardBorder = active 
    ? { borderColor: accent, boxShadow: `0 4px 20px -4px ${accent}20` }
    : { borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e7e5e4' };

  const textPrimary = isDark ? 'text-stone-200' : 'text-stone-900';
  const textSecondary = isDark ? 'text-stone-500' : 'text-stone-600';
  const textMuted = isDark ? 'text-stone-400' : 'text-stone-500';
  const borderSubtle = isDark ? 'border-white/5' : 'border-stone-100';
  const imageBg = isDark ? 'bg-black' : 'bg-stone-100';
  const modalBg = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const modalText = isDark ? 'text-white' : 'text-stone-900';
  const specBg = isDark ? 'bg-white/[0.02]' : 'bg-stone-50';
  const specBorder = isDark ? 'border-white/5' : 'border-stone-100';

  return (
    <>
      {/* MAIN CARD */}
      <div
        className={`w-full rounded-xl sm:rounded-2xl border transition-all duration-300 group relative overflow-hidden cursor-pointer ${cardBg}`}
        style={cardBorder}
        onClick={() => setIsOpen(true)} 
      >
        <div className={`relative w-full aspect-[16/9] ${imageBg}`}>
          <img src={images[currentImgIndex]} alt={seoAlt} className="w-full h-full object-cover" />
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-bold tracking-wide">Tap for Details</span>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className={`font-bold leading-tight text-sm sm:text-base ${textPrimary}`}>{car.name}</h3>
              <p className={`text-[11px] sm:text-xs mt-0.5 ${textSecondary}`}>{car.year} • {car.transmission}</p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] sm:text-xs ${textMuted}`}>{isRent ? 'Daily Rate' : 'Asking Price'}</p>
              <p className="text-base sm:text-lg font-bold" style={{ color: accent }}>
                {isRent ? `₦${car.price.toLocaleString()}` : `₦${(car.price / 1000).toFixed(0)}k`}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-4 text-[10px] sm:text-[11px] ${textMuted} border-t ${borderSubtle} pt-3`}>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {car.fuel}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {car.mileage}
            </span>
          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6">
          <div className={`${modalBg} w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl overflow-hidden shadow-2xl border ${borderSubtle} flex flex-col animate-slide-up`}>
            
            {/* HEADER */}
            <div className={`hidden sm:flex justify-between items-center px-6 py-4 border-b shrink-0 ${borderSubtle}`}>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${textSecondary}`}>Car Details</span>
              <button 
                onClick={() => setIsOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* SCROLLABLE CONTENT - Desktop side-by-side layout */}
            <div className={`overflow-y-auto flex-1 ${modalBg} sm:grid sm:grid-cols-2`}>
              
              {/* IMAGE SECTION */}
              <div className="relative">
                <div className={`relative aspect-video sm:aspect-auto sm:h-full group cursor-pointer ${imageBg}`} onClick={() => setIsLightboxOpen(true)}>
                  <img src={images[currentImgIndex]} alt={seoAlt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 backdrop-blur-md rounded-full p-3 text-white border border-white/10">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v-3m3 3h-3" /></svg>
                    </div>
                  </div>
                </div>

                {/* Mobile close button */}
                <button onClick={() => setIsOpen(false)} className="sm:hidden absolute top-4 right-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* DETAILS TEXT */}
              <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
                
                {/* THUMBNAILS */}
                {images.length > 1 && (
                  <div className="sm:border-b sm:pb-5 sm:border-stone-200">
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImgIndex(idx)}
                          className={`aspect-video rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all relative ${idx === currentImgIndex ? `${isDark ? 'border-white' : 'border-stone-900'} scale-105 shadow-lg` : 'border-transparent opacity-60 hover:opacity-100 hover:border-stone-300'}`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt={`${car.name} thumbnail ${idx + 1}`} />
                          {idx === currentImgIndex && <div className="absolute inset-0 bg-white/10" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                  <h2 className={`text-xl sm:text-2xl font-bold ${modalText}`}>{car.name}</h2>
                  <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
                    {isRent ? 'For Rent' : 'For Sale'}
                  </span>
                </div>

                {car.description && (
                  <div>
                    <h4 className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-2 px-1 ${textSecondary}`}>Description</h4>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{car.description}</p>
                  </div>
                )}

                {/* SPECS GRID */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className={`${specBg} p-3 sm:p-4 rounded-xl border ${specBorder} flex flex-col justify-center`}>
                    <span className={`block text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 px-1 ${textSecondary}`}>Price</span>
                    <span className={`text-base sm:text-lg font-bold block ${modalText}`}>
                      {isRent ? `₦${car.price.toLocaleString()}` : `₦${car.price.toLocaleString()}`}
                    </span>
                  </div>
                  <div className={`${specBg} p-3 sm:p-4 rounded-xl border ${specBorder} flex flex-col justify-center`}>
                    <span className={`block text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 px-1 ${textSecondary}`}>Mileage</span>
                    <span className={`text-base sm:text-lg font-bold block ${modalText}`}>{car.mileage}</span>
                  </div>
                  <div className={`${specBg} p-3 sm:p-4 rounded-xl border ${specBorder} flex flex-col justify-center`}>
                    <span className={`block text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 px-1 ${textSecondary}`}>Transmission</span>
                    <span className={`text-base sm:text-lg font-bold block ${modalText}`}>{car.transmission}</span>
                  </div>
                  <div className={`${specBg} p-3 sm:p-4 rounded-xl border ${specBorder} flex flex-col justify-center`}>
                    <span className={`block text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 px-1 ${textSecondary}`}>Fuel</span>
                    <span className={`text-base sm:text-lg font-bold block ${modalText}`}>{car.fuel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className={`p-4 sm:p-6 border-t ${borderSubtle} ${modalBg} shrink-0`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(car);
                  setIsOpen(false);
                }}
                className="w-full py-3 sm:py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg text-black flex items-center justify-center gap-2"
                style={{ background: accent }}
              >
                {isRent ? 'Proceed to Book Dates' : 'Proceed to Book Viewing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
        >
          <button className="absolute top-4 right-4 z-[61] text-white/50 hover:text-white transition-colors p-2">
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img 
            src={images[currentImgIndex]} 
            alt={seoAlt} 
            className="max-h-screen w-full object-contain"
          />
        </div>
      )}
    </>
  );
}