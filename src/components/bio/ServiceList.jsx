import { useState } from 'react';

export default function ServiceList({ services, selectedId, onSelect, accent }) {
  return (
    <section className="px-6 mt-8 max-w-xl mx-auto">
      <h2 className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.2em] mb-6 px-1">
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
          />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ service, active, accent, onClick }) {
  const [openDetails, setOpenDetails] = useState(false);
  
  // Determine if details toggle should show
  const canShowDetails = service.showDetails !== false && (service.description || (service.images && service.images.length > 0));

  return (
    <div
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden cursor-pointer
        ${active 
          ? 'bg-white/5' 
          : 'bg-white/[0.02] hover:bg-white/[0.04]'
        }
      `}
      style={
        active
          ? { 
              borderColor: `${accent}60`, 
              boxShadow: `0 0 0 1px ${accent}30, 0 4px 20px -4px ${accent}15`,
            }
          : { borderColor: 'rgba(255,255,255,0.05)' }
      }
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
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black border border-white/5 shadow-sm">
            <img 
              src={service.image} 
              alt={service.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-black border border-white/5 flex-shrink-0 flex items-center justify-center">
             {/* Optional: Placeholder icon or initial */}
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-sm font-semibold truncate transition-colors ${active ? 'text-white' : 'text-stone-300'}`}>
              {service.name}
            </p>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold tabular-nums transition-colors ${active ? 'text-white' : ''}`} style={{ color: accent }}>
                ₦{service.price.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-400">{service.duration}</p>
        </div>
      </div>

      {/* Details Toggle Button */}
      {canShowDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering parent select action
            setOpenDetails(!openDetails);
          }}
          className="mt-3 text-[11px] font-medium text-stone-500 hover:text-white transition-colors flex items-center gap-2 group/btn"
        >
          <span className="w-4 h-4 rounded border border-stone-700 flex items-center justify-center text-[10px] text-stone-400 group-hover/btn:border-stone-500 group-hover/btn:text-white transition-colors">
            {openDetails ? '−' : '+'}
          </span>
          {openDetails ? 'Hide details' : 'View details'}
        </button>
      )}

      {/* Expandable Details & Gallery Section */}
      {openDetails && canShowDetails && (
        <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in space-y-4">
          {service.description && (
            <p className="text-xs text-stone-300 leading-relaxed">
              {service.description}
            </p>
          )}
          
          {service.images && service.images.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">
                {service.images.length} Pictures
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {service.images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden bg-black border border-white/5">
                    <img 
                      src={img} 
                      alt={`${service.name} ${index + 1}`} 
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