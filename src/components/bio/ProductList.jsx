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
            onClick={(id, size, color) => onSelect(id, size, color)}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, active, accent, onClick }) {
  const [openDetails, setOpenDetails] = useState(false);
  
  // --- SIZE LOGIC ---
  const hasSizes = product.sizes && product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState(hasSizes ? product.sizes[0] : null);
  
  // --- COLOR LOGIC ---
  const hasColors = product.colors && product.colors.length > 0;
  const [selectedColor, setSelectedColor] = useState(hasColors ? product.colors[0] : null);
  
  // --- IMAGE CAROUSEL LOGIC ---
  const allImages = product.images || (product.image ? [product.image] : []);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // NEW: Discount calculation
  const hasDiscount = product.discount_enabled && product.discount_price > 0;
  const originalPrice = product.price;
  const discountPrice = hasDiscount ? product.discount_price : originalPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

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

  return (
    <div
      onClick={() => onClick(product.id, selectedSize, selectedColor)}
      className={`
        w-full text-left rounded-2xl border transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer
        ${isWide ? 'col-span-2' : 'col-span-1'}
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
      <div 
        className={`
          w-full bg-black border-b border-white/5 relative overflow-hidden
          ${isWide ? 'aspect-[4/5]' : 'aspect-square'} 
        `}
      >
        {allImages.length > 0 ? (
          <img 
            src={allImages[currentImgIndex]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-800">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* NEW: Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {/* NEW: Product Code Badge */}
        {product.product_code && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[9px] font-mono px-2 py-1 rounded border border-white/10">
            {product.product_code}
          </div>
        )}

        {/* Image Dots (Carousel Indicator) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {allImages.map((_, idx) => (
              <div 
                key={idx} 
                onClick={nextImage}
                className={`
                  h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer
                  ${idx === currentImgIndex ? 'w-6 bg-white/90' : 'w-1.5 bg-white/40'}
                `}
              />
            ))}
          </div>
        )}
        
        {active && (
          <div 
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-lg z-10 transition-transform duration-300 scale-95 group-hover:scale-100"
            style={{ backgroundColor: accent, color: '#0a0a0a' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className={`
        p-4 flex-1 flex flex-col justify-between
        ${isWide ? 'p-6 pb-10' : 'p-3'} 
      `}>
        <div>
          <h3 className={`
            font-semibold mb-1 transition-colors line-clamp-1
            ${isWide ? 'text-2xl mb-4' : 'text-sm'} 
            ${active ? 'text-white' : 'text-stone-300'}
          `}>
            {product.name}
          </h3>
          
          {/* SIZE CHIPS */}
          {hasSizes && (
            <div className={`
              flex flex-wrap gap-1.5 mb-3
              ${isWide ? 'mb-4' : 'mb-2'}
            `}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={handleSizeClick(size)}
                  className={`
                    rounded-full transition-all duration-200
                    ${selectedSize === size 
                      ? 'scale-105 font-semibold shadow-sm' 
                      : 'hover:bg-white/10'
                    }
                  `}
                  style={{
                    backgroundColor: selectedSize === size ? accent : 'transparent',
                    color: selectedSize === size ? '#0a0a0a' : '#a1a1aa',
                    border: selectedSize === size ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    fontSize: isWide ? '0.875rem' : '0.75rem', 
                    padding: isWide ? '0.25rem 0.75rem' : '0.125rem 0.5rem' 
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {/* COLOR SWATCHES */}
          {hasColors && (
            <div className={`
              flex flex-wrap gap-2 mb-3
              ${isWide ? 'mb-4' : 'mb-2'}
            `}>
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={handleColorClick(color)}
                  title={color} 
                  className={`
                    rounded-full transition-transform duration-200 relative
                    border border-white/20
                    ${selectedColor === color ? 'scale-110 shadow-lg' : 'hover:scale-105'}
                  `}
                  style={{
                    backgroundColor: color,
                    boxShadow: selectedColor === color 
                      ? `0 0 0 2px #0a0a0a, 0 0 0 4px ${accent}` 
                      : 'none',
                    width: isWide ? '20px' : '16px', 
                    height: isWide ? '20px' : '16px',
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Details Toggle */}
          {canShowDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setOpenDetails(!openDetails);
              }}
              className={`mb-2 font-medium text-stone-500 hover:text-white transition-colors flex items-center gap-2 group/btn
                ${isWide ? 'text-xs mb-4' : 'text-[11px]'}
              `}
            >
              <span className="w-4 h-4 rounded border border-stone-700 flex items-center justify-center text-[10px] text-stone-400 group-hover/btn:border-stone-500 group-hover/btn:text-white transition-colors">
                {openDetails ? '−' : '+'}
              </span>
              {openDetails ? 'Less' : 'More'}
            </button>
          )}

          {/* Expandable Details */}
          {openDetails && canShowDetails && (
            <p className={`
              text-stone-300 leading-relaxed animate-fade-in
              ${isWide ? 'text-base leading-relaxed mb-4' : 'text-xs'}
            `}>
              {product.description}
            </p>
          )}
        </div>

        {/* NEW: Price Display with Discount */}
        <div className="flex items-center gap-2">
          <p className={`
            font-bold tabular-nums transition-colors
            ${isWide ? 'text-2xl' : 'text-sm'}
            ${active ? 'text-white' : ''}
          `} style={{ color: accent }}>
            ₦{discountPrice.toLocaleString()}
          </p>
          {hasDiscount && (
            <p className={`
              text-stone-500 line-through tabular-nums
              ${isWide ? 'text-base' : 'text-xs'}
            `}>
              ₦{originalPrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}