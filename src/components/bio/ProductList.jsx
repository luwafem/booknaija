import { useState } from 'react';

// ─── COLOR MAP: Resolves text names to CSS-friendly hex codes ───
const colorHexMap = {
  'red': '#ef4444', 'blue': '#3b82f6', 'green': '#22c55e', 
  'black': '#000000', 'white': '#ffffff', 'yellow': '#eab308',
  'pink': '#ec4899', 'purple': '#a855f7', 'orange': '#f97316',
  'brown': '#92400e', 'gray': '#6b7280', 'grey': '#6b7280',
  'gold': '#d4af37', 'silver': '#c0c0c0', 'beige': '#f5f5dc',
  'navy': '#000080', 'coral': '#ff7f50', 'teal': '#14b8a6',
  'cream': '#fffdd0', 'ivory': '#fffff0', 'khaki': '#c3b091',
  'maroon': '#800000', 'olive': '#808000', 'tan': '#d2b48c',
  'turquoise': '#40e0d0', 'burgundy': '#800020', 'multi': 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
  'assorted': 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
  'mixed': 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
  'print': 'repeating-linear-gradient(45deg, #ccc, #ccc 2px, #fff 2px, #fff 4px)',
  'ankara': 'repeating-linear-gradient(45deg, #ef4444, #ef4444 2px, #f59e0b 2px, #f59e0b 4px)',
};

function resolveColor(colorStr, isDark) {
  if (!colorStr) return isDark ? '#333333' : '#cccccc';
  const lower = colorStr.toLowerCase().trim();
  if (lower.startsWith('#') && (lower.length === 4 || lower.length === 7)) return lower;
  if (colorHexMap[lower]) return colorHexMap[lower];
  return isDark ? '#444444' : '#aaaaaa'; 
}

export default function ProductList({ products, selectedProducts, onSelect, accent, label, location, theme }) {
  const isDark = theme === 'dark';

  return (
    <section className="px-4 sm:px-6 mt-8" aria-label={label}>
      <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-6 px-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
        {label}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            active={selectedProducts.includes(p.id)}
            accent={accent}
            onClick={(id, size, color) => onSelect(id, size, color)}
            location={location}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );                  
}

function ProductCard({ product, active, accent, onClick, location, theme }) {
  const [openDetails, setOpenDetails] = useState(false);
  const isDark = theme === 'dark';
  
  const hasSizes = product.sizes && product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState(hasSizes ? product.sizes[0] : null);
  
  const hasColors = product.colors && product.colors.length > 0;
  const [selectedColor, setSelectedColor] = useState(hasColors ? product.colors[0] : null);
  
  const allImages = product.images || (product.image ? [product.image] : []);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const seoAlt = location ? `${product.name} in ${location}` : product.name;

  const hasDiscount = product.discount_enabled && product.discount_price > 0;
  const originalPrice = product.price;
  const discountPrice = hasDiscount ? product.discount_price : originalPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  const cardBg = isDark 
    ? (active ? 'bg-white/5' : 'bg-white/[0.02] hover:bg-white/[0.04]') 
    : (active ? 'bg-stone-50' : 'bg-white hover:bg-stone-50');
  
  const cardBorder = active 
    ? { borderColor: `${accent}60`, boxShadow: `0 0 0 1px ${accent}30, 0 8px 24px -4px ${accent}15` }
    : { borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e7e5e4' };

  const textPrimary = isDark ? 'text-white' : 'text-stone-900';
  const borderSubtle = isDark ? 'border-white/5' : 'border-stone-100';
  const imageBg = isDark ? 'bg-black' : 'bg-stone-100';

  const nextImage = (e) => {
    e.stopPropagation();
    if (allImages.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (allImages.length > 1) {
      setCurrentImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const handleSizeClick = (size) => (e) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  const handleColorClick = (color) => (e) => {
    e.stopPropagation();
    setSelectedColor(color);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onClick(product.id, selectedSize, selectedColor);
  };

  const canShowDetails = product.showDetails !== false && product.description;
  const isWide = product.layout === 'wide';
  const isFashionVariant = hasSizes || hasColors;

  let gridSpanClass;
  if (isWide) {
    gridSpanClass = 'col-span-2 sm:col-span-6 lg:col-span-6';
  } else if (isFashionVariant) {
    gridSpanClass = 'col-span-2 sm:col-span-3 lg:col-span-4'; 
  } else {
    gridSpanClass = 'col-span-1 sm:col-span-2 lg:col-span-3'; 
  }

  const imageAspectClass = (isWide || isFashionVariant) ? 'aspect-[4/5]' : 'aspect-square';

  const descBgDark = `rgba(255,255,255,0.04)`;
  const descBgLight = `rgba(0,0,0,0.025)`;

  return (
    <div
      className={`
        w-full text-left rounded-xl sm:rounded-2xl border transition-all duration-300 group relative overflow-hidden flex flex-col
        ${gridSpanClass}
        ${cardBg}
        hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5
      `}
      style={cardBorder}
    >
      {/* Image Container */}
      <div className={`w-full relative overflow-hidden ${imageBg} border-b ${borderSubtle} ${imageAspectClass} group/img cursor-grab active:cursor-grabbing`}>
        {allImages.length > 0 ? (
          <img 
            src={allImages[currentImgIndex]} 
            alt={seoAlt} 
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out pointer-events-none" 
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-stone-800' : 'text-stone-300'}`}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-lg border border-red-400/30 pointer-events-none">
            -{discountPercentage}%
          </div>
        )}

        {product.product_code && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-mono px-1.5 sm:px-2 py-0.5 rounded border bg-white/10 border-white/20 pointer-events-none">
            {product.product_code}
          </div>
        )}

        {allImages.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-10 hover:bg-black/60 scale-90 group-hover/img:scale-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-10 hover:bg-black/60 scale-90 group-hover/img:scale-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 sm:gap-1.5 z-10 pointer-events-none">
              {allImages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentImgIndex 
                      ? 'w-5 sm:w-7 bg-white/90' 
                      : 'w-1 sm:w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {active && (
          <div 
            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300 scale-0 group-hover:scale-100 pointer-events-none"
            style={{ backgroundColor: accent, color: '#0a0a0a' }}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className={`p-2.5 sm:p-3 lg:p-4 flex-1 flex flex-col justify-between`}>
        <div>
          <h3 className={`font-semibold mb-1.5 transition-colors line-clamp-1 text-xs sm:text-sm ${active ? textPrimary : (isDark ? 'text-stone-300' : 'text-stone-800')}`}>
            {product.name}
          </h3>
          
          {hasSizes && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={handleSizeClick(size)}
                  className="rounded-md transition-all duration-200 font-medium cursor-pointer"
                  style={{
                    backgroundColor: selectedSize === size ? accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    color: selectedSize === size ? '#0a0a0a' : (isDark ? '#a1a1aa' : '#78716c'),
                    border: selectedSize === size ? '1px solid transparent' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'),
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    transform: selectedSize === size ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {hasColors && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={handleColorClick(color)}
                  title={color} 
                  className={`rounded-full transition-all duration-200 relative border-2 cursor-pointer ${selectedColor === color ? 'scale-110' : 'hover:scale-105'} ${isDark ? 'border-white/10' : 'border-white'}`}
                  style={{
                    backgroundColor: resolveColor(color, isDark),
                    boxShadow: selectedColor === color ? `0 0 0 2px ${isDark ? '#0a0a0a' : '#ffffff'}, 0 0 0 4px ${accent}` : 'none',
                    width: '18px',
                    height: '18px',
                  }}
                />
              ))}
            </div>
          )}
          
          {canShowDetails && (
            <div className="mt-1 mb-1">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDetails(!openDetails); }}
                className={`w-full flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase transition-all duration-200 group/desc cursor-pointer ${
                  isDark ? 'text-stone-500 hover:text-stone-200' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                  style={{ 
                    backgroundColor: openDetails ? `${accent}25` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    color: openDetails ? accent : 'inherit'
                  }}
                >
                  <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${openDetails ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span className="transition-colors">{openDetails ? 'Hide Details' : 'View Details'}</span>
                <span 
                  className="h-px flex-1 ml-1 transition-all duration-700" 
                  style={{ backgroundColor: openDetails ? `${accent}30` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') }} 
                />
              </button>

              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openDetails ? 'max-h-48 opacity-100 mt-2.5' : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                <div 
                  className="relative rounded-lg overflow-hidden"
                  style={{ backgroundColor: isDark ? descBgDark : descBgLight }}
                >
                  <div 
                    className="absolute inset-0" 
                    style={{ borderLeft: `2.5px solid ${accent}` }}
                  />
                  <div className="relative p-2.5 sm:p-3 pl-3.5 sm:pl-4">
                    <span 
                      className="absolute -top-0.5 left-2 sm:left-2.5 text-[18px] sm:text-[20px] font-serif leading-none select-none opacity-15"
                      style={{ color: accent }}
                    >
                      {'\u201C'}
                    </span>
                    <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`} style={{ fontStyle: 'italic' }}>
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── ENHANCED PRICE & ADD BUTTON ─── */}
        <div className={`flex items-center justify-between gap-3 mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-stone-100'}`}>
          <div className="inline-flex flex-col items-start">
            <p className={`font-bold tabular-nums text-sm sm:text-base leading-none ${active ? (isDark ? 'text-white' : 'text-stone-900') : ''}`} style={{ color: active ? undefined : accent }}>
              {'\u20A6'}{discountPrice.toLocaleString()}
            </p>
            {hasDiscount && (
              <p className={`line-through tabular-nums text-[9px] sm:text-[10px] mt-0.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                {'\u20A6'}{originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={handleAddClick}
            className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: active ? accent : 'transparent',
              color: active ? '#0a0a0a' : accent,
              border: active ? '1px solid transparent' : `1px solid ${accent}40`,
            }}
          >
            {active ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Added
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}