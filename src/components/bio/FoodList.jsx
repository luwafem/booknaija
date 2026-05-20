import { useState } from 'react';

export default function FoodList({ food, selectedFood, foodVariants, onSelect, accent, location, theme }) {
  const isDark = theme === 'dark';

  return (
    <section className="px-4 sm:px-6 mt-8" aria-label="Food menu">
      <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-6 px-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
        Menu
      </h2>
      {/* Responsive: 1 col mobile, 2 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
    </section>
  );
}

const XMarkIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

function FoodCard({ item, accent, existingVariant, onAdd, location, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';
  
  const [tempQuantity, setTempQuantity] = useState(existingVariant?.quantity || 1);
  const [tempAddons, setTempAddons] = useState(existingVariant?.addons || {});

  const seoAlt = location ? `${item.name} in ${location}` : item.name;

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

  const cardBg = isDark ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-white hover:bg-stone-50';
  const cardBorder = existingVariant ? 'border-[#e67e22]' : (isDark ? 'border-white/5' : 'border-stone-200');
  const textSecondary = isDark ? 'text-stone-400' : 'text-stone-600';
  const borderSubtle = isDark ? 'bg-white/5' : 'bg-stone-200';
  const iconBorder = isDark ? 'border-white/10' : 'border-stone-200';
  const modalBg = isDark ? 'bg-[#1a1a1a]' : 'bg-white';
  const modalText = isDark ? 'text-white' : 'text-stone-900';
  const modalTextSecondary = isDark ? 'text-stone-300' : 'text-stone-600';

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className={`group relative rounded-2xl border ${cardBg} overflow-hidden cursor-pointer transition-all flex flex-col ${cardBorder}`}
      >
        <div className={`relative w-full aspect-[4/3] sm:aspect-[3/4] overflow-hidden ${isDark ? 'bg-black' : 'bg-stone-100'}`}>
          <img 
            src={item.image} 
            alt={seoAlt} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            loading="lazy" 
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 to-transparent h-1/2 flex items-end">
             <h3 className="text-white font-bold text-sm sm:text-lg leading-tight drop-shadow-lg truncate w-full">
               {item.name}
             </h3>
          </div>
          {existingVariant && (
            <div className="absolute top-3 right-3 bg-[#e67e22] text-[11px] font-bold px-3 py-1.5 rounded-full text-black shadow-lg border border-[#e67e22]/30">
              {existingVariant.quantity}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
          <div className="flex justify-between items-center">
            <p className={`text-[11px] sm:text-[12px] line-clamp-2 flex-1 mr-3 leading-relaxed ${textSecondary}`}>
              {item.description}
            </p>
            <span className="text-sm sm:text-lg font-bold shrink-0" style={{ color: accent }}>
              ₦{item.price.toLocaleString()}
            </span>
          </div>
          
          <div className={`w-full h-px ${borderSubtle}`}></div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span>Tap to customize</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#e67e22]"></div>
            </span>
             <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-colors ${iconBorder} ${isDark ? 'text-stone-500 group-hover:bg-white/10 group-hover:text-white' : 'text-stone-500 group-hover:bg-stone-100 group-hover:text-stone-900'}`}>
                <PlusIcon />
             </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)' }}>
          <div className={`${modalBg} w-full max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}>
            
            <div className="relative h-36 sm:h-48 shrink-0">
              <img src={item.image} className="w-full h-full object-cover" alt={seoAlt} />
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors">
                <XMarkIcon />
              </button>
              <div className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'bg-gradient-to-t from-[#1a1a1a]' : 'bg-gradient-to-t from-white'}`}>
                <h3 className={`text-xl sm:text-2xl font-bold ${modalText}`}>{item.name}</h3>
                <p className={`text-xs sm:text-sm ${modalTextSecondary}`}>{item.description}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 sm:space-y-6">
              {item.addons?.map((group) => (
                <div key={group.id}>
                  <p className={`text-sm font-bold mb-3 uppercase tracking-wide ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
                    {group.label}
                    {group.type === 'single' ? <span className="text-[10px] text-stone-500 ml-2 normal-case">(Select 1)</span> : <span className="text-[10px] text-stone-500 ml-2 normal-case">(Select multiple)</span>}
                  </p>
                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isSelected = group.type === 'single'
                        ? tempAddons[group.id]?.name === opt.name
                        : tempAddons[group.id]?.some((o) => o.name === opt.name);

                      return (
                        <div
                          key={opt.name}
                          onClick={() => handleAddonChange(group.id, opt, group.type)}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all
                            ${isSelected ? 'bg-[#e67e22]/10 border-[#e67e22]' : (isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-stone-50 border-stone-200 hover:bg-stone-100')}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                              ${isSelected ? 'bg-[#e67e22] border-[#e67e22]' : (isDark ? 'border-stone-600' : 'border-stone-300')}
                            `}>
                              {isSelected && <span className="text-black text-xs font-bold">✓</span>}
                            </div>
                            <span className={`text-sm ${isSelected ? `${modalText} font-semibold` : (isDark ? 'text-stone-300' : 'text-stone-700')}`}>
                              {opt.name}
                            </span>
                          </div>
                          {opt.price > 0 && (
                            <span className={`text-sm ${isSelected ? 'text-[#e67e22]' : (isDark ? 'text-stone-500' : 'text-stone-600')}`}>
                              +₦{opt.price.toLocaleString()}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Quantity / Total */}
            <div className={`p-4 sm:p-5 border-t ${modalBg} z-10 ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>Quantity</span>
                <div className={`flex items-center gap-4 rounded-lg p-1 ${isDark ? 'bg-white/5' : 'bg-stone-100'}`}>
                  <button onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))} className={`w-8 h-8 flex items-center justify-center ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}>
                    <MinusIcon />
                  </button>
                  <span className={`w-6 text-center font-bold ${modalText}`}>{tempQuantity}</span>
                  <button onClick={() => setTempQuantity(tempQuantity + 1)} className={`w-8 h-8 flex items-center justify-center ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}>
                    <PlusIcon />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`text-base sm:text-lg font-bold ${modalText}`}>Total</span>
                <span className="text-xl sm:text-2xl font-bold text-[#e67e22]">₦{calculatePrice().toLocaleString()}</span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-black transition-transform active:scale-95"
                style={{ backgroundColor: accent }}
              >
                Add to Order - ₦{calculatePrice().toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}