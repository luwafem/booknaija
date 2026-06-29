import { useState } from 'react';

export default function FoodList({ food, selectedFood, foodVariants, onSelect, accent, location, theme }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-start">
      {food.map((item) => (
        <FoodCard
          key={item.id}
          item={item}
          active={selectedFood.includes(item.id)}
          accent={accent}
          existingVariant={foodVariants[item.id] || null}
          onAdd={(variant) => onSelect(item.id, variant)}
          location={location}
          theme={theme}
        />
      ))}
    </div>
  );
}

function FoodCard({ item, active, accent, existingVariant, onAdd, location, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';
  
  const [tempQuantity, setTempQuantity] = useState(existingVariant?.quantity || 1);
  const [tempAddons, setTempAddons] = useState(existingVariant?.addons || {});

  const seoAlt = location ? item.name + ' in ' + location : item.name;

  const calculatePrice = () => {
    let total = item.price;
    Object.values(tempAddons).forEach((selections) => {
      if (Array.isArray(selections)) {
        selections.forEach((opt) => total += (opt.price || 0));
      } else if (selections && selections.price) {
        total += selections.price;
      }
    });
    return total * tempQuantity;
  };

  const handleAddonChange = (groupId, option, type) => {
    setTempAddons((prev) => {
      const current = prev[groupId];
      if (type === 'single') {
        return { ...prev, [groupId]: option };
      } else {
        if (!current) return { ...prev, [groupId]: [option] };
        const exists = current.find((o) => o.name === option.name);
        if (exists) {
          return { ...prev, [groupId]: current.filter((o) => o.name !== option.name) };
        } else {
          return { ...prev, [groupId]: [...current, option] };
        }
      }
    });
  };

  const handleSubmit = () => {
    onAdd({
      quantity: tempQuantity,
      addons: tempAddons,
      finalPrice: calculatePrice()
    });
    setIsOpen(false);
  };

  return (
    <>
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
        <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ backgroundColor: accent + '08' }}>
          <img 
            src={item.image} 
            alt={seoAlt} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" 
            loading="lazy"
            decoding="async"
            style={{ imageRendering: 'auto' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

          {active && (
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-10" style={{ backgroundColor: accent }}>
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {existingVariant && !active && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md border" style={{ backgroundColor: accent + '90', color: '#0a0a0a', borderColor: accent }}>
              {existingVariant.quantity}x
            </div>
          )}
        </div>

        {/* ─── CONTENT ─── */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          <h3 className={"text-base font-semibold tracking-tight line-clamp-2 mb-2 " + (isDark ? 'text-white' : 'text-gray-900')}>
            {item.name}
          </h3>

          {item.description && (
            <p className={"text-sm leading-relaxed line-clamp-2 mb-4 " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
              {item.description}
            </p>
          )}

          <div className="mt-auto pt-4 flex items-end justify-between" style={{ borderTop: "1px solid " + accent + '15' }}>
            <span className="text-lg font-bold tracking-tight tabular-nums" style={{ color: accent }}>
              {"\u20A6"}{item.price.toLocaleString()}
            </span>

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
                  Added
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Customize
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── PREMIUM CUSTOMIZE MODAL ─── */}
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
            
            {/* ─── LEFT: IMAGE ─── */}
            <div className="relative h-[35vh] sm:h-full sm:w-[45%] bg-black shrink-0 flex flex-col">
              <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-6 sm:p-8">
                <img 
                  src={item.image} 
                  alt={seoAlt} 
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105" 
                  loading="lazy"
                  decoding="async"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>

            {/* ─── RIGHT: DETAILS & ADDONS ─── */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-l-0 sm:border-l border-t sm:border-t-0" style={{ borderColor: accent + '15' }}>
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                
                <div>
                  <h2 className={"text-2xl sm:text-3xl font-bold tracking-tight leading-tight " + (isDark ? 'text-white' : 'text-black')}>
                    {item.name}
                  </h2>
                  {item.description && (
                    <p className={"text-sm leading-relaxed mt-2 " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg self-start" style={{ backgroundColor: accent + '08' }}>
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: accent, opacity: 0.6 }}>Starts at</span>
                  <span className="text-base font-bold tabular-nums" style={{ color: accent }}>{"\u20A6"}{item.price.toLocaleString()}</span>
                </div>

                {/* Addon Groups */}
                {item.addons && item.addons.map((group) => (
                  <div key={group.id} className="pt-2">
                    <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: "1px solid " + accent + '15' }}>
                      <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: accent }}>
                        {group.label}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded tracking-wide font-medium" style={{ 
                        backgroundColor: group.type === 'single' ? (accent + '15') : accent + '08',
                        color: group.type === 'single' ? accent : (isDark ? '#71717a' : '#a1a1aa')
                      }}>
                        {group.type === 'single' ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {group.options.map((opt) => {
                        const isSelected = group.type === 'single'
                          ? tempAddons[group.id]?.name === opt.name
                          : tempAddons[group.id]?.some((o) => o.name === opt.name);

                        return (
                          <div
                            key={opt.name}
                            onClick={() => handleAddonChange(group.id, opt, group.type)}
                            className="flex justify-between items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200"
                            style={{ 
                              backgroundColor: isSelected ? accent + '15' : accent + '08',
                              borderColor: isSelected ? 'transparent' : accent + '15',
                              boxShadow: isSelected ? "inset 0 0 0 1px " + accent + "30" : 'none',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                                style={{ 
                                  backgroundColor: isSelected ? accent : 'transparent',
                                  border: isSelected ? "1px solid " + accent : "1px solid " + accent + '15',
                                }}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                )}
                              </div>
                              <span 
                                className="text-sm font-medium" 
                                style={{ color: isSelected ? (isDark ? '#ffffff' : '#111827') : accent }}
                              >
                                {opt.name}
                              </span>
                            </div>
                            {opt.price > 0 && (
                              <span className={"text-sm tabular-nums " + (isSelected ? 'font-semibold' : '')} style={{ color: isSelected ? accent : (isDark ? '#71717a' : '#9ca3af') }}>
                                +{"\u20A6"}{opt.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                <div className="h-4" />
              </div>

              {/* Sticky Checkout Footer */}
              <div 
                className="shrink-0 p-4 sm:p-6 border-t flex flex-col gap-4"
                style={{ 
                  borderColor: accent + '15',
                  background: isDark 
                    ? 'linear-gradient(to top, #09090b 70%, transparent)' 
                    : 'linear-gradient(to top, #ffffff 70%, transparent)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-xl px-1 py-1" style={{ backgroundColor: accent + '08' }}>
                    <button 
                      onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))} 
                      className="w-8 h-8 flex items-center justify-center transition-colors rounded-lg"
                      style={{ color: accent }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                    </button>
                    <span className={"w-6 text-center font-bold tabular-nums " + (isDark ? 'text-white' : 'text-black')}>{tempQuantity}</span>
                    <button 
                      onClick={() => setTempQuantity(tempQuantity + 1)} 
                      className="w-8 h-8 flex items-center justify-center transition-colors rounded-lg"
                      style={{ color: accent }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: accent }}>Total</div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums" style={{ color: accent }}>
                      {"\u20A6"}{calculatePrice().toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full py-3.5 sm:py-4 rounded-xl text-xs font-bold tracking-[0.12em] uppercase text-black transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: accent }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}