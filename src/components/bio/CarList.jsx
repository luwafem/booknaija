import { useState, useEffect } from 'react';

const SCROLLBAR_HIDE_CSS = `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`;

const colorHexMap = {
  'red': '#ef4444', 'blue': '#3b82f6', 'green': '#22c55e', 
  'black': '#000000', 'white': '#ffffff', 'yellow': '#eab308',
  'pink': '#ec4899', 'purple': '#a855f7', 'orange': '#f97316',
  'brown': '#92400e', 'gray': '#6b7280', 'grey': '#6b7280',
  'gold': '#d4af37', 'silver': '#c0c0c0', 'beige': '#f5f5dc',
  'navy': '#000080', 'coral': '#ff7f50', 'teal': '#14b8a6',
  'cream': '#fffdd0', 'ivory': '#fffff0', 'khaki': '#c3b091',
  'maroon': '#800000', 'olive': '#808000', 'tan': '#d2b48c',
  'turquoise': '#40e0d0', 'burgundy': '#800020', 'multi': 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
  'assorted': 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
  'mixed': 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
  'print': 'repeating-linear-gradient(45deg, #ccc, #ccc 2px, #fff 2px, #fff 4px)',
  'ankara': 'repeating-linear-gradient(45deg, #ef4444, #ef4444 2px, #f59e0b 2px, #f59e0b 4px)',
};

function resolveColor(colorStr, isDark) {
  if (!colorStr) return isDark ? '#333333' : '#cccccc';
  const lower = colorStr.toLowerCase().trim();
  if (lower.startsWith('#') && (lower.length === 4 || lower.length === 7)) return lower;
  if (colorHexMap[lower]) return colorHexMap[lower];
  return isDark ? '#444444' : '#aaaaaa'; 
}

export default function CarList({ cars, selectedCar, onSelect, accent, location, theme }) {
  const isDark = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSortOrder('none');
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsSortOpen(false);
    if (isSortOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSortOpen]);

  let displayedCars = cars;
  if (activeTab === 'rent') displayedCars = displayedCars.filter(c => c.type === 'rent');
  if (activeTab === 'sale') displayedCars = displayedCars.filter(c => c.type === 'sale');

  if (sortOrder === 'asc' || sortOrder === 'desc') {
    displayedCars = [...displayedCars].sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }

  const getSortLabel = () => {
    if (sortOrder === 'asc') return 'Low to High';
    if (sortOrder === 'desc') return 'High to Low';
    return 'Sort by Price';
  };

  const sortOptions = [
    { value: 'none', label: 'Default' },
    { value: 'asc', label: 'Price: Low to High' },
    { value: 'desc', label: 'Price: High to Low' },
  ];

  const dropdownBg = isDark 
    ? 'bg-zinc-900 border-white/10 shadow-2xl shadow-black/50' 
    : 'bg-white border-gray-100 shadow-2xl shadow-black/10';
  const activeOpt = isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900';
  const inactiveOpt = isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900';

  return (
    <div>
      {/* ─── CONTROLS: TABS & SORT ─── */}
      {cars.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          
          {/* Filter Tabs */}
          {['all', 'rent', 'sale'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 rounded-full ${
                activeTab === tab
                  ? 'text-black shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={activeTab === tab ? { backgroundColor: accent } : { color: accent }}
            >
              {tab === 'all' ? 'All Vehicles' : tab === 'rent' ? 'For Rent' : 'For Sale'}
            </button>
          ))}

          {/* Custom Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsSortOpen(!isSortOpen); }}
              className="px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 rounded-full inline-flex items-center gap-2 hover:opacity-80"
              style={{ color: accent }}
            >
              {getSortLabel()}
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div 
              className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl border p-1.5 min-w-[200px] z-50 transition-all duration-200 origin-top ${
                isSortOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 invisible'
              } ${dropdownBg}`}
              onClick={(e) => e.stopPropagation()}
            >
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortOrder(opt.value); setIsSortOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[11px] font-semibold tracking-[0.05em] rounded-lg transition-colors duration-200 ${
                    sortOrder === opt.value ? activeOpt : inactiveOpt
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── CAR GRID ─── */}
      {displayedCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-start">
          {displayedCars.map((car) => (
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
      ) : cars.length > 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: accent + '08', boxShadow: "0 0 0 1px " + accent + '20' }}>
            <svg className="w-6 h-6" style={{ color: accent + '50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className={"text-sm font-medium mb-2 " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
            No vehicles found in this category.
          </p>
          <button 
            onClick={() => { handleTabChange('all'); }} 
            className="text-xs font-semibold tracking-wide px-5 py-2 rounded-full transition-all duration-300 hover:opacity-80"
            style={{ backgroundColor: accent + '15', color: accent }}
          >
            View All Vehicles
          </button>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: accent + '08', boxShadow: "0 0 0 1px " + accent + '20' }}>
            <svg className="w-6 h-6" style={{ color: accent + '50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 2.5L21 17M3 11V9a4 4 0 014-4h.01M21 17v-2.4a4 4 0 00-3.6-3.96M14 6l-2 4h6" /></svg>
          </div>
          <p className={"text-sm font-medium " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>No vehicles available at the moment.</p>
        </div>
      )}
    </div>
  );
}

function CarCard({ car, active, accent, onClick, location, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const isDark = theme === 'dark';
  const images = car.images || [car.image];
  const isRent = car.type === 'rent';

  const seoAlt = location ? car.name + ' in ' + location : car.name;

  return (
    <>
      {/* ─── MAIN CARD ─── */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-full text-left rounded-2xl transition-all duration-500 group relative overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        style={{ 
          backgroundColor: active ? accent + '15' : accent + '08',
          border: active ? '1px solid ' + accent + '30' : '1px solid ' + accent + '15',
        }}
        {...(active ? { boxShadow: "0 0 0 1px " + accent + "30, 0 8px 30px -8px " + accent + "20" } : {})}
      >
        {/* ─── IMAGE ─── */}
        <div className="relative w-full aspect-[16/9] overflow-hidden" style={{ backgroundColor: accent + '08' }}>
          {images.length > 0 ? (
            <img 
              src={images[currentImgIndex]} 
              alt={seoAlt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" 
              loading="lazy"
              decoding="async"
              style={{ imageRendering: 'auto' }}
            />
          ) : (
            <div className={"w-full h-full flex items-center justify-center " + (isDark ? 'text-zinc-800' : 'text-gray-300')}>
              <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 2.5L21 17M3 11V9a4 4 0 014-4h.01M21 17v-2.4a4 4 0 00-3.6-3.96M14 6l-2 4h6" /></svg>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[9px] font-bold tracking-[0.15em] uppercase rounded-full shadow-sm" style={{ color: accent }}>
              {isRent ? 'Rent' : 'Sale'}
            </span>
          </div>

          {active && (
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-10" style={{ backgroundColor: accent }}>
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* ─── CONTENT ─── */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          <h3 className={"text-base font-semibold tracking-tight line-clamp-1 mb-2 " + (isDark ? 'text-white' : 'text-gray-900')}>
            {car.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ backgroundColor: accent + '08', border: '1px solid ' + accent + '15', color: accent }}>
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {car.fuel}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ backgroundColor: accent + '08', border: '1px solid ' + accent + '15', color: accent }}>
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6" /></svg>
              {car.transmission}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ backgroundColor: accent + '08', border: '1px solid ' + accent + '15', color: accent }}>
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {car.mileage}
            </span>
          </div>

          <div className="mt-auto pt-4 flex items-end justify-between" style={{ borderTop: "1px solid " + accent + '15' }}>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider block mb-0.5" style={{ color: accent, opacity: 0.6 }}>
                {isRent ? 'Daily Rate' : 'Price'}
              </span>
              <span className="text-lg font-bold tracking-tight tabular-nums" style={{ color: accent }}>
                {"\u20A6"}{isRent ? car.price.toLocaleString() : (car.price / 1000).toFixed(0) + "k"}
              </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase transition-all duration-300 active:scale-[0.97]"
              style={{
                backgroundColor: active ? accent : 'transparent',
                color: active ? '#0a0a0a' : accent,
                border: active ? '1px solid transparent' : "1px solid " + accent + "40",
              }}
            >
              {active ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Selected
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  View
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── PREMIUM DETAIL MODAL ─── */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center backdrop-blur-md" 
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className={"w-full h-full sm:h-[88vh] sm:max-w-5xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row " + (isDark ? 'bg-zinc-950' : 'bg-white')}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* ─── LEFT: IMAGE GALLERY ─── */}
            <div className="relative h-[40vh] sm:h-full sm:w-[55%] bg-black shrink-0 flex flex-col">
              <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
                <span className="px-3 py-1.5 bg-white/90 text-black text-[9px] font-bold tracking-[0.15em] uppercase rounded-full shadow-lg" style={{ color: accent }}>
                  {isRent ? 'Rent' : 'Sale'}
                </span>
              </div>

              <div 
                className="flex-1 min-h-0 flex items-center justify-center overflow-hidden cursor-zoom-in p-4" 
                onClick={() => setIsLightboxOpen(true)}
              >
                <img 
                  src={images[currentImgIndex]} 
                  alt={seoAlt} 
                  className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105 rounded-lg" 
                  loading="lazy"
                  decoding="async"
                  style={{ imageRendering: 'auto' }}
                />
              </div>

              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button 
                    onClick={() => setCurrentImgIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="shrink-0 h-[60px] sm:h-[70px] flex items-center gap-2 px-4 border-t border-white/10 overflow-x-auto no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all duration-300 opacity-40 hover:opacity-70"
                      style={{ 
                        opacity: idx === currentImgIndex ? '1' : undefined,
                        outline: idx === currentImgIndex ? "2px solid " + accent : "2px solid transparent",
                        outlineOffset: "2px"
                      }}
                    >
                      <img 
                        src={img} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        loading="lazy"
                        decoding="async"
                        style={{ imageRendering: 'auto' }} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── RIGHT: DETAILS ─── */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-l-0 sm:border-l border-t sm:border-t-0" style={{ borderColor: accent + '15' }}>
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                
                <div className="flex items-start justify-between gap-4">
                  <h2 className={"text-2xl sm:text-3xl font-bold tracking-tight leading-tight " + (isDark ? 'text-white' : 'text-black')}>
                    {car.name}
                  </h2>
                </div>

                {car.description && (
                  <p className={"text-sm leading-relaxed " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
                    {car.description}
                  </p>
                )}

                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: isRent ? 'Daily Rate' : 'Price', value: isRent ? "\u20A6" + car.price.toLocaleString() : "\u20A6" + car.price.toLocaleString() },
                      { label: 'Mileage', value: car.mileage },
                      { label: 'Transmission', value: car.transmission },
                      { label: 'Fuel', value: car.fuel },
                      ...(car.year ? [{ label: 'Year', value: car.year }] : []),
                    ].map((spec) => (
                      <div 
                        key={spec.label}
                        className="p-4 rounded-xl border flex flex-col justify-center"
                        style={{ backgroundColor: accent + '08', borderColor: accent + '15' }}
                      >
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: accent, opacity: 0.6 }}>
                          {spec.label}
                        </span>
                        <span className={"text-base sm:text-lg font-bold tabular-nums " + (isDark ? 'text-white' : 'text-gray-900')}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="h-4" />
              </div>

              <div 
                className="shrink-0 p-4 sm:p-6 border-t flex items-center justify-between gap-4"
                style={{ 
                  borderColor: accent + '15',
                  background: isDark 
                    ? 'linear-gradient(to top, #09090b 70%, transparent)' 
                    : 'linear-gradient(to top, #ffffff 70%, transparent)'
                }}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: accent }}>
                    {isRent ? 'Daily Rate' : 'Asking Price'}
                  </div>
                  <div className="text-2xl font-bold tracking-tight tabular-nums" style={{ color: accent }}>
                    {"\u20A6"}{isRent ? car.price.toLocaleString() : (car.price / 1000).toFixed(0) + "k"}
                  </div>
                </div>
                <button
                  onClick={() => { onClick(car); setIsOpen(false); }}
                  className="flex-1 sm:max-w-[240px] py-3.5 rounded-xl text-xs font-bold tracking-[0.12em] uppercase text-black transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: accent }}
                >
                  {isRent ? 'Proceed to Book' : 'Book Viewing'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MINIMAL LIGHTBOX ─── */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black flex flex-col"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="flex items-center justify-between px-5 py-4 relative z-10 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsLightboxOpen(false)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2 text-white/50 text-xs font-medium tabular-nums">
              <span style={{ color: accent }}>{currentImgIndex + 1}</span>
              <span>/</span>
              <span>{images.length}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-0 px-4" onClick={e => e.stopPropagation()}>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all rounded-full z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <button
                  onClick={() => setCurrentImgIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all rounded-full z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </>
            )}
            <div className="max-w-6xl w-full h-full flex items-center justify-center p-4 select-none">
              <img 
                src={images[currentImgIndex]} 
                alt={seoAlt} 
                className="max-w-full max-h-full object-contain rounded-lg" 
                loading="lazy"
                decoding="async"
                draggable="false" 
                style={{ imageRendering: 'auto' }} 
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex-shrink-0 px-4 py-4 flex flex-col items-center gap-3 relative z-10" onClick={e => e.stopPropagation()}>
              <div className="flex gap-2 overflow-x-auto max-w-full px-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={"flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-xl transition-all duration-300 " + (idx === currentImgIndex ? 'opacity-100 scale-105' : 'opacity-30 hover:opacity-60')}
                    style={{ border: idx === currentImgIndex ? "2px solid " + accent : "2px solid transparent" }}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      decoding="async"
                      draggable="false" 
                      style={{ imageRendering: 'auto' }} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          <style>{SCROLLBAR_HIDE_CSS}</style>
        </div>
      )}
    </>
  );
}