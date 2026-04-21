import { useState } from 'react';

export default function ProductList({ products, selectedProducts, onSelect, accent, label }) {
  return (
    <section className="px-6 mt-8">
      <h2 className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.15em] mb-3 px-1">
        {label}
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
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
      className="text-left rounded-xl border transition-all duration-200 group bg-white/[0.02] overflow-hidden flex flex-col cursor-pointer"
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
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-[#111] relative">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
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
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
            style={{ background: accent, color: '#0a0a0a' }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sm font-medium leading-snug text-stone-300 group-hover:text-white transition-colors line-clamp-2">
            {product.name}
          </p>
          
          {/* Details Toggle */}
          {canShowDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent adding to cart
                setOpenDetails(!openDetails);
              }}
              className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-stone-600 hover:text-stone-300 transition-colors"
            >
              <span className="w-3.5 h-3.5 rounded border border-stone-700 flex items-center justify-center text-[9px]">
                {openDetails ? '−' : '+'}
              </span>
              {openDetails ? 'Less' : 'More'}
            </button>
          )}

          {/* Expandable Details */}
          {openDetails && canShowDetails && (
            <p className="text-[11px] text-stone-500 leading-relaxed mt-2 pt-2 border-t border-white/[0.06] animate-fade-in">
              {product.description}
            </p>
          )}
        </div>

        <p className="text-xs mt-2 font-bold tabular-nums" style={{ color: accent }}>
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}