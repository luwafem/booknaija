import { useState } from 'react';

export default function CarList({ cars, selectedCar, onSelect, accent }) {
  // Separate Rentals and Sales
  const rentals = cars.filter(c => c.type === 'rent');
  const sales = cars.filter(c => c.type === 'sale');

  return (
    <section className="px-6 mt-8 max-w-xl mx-auto">
      
      {/* --- RENTALS SECTION --- */}
      {rentals.length > 0 && (
        <>
          <h2 className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-4 px-1">
            Available for Rent
          </h2>
          <div className="space-y-4 mb-8">
            {rentals.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                active={selectedCar?.id === car.id}
                accent={accent}
                onClick={() => onSelect(car)}
              />
            ))}
          </div>
        </>
      )}

      {/* --- SALES SECTION --- */}
      {sales.length > 0 && (
        <>
          <h2 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.2em] mb-4 px-1">
            Cars for Sale
          </h2>
          <div className="space-y-4">
            {sales.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                active={selectedCar?.id === car.id}
                accent={accent}
                onClick={() => onSelect(car)}
              />
            ))}
          </div>
        </>
      )}

      {cars.length === 0 && (
        <div className="text-center py-8 text-stone-500 text-sm">
          No cars available at the moment.
        </div>
      )}
    </section>
  );
}

function CarCard({ car, active, accent, onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); // For Fullscreen Image
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const images = car.images || [car.image];
  const isRent = car.type === 'rent';
  const badgeColor = isRent 
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  const activeClasses = active 
    ? `bg-white/5 border-[${accent}] shadow-[0_0_0_1px_${accent}40]` 
    : 'border-white/5 hover:bg-white/[0.04]';

  return (
    <>
      {/* --- MAIN CARD --- */}
      <div
        className={`w-full rounded-2xl border transition-all duration-300 group relative overflow-hidden cursor-pointer bg-white/[0.02] ${activeClasses}`}
        style={active ? { borderColor: accent, boxShadow: `0 4px 20px -4px ${accent}20` } : {}}
        onClick={() => setIsOpen(true)} 
      >
        <div className="relative w-full aspect-[16/9] bg-black">
          <img 
            src={images[currentImgIndex]} 
            alt={car.name} 
            className="w-full h-full object-cover" 
          />
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wide">Tap for Details</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold leading-tight text-stone-200">{car.name}</h3>
              <p className="text-xs text-stone-500 mt-0.5">{car.year} • {car.transmission}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400">{isRent ? 'Daily Rate' : 'Asking Price'}</p>
              <p className="text-lg font-bold" style={{ color: accent }}>
                {isRent ? `₦${car.price.toLocaleString()}` : `₦${(car.price / 1000).toFixed(0)}k`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400 border-t border-white/5 pt-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {car.fuel}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {car.mileage}
            </span>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL (IMPROVED LAYOUT) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6">
          <div className="bg-[#0a0a0a] w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col animate-slide-up">
            
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.04] shrink-0">
              <span className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold">Car Details</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="overflow-y-auto flex-1 bg-[#0a0a0a]">
              
              {/* IMAGE SECTION (Full Width) */}
              <div className="relative aspect-video bg-black group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                <img 
                  src={images[currentImgIndex]} 
                  alt={car.name} 
                  className="w-full h-full object-cover"
                />
                {/* Expand Hint */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 backdrop-blur-md rounded-full p-3 text-white border border-white/10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v-3m3 3h-3" /></svg>
                  </div>
                </div>
              </div>

              {/* THUMBNAILS */}
              {images.length > 1 && (
                <div className="px-6 pb-6 border-b border-white/[0.04]">
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImgIndex(idx)}
                        className={`aspect-video rounded-xl overflow-hidden border-2 transition-all relative ${idx === currentImgIndex ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/30'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="thumb" />
                        {idx === currentImgIndex && <div className="absolute inset-0 bg-white/10" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DETAILS TEXT */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                  <h2 className="text-2xl font-bold text-white">{car.name}</h2>
                  <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
                    {isRent ? 'For Rent' : 'For Sale'}
                  </span>
                </div>

                {car.description && (
                  <div>
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.15em] mb-2 px-1">Description</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">{car.description}</p>
                  </div>
                )}

                {/* SPECS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Price</span>
                    <span className="text-lg font-bold text-white block">
                      {isRent ? `₦${car.price.toLocaleString()}` : `₦${car.price.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Mileage</span>
                    <span className="text-lg font-bold text-white block">{car.mileage}</span>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Transmission</span>
                    <span className="text-lg font-bold text-white block">{car.transmission}</span>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Fuel</span>
                    <span className="text-lg font-bold text-white block">{car.fuel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 sm:p-6 border-t border-white/[0.04] bg-[#0a0a0a] shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(car);
                  setIsOpen(false);
                }}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg text-black flex items-center justify-center gap-2"
                style={{ background: accent }}
              >
                {isRent ? 'Proceed to Book Dates' : 'Proceed to Book Viewing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN LIGHTBOX (IMAGE VIEWER) --- */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
        >
          <button className="absolute top-4 right-4 z-[61] text-white/50 hover:text-white transition-colors p-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img 
            src={images[currentImgIndex]} 
            alt={car.name} 
            className="max-h-screen w-full object-contain"
          />
        </div>
      )}
    </>
  );
}