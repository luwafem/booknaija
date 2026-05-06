import { useState } from 'react';

export default function FoodList({ food, selectedFood, foodVariants, onSelect, accent, location, theme }) {
  const isDark = theme === 'dark';

  return (
    <section className="px-6 mt-8 max-w-xl mx-auto" aria-label="Food menu">
      <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-6 px-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
        Menu
      </h2>
      {/* Changed grid to 1 column for wider cards */}
      <div className="grid grid-cols-1 gap-4">
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

// --- Inline SVG Components (To ensure no import errors) ---
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
  
  // Modal State
  const [tempQuantity, setTempQuantity] = useState(existingVariant?.quantity || 1);
  const [tempAddons, setTempAddons] = useState(existingVariant?.addons || {});

  // Dynamic Alt Text for Stealth SEO
  const seoAlt = location ? `${item.name} in ${location}` : item.name;

  // Calculate dynamic price in modal
  const calculatePrice = () => {
    let total = item.price;
    Object.values(tempAddons).forEach((selections) => {
      if (Array.isArray(selections)) {
        selections.forEach((opt) => total += (opt.price || 0));
      } else if (selections && selections.price) {
        // Single select
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
        // Multi select (Checkbox behavior)
        if (!current) return { ...prev, [groupId]: [option] };
        
        const exists = current.find((o) => o.name === option.name);
        if (exists) {
          // Remove
          return { ...prev, [groupId]: current.filter((o) => o.name !== option.name) };
        } else {
          // Add
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

  // Theme specific styles
  const cardBg = isDark ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-white hover:bg-stone-50';
  const cardBorder = existingVariant 
    ? 'border-[#e67e22]' 
    : (isDark ? 'border-white/5' : 'border-stone-200');
  const textSecondary = isDark ? 'text-stone-400' : 'text-stone-600';
  const borderSubtle = isDark ? 'bg-white/5' : 'bg-stone-200';
  const iconBorder = isDark ? 'border-white/10' : 'border-stone-200';
  const modalBg = isDark ? 'bg-[#1a1a1a]' : 'bg-white';
  const modalText = isDark ? 'text-white' : 'text-stone-900';
  const modalTextSecondary = isDark ? 'text-stone-300' : 'text-stone-600';

  return (
    <>
      {/* CARD - Prominent Vertical Layout */}
      <div 
        onClick={() => setIsOpen(true)}
        className={`group relative rounded-2xl border ${cardBg} overflow-hidden cursor-pointer transition-all flex flex-col ${cardBorder}`}
      >
        {/* PROMINENT IMAGE: Full Width, Portrait Aspect Ratio */}
        <div className={`relative w-full aspect-[3/4] overflow-hidden ${isDark ? 'bg-black' : 'bg-stone-100'}`}>
          <img 
            src={item.image} 
            alt={seoAlt} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            loading="lazy" 
          />
          
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent h-1/2 flex items-end">
             <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg truncate w-full">
               {item.name}
             </h3>
          </div>

          {/* Quantity Badge */}
          {existingVariant && (
            <div className="absolute top-3 right-3 bg-[#e67e22] text-[11px] font-bold px-3 py-1.5 rounded-full text-black shadow-lg border border-[#e67e22]/30">
              {existingVariant.quantity}
            </div>
          )}
        </div>

        {/* Bottom Content Section */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className={`text-[12px] line-clamp-2 flex-1 mr-4 leading-relaxed ${textSecondary}`}>
              {item.description}
            </p>
            <span className="text-lg font-bold shrink-0" style={{ color: accent }}>
              ₦{item.price.toLocaleString()}
            </span>
          </div>
          
          <div className={`w-full h-px ${borderSubtle} my-1`}></div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span>Tap to customize</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#e67e22]"></div>
            </span>
             <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${iconBorder} ${isDark ? 'text-stone-500 group-hover:bg-white/10 group-hover:text-white' : 'text-stone-500 group-hover:bg-stone-100 group-hover:text-stone-900'}`}>
                <PlusIcon />
             </div>
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)' }}>
          <div className={`${modalBg} w-full max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}>
            
            {/* Header */}
            <div className="relative h-48 shrink-0">
              <img src={item.image} className="w-full h-full object-cover" alt={seoAlt} />
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors">
                <XMarkIcon />
              </button>
              <div className={`absolute bottom-0 left-0 right-0 p-4 to-transparent ${isDark ? 'bg-gradient-to-t from-[#1a1a1a]' : 'bg-gradient-to-t from-white'}`}>
                <h3 className={`text-2xl font-bold ${modalText}`}>{item.name}</h3>
                <p className={`text-sm ${modalTextSecondary}`}>{item.description}</p>
              </div>
            </div>

            {/* Scrollable Options */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
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
                              {isSelected && (
                                <span className="text-black text-xs font-bold">
                                  {group.type === 'single' ? '✓' : '✓'}
                                </span>
                              )}
                            </div>
                            <span className={`text-sm ${isSelected ? `${modalText} font-semibold` : (isDark ? 'text-stone-300' : 'text-stone-700')}`}>
                              {opt.name}
                            </span>
                          </div>
                          {opt.price > 0 && (
                            <span className={`text-sm ${isSelected ? 'text-[#e67e22]' : (isDark ? 'text-stone-500' : 'text-stone-600')}`}>
                              +₦{opt.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Quantity / Total */}
            <div className={`p-5 border-t ${modalBg} z-10 ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
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
                <span className={`text-lg font-bold ${modalText}`}>Total</span>
                <span className="text-2xl font-bold text-[#e67e22]">₦{calculatePrice().toLocaleString()}</span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 rounded-xl font-bold text-lg text-black transition-transform active:scale-95"
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