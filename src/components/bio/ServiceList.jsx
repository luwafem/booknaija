import { useState } from 'react';

export default function ServiceList({ services, selectedId, onSelect, accent }) {
  return (
    <section className="px-6 mt-8">
      <h2 className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.15em] mb-3 px-1">
        Services
      </h2>
      <div className="space-y-2">
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
      className="w-full text-left p-3 rounded-xl border transition-all duration-300 group bg-white/[0.02] overflow-hidden cursor-pointer"
      style={
        active
          ? { 
              background: `${accent}08`, 
              borderColor: `${accent}40`, 
              boxShadow: `0 4px 20px -4px ${accent}15`,
              borderWidth: '1px' 
            }
          : { borderColor: 'rgba(255,255,255,0.04)' }
      }
    >
      {/* Main Card Content */}
      <div className="flex items-center gap-3">
        {service.image ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#111] border border-white/[0.04]">
            <img 
              src={service.image} 
              alt={service.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-stone-900 flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate transition-colors ${active ? '' : 'text-stone-300 group-hover:text-white'}`}>
              {service.name}
            </p>
            <p className="text-xs text-stone-600 mt-0.5">{service.duration}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="text-sm font-bold tabular-nums" style={{ color: accent }}>
              ₦{service.price.toLocaleString()}
            </p>
            {active && (
              <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wider" style={{ color: accent }}>
                Selected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details Toggle Button */}
      {canShowDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent select action
            setOpenDetails(!openDetails);
          }}
          className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-stone-600 hover:text-stone-300 transition-colors"
        >
          <span className="w-4 h-4 rounded border border-stone-700 flex items-center justify-center text-[10px]">
            {openDetails ? '−' : '+'}
          </span>
          {openDetails ? 'Hide details' : 'View details'}
        </button>
      )}

      {/* Expandable Details & Gallery Section */}
      {openDetails && canShowDetails && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] animate-fade-in space-y-3">
          {service.description && (
            <p className="text-xs text-stone-400 leading-relaxed">
              {service.description}
            </p>
          )}
          
          {service.images && service.images.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-2">
                {service.images.length} Pictures
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {service.images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-[#111] border border-white/[0.04]">
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