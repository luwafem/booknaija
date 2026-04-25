import { useState } from 'react';

export default function PropertyList({ properties, selectedProperty, onSelect, accent }) {
  // Separate Rentals and Sales
  const rentals = properties.filter(p => p.type === 'rent');
  const sales = properties.filter(p => p.type === 'sale');

  return (
    <section className="px-6 mt-8 max-w-xl mx-auto">
      
      {/* --- RENTALS SECTION --- */}
      {rentals.length > 0 && (
        <>
          <h2 className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-4 px-1">
            Properties for Rent
          </h2>
          <div className="space-y-4 mb-8">
            {rentals.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                active={selectedProperty?.id === property.id}
                accent={accent}
                onClick={() => onSelect(property)}
              />
            ))}
          </div>
        </>
      )}

      {/* --- SALES SECTION --- */}
      {sales.length > 0 && (
        <>
          <h2 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.2em] mb-4 px-1">
            Properties for Sale
          </h2>
          <div className="space-y-4">
            {sales.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                active={selectedProperty?.id === property.id}
                accent={accent}
                onClick={() => onSelect(property)}
              />
            ))}
          </div>
        </>
      )}

      {properties.length === 0 && (
        <div className="text-center py-8 text-stone-500 text-sm">
          No properties available at the moment.
        </div>
      )}
    </section>
  );
}

function PropertyCard({ property, active, accent, onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); 
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const images = property.images || [property.image];
  const isRent = property.type === 'rent';
  
  // Badge Colors
  const badgeColor = isRent 
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  // Card Styling
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
        {/* Image Preview (Using 4:3 Aspect Ratio for Property) */}
        <div className="relative w-full aspect-[4/3] bg-black">
          <img 
            src={images[currentImgIndex]} 
            alt={property.name} 
            className="w-full h-full object-cover" 
          />
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wide">Tap for Details</span>
          </div>
        </div>

        {/* Summary Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold leading-tight text-stone-200">{property.name}</h3>
              <p className="text-xs text-stone-500 mt-0.5">{property.location}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400">{isRent ? 'Monthly Rate' : 'Asking Price'}</p>
              <p className="text-lg font-bold" style={{ color: accent }}>
                {isRent 
                  ? `₦${property.price.toLocaleString()}` 
                  : `₦${(property.price / 1000).toFixed(0)}k`
                }
              </p>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="flex items-center gap-4 text-[11px] text-stone-400 border-t border-white/5 pt-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001 1h-3m-6 0a1 1 0 00-1 1v2a1 1 0 001 1h3m-6 0a1 1 0 01-1-1v-2a1 1 0 001-1h3" /></svg>
              {property.beds}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 0v4m0 0h4M12 8V4m0 0h4M4 0v4m0 0h4" /></svg>
              {property.area}
            </span>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL (SAME LAYOUT AS CARS) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6">
          <div className="bg-[#0a0a0a] w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/5 max-h-[90vh] flex flex-col animate-slide-up">
            
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.04] bg-[#0a0a0a] shrink-0">
              <span className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold">Property Details</span>
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
                  alt={property.name} 
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
                        className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${idx === currentImgIndex ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/30'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="thumb" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DETAILS TEXT */}
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-white">{property.name}</h2>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
                    {isRent ? 'For Rent' : 'For Sale'}
                  </span>
                  <span className="text-stone-400 text-sm">{property.location}</span>
                </div>

                {/* Description */}
                {property.description && (
                  <div>
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.15em] mb-2 px-1">Description</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">{property.description}</p>
                  </div>
                )}

                {/* SPECS GRID (Adapted for Property) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Price</span>
                    <span className="text-lg font-bold text-white block">
                      {isRent 
                        ? `₦${property.price.toLocaleString()} / mo` 
                        : `₦${property.price.toLocaleString()}`
                      }
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Bedrooms</span>
                    <span className="text-lg font-bold text-white block">{property.beds}</span>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Baths</span>
                    <span className="text-lg font-bold text-white block">{property.baths}</span>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="block text-[10px] text-stone-500 uppercase tracking-[0.15em] font-semibold mb-1 px-1">Area</span>
                    <span className="text-lg font-bold text-white block">{property.area}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 sm:p-6 border-t border-white/[0.04] bg-[#0a0a0a] shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(property);
                  setIsOpen(false);
                }}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg text-black flex items-center justify-center gap-2"
                style={{ background: accent }}
              >
                {isRent ? 'Proceed to Book Rental' : 'Proceed to Book Viewing'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- FULLSCREEN LIGHTBOX --- */}
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
            alt={property.name} 
            className="max-h-screen w-full object-contain"
          />
        </div>
      )}
    </>
  );
}