import { useState } from 'react';

export default function ServiceList({ services, selectedId, onSelect, accent, location, theme }) {
  const isDark = theme === 'dark';
  const textColor = '#78716c';
  const textColorDark = '#d6d3d1';

  return (
    <section className="px-4 sm:px-6 lg:px-10 xl:px-12 mt-4 sm:mt-6 lg:mt-8 xl:mt-10" aria-label="Services">
      <h2 
        className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-6 lg:mb-8 xl:mb-10 px-1"
        style={{ color: isDark ? textColorDark : textColor }}
      >
        Services
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 items-start">
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
  const textColor = '#78716c';
  const textColorDark = '#d6d3d1';
  
  const canShowDetails = service.showDetails !== false && (service.description || (service.images && service.images.length > 0));
  const seoAlt = location ? service.name + ' in ' + location : service.name;

  const hasDiscount = service.discount_enabled && service.discount_price > 0;
  const originalPrice = service.price;
  const discountPrice = hasDiscount ? service.discount_price : originalPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  const cardBg = isDark 
    ? (active ? 'bg-white/5' : 'bg-white/[0.02] hover:bg-white/[0.04]') 
    : (active ? 'bg-stone-50' : 'bg-white hover:bg-stone-50');
  
  const borderColor = active ? accent + '60' : (isDark ? 'rgba(255,255,255,0.05)' : '#e7e5e4');
  const boxShadow = active ? '0 0 0 1px ' + accent + '30, 0 4px 20px -4px ' + accent + '15' : 'none';

  const textPrimary = isDark ? 'text-white' : 'text-stone-900';
  const textSecondary = isDark ? textColorDark : textColor;
  const textMuted = isDark ? textColorDark : textColor;
  const imageBg = isDark ? 'bg-black border-white/5' : 'bg-stone-100 border-stone-200';

  return (
    <div
      onClick={onClick}
      className={'w-full text-left rounded-2xl border transition-all duration-300 group relative overflow-hidden cursor-pointer ' + cardBg}
      style={{ borderColor: borderColor, boxShadow: boxShadow }}
    >
      {active && (
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ backgroundColor: accent }} />
      )}

      <div className="flex flex-col">
        
        {service.image ? (
          <div className={'w-full h-40 sm:h-48 lg:h-52 xl:h-56 flex-shrink-0 rounded-t-2xl overflow-hidden ' + imageBg}>
            <img src={service.image} alt={seoAlt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
          </div>
        ) : (
          <div className={'w-full h-40 sm:h-48 lg:h-52 xl:h-56 flex-shrink-0 rounded-t-2xl flex items-center justify-center ' + imageBg} />
        )}

        <div className="flex-1 p-4 sm:p-5 lg:p-6 xl:p-7 flex flex-col justify-center min-w-0">
          <div className="flex items-center justify-between mb-1 xl:mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <p className={'text-sm xl:text-base font-semibold truncate transition-colors ' + textPrimary}>{service.name}</p>
              {hasDiscount && (
                <span className={'text-[9px] xl:text-[10px] font-bold px-1.5 xl:px-2 py-0.5 xl:py-1 rounded border shrink-0 ' + (isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200')}>
                  -{discountPercentage}%
                </span>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="flex items-center gap-1.5">
                <p className="text-sm xl:text-base font-bold tabular-nums" style={{ color: accent }}>{discountPrice.toLocaleString()}</p>
                {hasDiscount && (
                  <p className={'text-[10px] xl:text-xs line-through tabular-nums ' + (isDark ? 'text-stone-600' : 'text-stone-400')}>{originalPrice}</p>
                )}
              </div>
            </div>
          </div>
          <p className={'text-xs xl:text-sm ' + textSecondary}>{service.duration}</p>

          {canShowDetails && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDetails(!openDetails); }}
              className={'mt-3 text-[11px] xl:text-sm font-medium transition-colors flex items-center gap-2 group/btn ' + textMuted + ' hover:text-stone-900'}
              aria-expanded={openDetails}
            >
              <span className={'w-4 h-4 xl:w-5 xl:h-5 rounded border flex items-center justify-center text-[10px] xl:text-xs transition-colors ' + (isDark ? 'border-stone-700 text-stone-400 group-hover/btn:border-stone-500 group-hover/btn:text-white' : 'border-stone-300 text-stone-500 group-hover/btn:border-stone-400 group-hover/btn:text-stone-900')}>
                {openDetails ? '-' : '+'}
              </span>
              {openDetails ? 'Hide details' : 'View details'}
            </button>
          )}

          {openDetails && canShowDetails && (
            <div className={'mt-4 pt-4 border-t animate-fade-in space-y-3 ' + (isDark ? 'border-white/5' : 'border-stone-100')}>
              {service.description && (
                <p className={'text-xs xl:text-sm leading-relaxed ' + (isDark ? textColorDark : textColor)}>{service.description}</p>
              )}
              
              {service.images && service.images.length > 0 && (
                <div>
                  <p className={'text-[10px] xl:text-xs font-bold uppercase tracking-widest mb-2 ' + (isDark ? textColorDark : textColor)}>
                    {service.images.length} Pictures
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {service.images.map((img, index) => (
                      <div key={index} className={'aspect-square rounded-xl overflow-hidden ' + imageBg}>
                        <img src={img} alt={seoAlt + ' - Image ' + (index + 1)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
