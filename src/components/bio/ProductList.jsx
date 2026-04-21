import { useState } from 'react';

export default function ProductList({ products, selectedProducts, onSelect, accent, label }) {
  return (
    <section className="px-6 mt-8 max-w-xl mx-auto">
      <h2 className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.2em] mb-6 px-1">
        {label}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            active={selectedProducts.includes(p.id)}
            accent={accent}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, active, accent, onClick }) {
  const [openDetails, setOpenDetails] = useState(false);
  const canShowDetails = product.showDetails !== false && product.description;

  return (
    <div
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer
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
      {/* Image Container */}
      <div className="aspect-square w-full bg-black border-b border-white/5 relative">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-800">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        
        {active && (
          <div 
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10 transition-transform duration-300 scale-95 group-hover:scale-100"
            style={{ backgroundColor: accent, color: '#0a0a0a' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className={`text-sm font-semibold truncate mb-1 transition-colors ${active ? 'text-white' : 'text-stone-300'}`}>
            {product.name}
          </h3>
          
          {/* Details Toggle */}
          {canShowDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setOpenDetails(!openDetails);
              }}
              className="mb-2 text-[11px] font-medium text-stone-500 hover:text-white transition-colors flex items-center gap-2 group/btn"
            >
              <span className="w-4 h-4 rounded border border-stone-700 flex items-center justify-center text-[10px] text-stone-400 group-hover/btn:border-stone-500 group-hover/btn:text-white transition-colors">
                {openDetails ? '−' : '+'}
              </span>
              {openDetails ? 'Less' : 'More'}
            </button>
          )}

          {/* Expandable Details */}
          {openDetails && canShowDetails && (
            <p className="text-xs text-stone-300 leading-relaxed animate-fade-in">
              {product.description}
            </p>
          )}
        </div>

        <p className={`text-sm font-bold tabular-nums mt-2 transition-colors ${active ? 'text-white' : ''}`} style={{ color: accent }}>
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}