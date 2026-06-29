import { useState } from 'react';

export default function ServiceList({ services, selectedId, onSelect, accent, location, theme }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-5 xl:gap-6 items-start">
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
  );
}

function ServiceCard({ service, active, accent, onClick, location, theme }) {
  const [openDetails, setOpenDetails] = useState(false);
  const isDark = theme === 'dark';
  
  const canShowDetails = service.showDetails !== false && (service.description || (service.images && service.images.length > 0));
  const seoAlt = location ? service.name + ' in ' + location : service.name;

  const hasDiscount = service.discount_enabled && service.discount_price > 0;
  const originalPrice = service.price;
  const discountPrice = hasDiscount ? service.discount_price : originalPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden transition-all duration-500 group relative cursor-pointer flex flex-col hover:shadow-2xl hover:-translate-y-1"
      style={{ 
        backgroundColor: active ? accent + '15' : accent + '08',
        border: active ? '1px solid ' + accent + '30' : '1px solid ' + accent + '15',
        ...(active ? { boxShadow: "0 0 0 1px " + accent + "30, 0 8px 30px -8px " + accent + "20" } : {}),
      }}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 z-10" style={{ backgroundColor: accent }} />
      )}

      {service.image ? (
        <div className="relative w-full aspect-[4/3] flex-shrink-0 overflow-hidden">
          <img 
            src={service.image} 
            alt={seoAlt} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" 
            loading="lazy"
            decoding="async"
            style={{ imageRendering: 'auto' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
          
          {hasDiscount && (
            <div className="absolute top-4 left-4">
              <span 
                className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[9px] font-bold tracking-[0.1em] uppercase rounded-full shadow-sm"
                style={{ color: '#dc2626' }}
              >
                -{discountPercentage}%
              </span>
            </div>
          )}

          {active && (
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: accent }}>
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="w-full aspect-[4/3] flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: accent + '08' }}
        >
          <svg className={"w-12 h-12 opacity-15 " + (isDark ? 'text-zinc-400' : 'text-gray-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </div>
      )}

      <div className="flex-1 p-5 sm:p-6 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className={"text-base font-semibold tracking-tight line-clamp-2 " + (isDark ? 'text-white' : 'text-gray-900')}>
            {service.name}
          </h3>
        </div>

        {service.duration && (
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-3.5 h-3.5 opacity-50" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={"text-xs font-medium " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
              {service.duration}
            </span>
          </div>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between" style={{ borderTop: "1px solid " + accent + '15' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight tabular-nums" style={{ color: accent }}>
                ₦{discountPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className={"text-xs line-through tabular-nums " + (isDark ? 'text-zinc-600' : 'text-gray-400')}>
                  ₦{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {canShowDetails && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDetails(!openDetails); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] uppercase rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: accent + '10', 
                color: accent,
                border: "1px solid " + accent + '20'
              }}
              aria-expanded={openDetails}
            >
              {openDetails ? 'Less' : 'Details'}
              <svg 
                className={"w-3 h-3 transition-transform duration-300 " + (openDetails ? 'rotate-180' : '')} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {openDetails && canShowDetails && (
          <div className="mt-5 pt-5 space-y-5" style={{ borderTop: "1px solid " + accent + '15' }}>
            {service.description && (
              <p className={"text-sm leading-relaxed " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
                {service.description}
              </p>
            )}
            
            {service.images && service.images.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>
                  {service.images.length} Photos
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {service.images.map((img, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-xl overflow-hidden"
                      style={{ boxShadow: "0 0 0 1px " + accent + '15' }}
                    >
                      <img 
                        src={img} 
                        alt={seoAlt + ' - Image ' + (index + 1)} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                        loading="lazy"
                        decoding="async"
                        style={{ imageRendering: 'auto' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}