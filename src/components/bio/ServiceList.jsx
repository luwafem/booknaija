import { useState } from 'react';

export default function ServiceList({ services, selectedId, onSelect, accent, location, theme }) {
  const isDark = theme === 'dark';

  return (
    <section className="px-6 mt-8 max-w-xl mx-auto" aria-label="Services">
      <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-6 px-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
        Services
      </h2>
      <div className="space-y-3">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            active={selectedId === s.id}
            accent={accent}
            onClick={() => onSelect(s.id)}
            location={location}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ service, active, accent, onClick, location, theme }) {
  const [openDetails, setOpenDetails] = useState(false);
  const isDark = theme === 'dark';
  
  const canShowDetails = service.showDetails !== false && (service.description || (service.images && service.images.length > 0));

  // Dynamic Alt Text for Stealth SEO
  const seoAlt = location ? `${service.name} in ${location}` : service.name;

  // NEW: Discount calculation
  const hasDiscount = service.discount_enabled && service.discount_price > 0;
  const originalPrice = service.price;
  const discountPrice = hasDiscount ? service.discount_price : originalPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  // Theme aware classes
  const cardBg = isDark 
    ? (active ? 'bg-white/5' : 'bg-white/[0.02] hover:bg-white/[0.04]') 
    : (active ? 'bg-stone-50' : 'bg-white hover:bg-stone-50');
  
  const cardBorder = active 
    ? { borderColor: `${accent}60`, boxShadow: `0 0 0 1px ${accent}30, 0 4px 20px -4px ${accent}15` }
    : { borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e7e5e4' }; // stone-200

  const textPrimary = isDark ? 'text-white' : 'text-stone-900';
  const textSecondary = isDark ? 'text-stone-400' : 'text-stone-500';
  const textMuted = isDark ? 'text-stone-500' : 'text-stone-600';
  const imageBg = isDark ? 'bg-black border-white/5' : 'bg-stone-100 border-stone-200';

  return (
    <div
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden cursor-pointer ${cardBg}`}
      style={cardBorder}
    >
      {/* Active Side Indicator Line */}
      {active && (
        <div 
          className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
          style={{ backgroundColor: accent }}
        />
      )}

      {/* Main Card Content */}
      <div className="flex items-center gap-4">
        {service.image ? (
          <div className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm ${imageBg}`}>
            <img 
              src={service.image} 
              alt={seoAlt} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center ${imageBg}`}>
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold truncate transition-colors ${textPrimary}`}>
                {service.name}
              </p>
              {/* Discount Badge */}
              {hasDiscount && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  isDark 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  -{discountPercentage}%
                </span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              {/* Price Display with Discount */}
              <div className="flex items-center gap-1.5">
                <p className={`text-sm font-bold tabular-nums transition-colors ${active ? '' : ''}`} style={{ color: accent }}>
                  ₦{discountPrice.toLocaleString()}
                </p>
                {hasDiscount && (
                  <p className={`text-[10px] line-through tabular-nums ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                    ₦{originalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          <p className={`text-xs ${textSecondary}`}>{service.duration}</p>
        </div>
      </div>

      {/* Details Toggle Button */}
      {canShowDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDetails(!openDetails);
          }}
          className={`mt-3 text-[11px] font-medium transition-colors flex items-center gap-2 group/btn ${textMuted} hover:text-stone-900`}
          aria-expanded={openDetails}
        >
          <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
            isDark 
              ? 'border-stone-700 text-stone-400 group-hover/btn:border-stone-500 group-hover/btn:text-white' 
              : 'border-stone-300 text-stone-500 group-hover/btn:border-stone-400 group-hover/btn:text-stone-900'
          }`}>
            {openDetails ? '−' : '+'}
          </span>
          {openDetails ? 'Hide details' : 'View details'}
        </button>
      )}

      {/* Expandable Details & Gallery Section */}
      {openDetails && canShowDetails && (
        <div className={`mt-4 pt-4 border-t animate-fade-in space-y-4 ${isDark ? 'border-white/5' : 'border-stone-100'}`}>
          {service.description && (
            <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {service.description}
            </p>
          )}
          
          {service.images && service.images.length > 0 && (
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                {service.images.length} Pictures
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {service.images.map((img, index) => (
                  <div key={index} className={`aspect-square rounded-xl overflow-hidden ${imageBg}`}>
                    <img 
                      src={img} 
                      alt={`${seoAlt} - Image ${index + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}