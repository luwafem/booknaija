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
// ────────────────────────────────────────────────────────────────

export default function ProductList({ products, selectedProducts, onSelect, accent, label, location, theme }) {
  const isDark = theme === 'dark';

  return (
    <section className="px-4 sm:px-6 mt-8" aria-label={label}>
      <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-6 px-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
        {label}
      </h2>
      {/* Responsive: 2 col mobile, 3 col tablet, 4 col desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
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
    ? { borderColor: `${accent}60`, boxShadow: `0 0 0 1px ${accent}30, 0 4px 20px -4px ${accent}15` }
    : { borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e7e5e4' };

  const textPrimary = isDark ? 'text-white' : 'text-stone-900';
  const textSecondary = isDark ? 'text-stone-300' : 'text-stone-600';
  const textMuted = isDark ? 'text-stone-500' : 'text-stone-500';
  const borderSubtle = isDark ? 'border-white/5' : 'border-stone-100';
  const imageBg = isDark ? 'bg-black' : 'bg-stone-100';

  const nextImage = (e) => {
    e.stopPropagation();
    if (allImages.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
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

  const canShowDetails = product.showDetails !== false && product.description;
  const isWide = product.layout === 'wide';
  
  // ─── FASHION VARIANT LOGIC ───
  // Check if the product has fashion variants (sizes or colors)
  const isFashionVariant = hasSizes || hasColors;

  // On mobile (grid-cols-2), col-span-2 makes it full width (1 per row). 
  // On sm+ (grid-cols-3/4), sm:col-span-1 resets it to standard size.
  const gridSpanClass = isWide 
    ? 'col-span-2' 
    : (isFashionVariant ? 'col-span-2 sm:col-span-1' : 'col-span-1');

  // Use portrait ratio for fashion items so they aren't giant squares on mobile.
  // Standard items stay square.
  const imageAspectClass = isWide 
    ? 'aspect-[4/5]' 
    : (isFashionVariant ? 'aspect-[4/5]' : 'aspect-square');
  // ────────────────────────────

  return (
    <div
      onClick={() => onClick(product.id, selectedSize, selectedColor)}
      className={`
        w-full text-left rounded-xl sm:rounded-2xl border transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer
        ${gridSpanClass}
        ${cardBg}
      `}
      style={cardBorder}
    >
      {/* Image Container */}
      <div className={`w-full relative overflow-hidden ${imageBg} border-b ${borderSubtle} ${imageAspectClass}`}>
        {allImages.length > 0 ? (
          <img 
            src={allImages[currentImgIndex]} 
            alt={seoAlt} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-stone-800' : 'text-stone-400'}`}>
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {product.product_code && (
          <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border ${isDark ? 'bg-black/70 border-white/10' : 'bg-stone-900/80 border-white/10'}`}>
            {product.product_code}
          </div>
        )}

        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 sm:gap-1.5 z-10 pointer-events-none">
            {allImages.map((_, idx) => (
              <div 
                key={idx} 
                onClick={nextImage}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                  idx === currentImgIndex 
                    ? (isDark ? 'w-4 sm:w-6 bg-white/90' : 'w-4 sm:w-6 bg-stone-900/90') 
                    : (isDark ? 'w-1 sm:w-1.5 bg-white/40' : 'w-1 sm:w-1.5 bg-stone-900/40')
                }`}
              />
            ))}
          </div>
        )}
        
        {active && (
          <div 
            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-lg z-10 transition-transform duration-300 scale-95 group-hover:scale-100"
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
          <h3 className={`font-semibold mb-1 transition-colors line-clamp-1 text-xs sm:text-sm ${active ? textPrimary : (isDark ? 'text-stone-300' : 'text-stone-800')}`}>
            {product.name}
          </h3>
          
          {hasSizes && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={handleSizeClick(size)}
                  className="rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: selectedSize === size ? accent : 'transparent',
                    color: selectedSize === size ? '#0a0a0a' : (isDark ? '#a1a1aa' : '#78716c'),
                    border: selectedSize === size ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #d6d3d1'),
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.4rem'
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
                  className={`rounded-full transition-transform duration-200 relative border ${selectedColor === color ? 'scale-110 shadow-lg' : 'hover:scale-105'} ${isDark ? 'border-white/10' : 'border-stone-200'}`}
                  style={{
                    backgroundColor: resolveColor(color, isDark),
                    boxShadow: selectedColor === color ? `0 0 0 2px ${isDark ? '#0a0a0a' : '#ffffff'}, 0 0 0 4px ${accent}` : 'none',
                    width: '16px',
                    height: '16px',
                  }}
                />
              ))}
            </div>
          )}
          
          {canShowDetails && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDetails(!openDetails); }}
              className={`mb-2 font-medium transition-colors flex items-center gap-1.5 text-[10px] sm:text-[11px] ${isDark ? 'text-stone-500 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] transition-colors ${
                isDark ? 'border-stone-700 text-stone-400' : 'border-stone-300 text-stone-500'
              }`}>
                {openDetails ? '−' : '+'}
              </span>
              {openDetails ? 'Less' : 'More'}
            </button>
          )}

          {openDetails && canShowDetails && (
            <p className={`text-[11px] leading-relaxed animate-fade-in line-clamp-3 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
          <p className={`font-bold tabular-nums text-xs sm:text-sm ${active ? (isDark ? 'text-white' : 'text-stone-900') : ''}`} style={{ color: active ? undefined : accent }}>
            ₦{discountPrice.toLocaleString()}
          </p>
          {hasDiscount && (
            <p className={`line-through tabular-nums text-[10px] sm:text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              ₦{originalPrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}