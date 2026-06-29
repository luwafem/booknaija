import { useState } from 'react';

const SCROLLBAR_HIDE_CSS = `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`;

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-start">
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
  );
}

function ProductCard({ product, active, accent, onClick, location, theme }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [cardImgIdx, setCardImgIdx] = useState(0);
  const [modalImgIdx, setModalImgIdx] = useState(0);
  const isDark = theme === 'dark';
  
  const hasSizes = product.sizes && product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState(hasSizes ? product.sizes[0] : null);
  
  const hasColors = product.colors && product.colors.length > 0;
  const [selectedColor, setSelectedColor] = useState(hasColors ? product.colors[0] : null);
  
  const allImages = product.images || (product.image ? [product.image] : []);

  const seoAlt = location ? product.name + ' in ' + location : product.name;

  const hasDiscount = product.discount_enabled && product.discount_price > 0;
  const originalPrice = product.price;
  const discountPrice = hasDiscount ? product.discount_price : originalPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  const nextCardImage = (e) => {
    e.stopPropagation();
    if (allImages.length > 1) setCardImgIdx((p) => (p + 1) % allImages.length);
  };

  const prevCardImage = (e) => {
    e.stopPropagation();
    if (allImages.length > 1) setCardImgIdx((p) => (p - 1 + allImages.length) % allImages.length);
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

  const handleModalAdd = () => {
    onClick(product.id, selectedSize, selectedColor);
    setIsModalOpen(false);
  };

  const openModal = (e) => {
    e.stopPropagation();
    setModalImgIdx(cardImgIdx);
    setIsModalOpen(true);
  };

  const sizeButtonStyle = (size) => ({
    backgroundColor: selectedSize === size ? accent : accent + '08',
    color: selectedSize === size ? '#0a0a0a' : accent,
    border: selectedSize === size ? '1px solid transparent' : '1px solid ' + accent + '15',
    padding: '0.3rem 0.65rem',
  });

  const colorButtonStyle = (color) => ({
    backgroundColor: resolveColor(color, isDark),
    boxShadow: selectedColor === color 
      ? "0 0 0 2px " + (isDark ? '#0a0a0a' : '#ffffff') + ", 0 0 0 4px " + accent 
      : "0 0 0 1px " + accent + '15',
    width: '22px',
    height: '22px',
    transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
  });

  return (
    <>
      <div
        className="w-full text-left rounded-2xl transition-all duration-500 group relative overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1"
        style={{ 
          backgroundColor: active ? accent + '15' : accent + '08',
          border: active ? '1px solid ' + accent + '30' : '1px solid ' + accent + '15',
          ...(active ? { boxShadow: "0 0 0 1px " + accent + "30, 0 8px 30px -8px " + accent + "20" } : {}),
        }}
      >
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 z-10" style={{ backgroundColor: accent }} />
        )}

        {/* ─── IMAGE ─── */}
        <div 
          onClick={openModal}
          className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer"
          style={{ backgroundColor: accent + '08' }}
        >
          {allImages.length > 0 ? (
            <img 
              src={allImages[cardImgIdx]} 
              alt={seoAlt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" 
              loading="lazy"
              decoding="async"
              style={{ imageRendering: 'auto' }}
            />
          ) : (
            <div className={"w-full h-full flex items-center justify-center " + (isDark ? 'text-zinc-800' : 'text-gray-300')}>
              <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

          {hasDiscount && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[9px] font-bold tracking-[0.1em] uppercase rounded-full shadow-sm" style={{ color: '#dc2626' }}>
                -{discountPercentage}%
              </span>
            </div>
          )}

          {product.product_code && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[9px] font-mono pointer-events-none">
              {product.product_code}
            </div>
          )}

          {allImages.length > 1 && (
            <>
              <button 
                onClick={prevCardImage} 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-black/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={nextCardImage} 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-black/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                {allImages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={"h-1 rounded-full transition-all duration-300 " + (idx === cardImgIdx ? 'w-6 bg-white/90' : 'w-1.5 bg-white/40')}
                  />
                ))}
              </div>
            </>
          )}

          {active && (
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-10" style={{ backgroundColor: accent }}>
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* ─── CONTENT ─── */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          {/* Row 1: Name (left) · Price (right) */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className={"text-[15px] sm:text-base font-semibold tracking-tight line-clamp-2 leading-snug flex-1 min-w-0 " + (isDark ? 'text-white' : 'text-gray-900')}>
              {product.name}
            </h3>
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-bold tracking-tight tabular-nums" style={{ color: accent }}>
                {"\u20A6"}{discountPrice.toLocaleString()}
              </div>
              {hasDiscount && (
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={"text-[11px] line-through tabular-nums " + (isDark ? 'text-zinc-600' : 'text-gray-400')}>
                    {"\u20A6"}{originalPrice.toLocaleString()}
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-[0.08em] uppercase rounded-full" style={{ backgroundColor: '#dc262615', color: '#dc2626' }}>
                    -{discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Sizes (left) · Colors (right) */}
          {(hasSizes || hasColors) && (
            <div className="flex items-start justify-between gap-4 mb-4">
              {hasSizes && (
                <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={handleSizeClick(size)}
                      className="rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 cursor-pointer"
                      style={sizeButtonStyle(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
              {hasColors && (
                <div className="flex flex-wrap gap-2.5 flex-shrink-0 justify-end">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={handleColorClick(color)}
                      title={color} 
                      className="rounded-full transition-all duration-200 cursor-pointer"
                      style={colorButtonStyle(color)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer — Details (left) · Add (right) */}
          <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: "1px solid " + accent + '15' }}>
            <button
              onClick={openModal}
              className="flex items-center gap-1 py-2 px-1 cursor-pointer group/hint"
            >
              <span 
                className="text-[11px] font-medium tracking-wide transition-opacity duration-200 opacity-60 group-hover/hint:opacity-100"
                style={{ color: accent }}
              >
                Details
              </span>
              <svg 
                className="w-3 h-3 transition-all duration-200 opacity-60 group-hover/hint:opacity-100 group-hover/hint:translate-x-0.5" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                style={{ color: accent }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <button
              onClick={handleAddClick}
              className="flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase transition-all duration-300 active:scale-[0.97] cursor-pointer"
              style={{
                backgroundColor: active ? accent : 'transparent',
                color: active ? '#0a0a0a' : accent,
                border: active ? '1px solid transparent' : "1px solid " + accent + "40",
              }}
            >
              {active ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
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

      {/* ─── PREMIUM DETAIL MODAL ─── */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center backdrop-blur-md" 
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className={"w-full h-full sm:h-[88vh] sm:max-w-5xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row " + (isDark ? 'bg-zinc-950' : 'bg-white')}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* ─── LEFT: IMAGE GALLERY ─── */}
            <div className="relative h-[45vh] sm:h-full sm:w-[55%] bg-black shrink-0 flex flex-col">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {hasDiscount && (
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
                  <span className="px-3 py-1.5 bg-white/90 text-black text-[9px] font-bold tracking-[0.1em] uppercase rounded-full shadow-lg" style={{ color: '#dc2626' }}>
                    -{discountPercentage}%
                  </span>
                </div>
              )}

              <div 
                className="flex-1 min-h-0 flex items-center justify-center overflow-hidden cursor-zoom-in p-2" 
                onClick={() => setIsLightboxOpen(true)}
              >
                <img 
                  src={allImages[modalImgIdx]} 
                  alt={seoAlt} 
                  className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105" 
                  loading="lazy"
                  decoding="async"
                  style={{ imageRendering: 'auto' }}
                />
              </div>

              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setModalImgIdx((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button 
                    onClick={() => setModalImgIdx((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}

              {allImages.length > 1 && (
                <div className="shrink-0 h-[60px] sm:h-[70px] flex items-center gap-2 px-4 border-t border-white/10 overflow-x-auto no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setModalImgIdx(idx)}
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all duration-300 opacity-40 hover:opacity-70"
                      style={{ 
                        opacity: idx === modalImgIdx ? '1' : undefined,
                        outline: idx === modalImgIdx ? "2px solid " + accent : "2px solid transparent",
                        outlineOffset: "2px"
                      }}
                    >
                      <img 
                        src={img} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        loading="lazy"
                        decoding="async"
                        style={{ imageRendering: 'auto' }} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── RIGHT: PRODUCT DETAILS ─── */}
            <div 
              className="flex-1 flex flex-col min-h-0 overflow-hidden border-l-0 sm:border-l border-t sm:border-t-0"
              style={{ borderColor: accent + '15' }}
            >
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {product.product_code && (
                      <span 
                        className="px-2 py-0.5 text-[9px] font-mono tracking-wider rounded"
                        style={{ 
                          backgroundColor: accent + '08', 
                          color: isDark ? '#71717a' : '#a1a1aa' 
                        }}
                      >
                        {product.product_code}
                      </span>
                    )}
                  </div>
                  <h2 className={"text-2xl sm:text-3xl font-bold tracking-tight leading-tight " + (isDark ? 'text-white' : 'text-black')}>
                    {product.name}
                  </h2>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: accent }}>
                    {"\u20A6"}{discountPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className={"text-base line-through tabular-nums " + (isDark ? 'text-zinc-600' : 'text-gray-400')}>
                      {"\u20A6"}{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {(hasSizes || hasColors) && (
                  <div className="space-y-4 pt-2">
                    {hasSizes && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={"text-xs font-semibold tracking-widest uppercase w-12 " + (isDark ? 'text-zinc-500' : 'text-gray-400')}>Size</span>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                              className="rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer px-3.5 py-2"
                              style={sizeButtonStyle(size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {hasColors && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={"text-xs font-semibold tracking-widest uppercase w-12 " + (isDark ? 'text-zinc-500' : 'text-gray-400')}>Color</span>
                        <div className="flex flex-wrap gap-2.5">
                          {product.colors.map((color) => (
                            <button
                              key={color}
                              onClick={(e) => { e.stopPropagation(); setSelectedColor(color); }}
                              title={color} 
                              className="rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
                              style={{
                                ...colorButtonStyle(color),
                                width: '26px',
                                height: '26px',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {product.description && (
                  <div className="pt-2">
                    <p className={"text-sm leading-relaxed " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
                      {product.description}
                    </p>
                  </div>
                )}
                
                <div className="h-4" />
              </div>

              <div 
                className="shrink-0 p-4 sm:p-6 border-t flex items-center gap-4"
                style={{ 
                  borderColor: accent + '15',
                  background: isDark 
                    ? 'linear-gradient(to top, #09090b 60%, transparent)' 
                    : 'linear-gradient(to top, #ffffff 60%, transparent)'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-0.5 font-medium" style={{ color: accent }}>Total</div>
                  <div className="text-xl font-bold tracking-tight tabular-nums" style={{ color: accent }}>
                    {"\u20A6"}{discountPrice.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={handleModalAdd}
                  className="flex-1 sm:max-w-[220px] py-3.5 rounded-xl text-xs font-bold tracking-[0.12em] uppercase text-black transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: accent }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MINIMAL LIGHTBOX ─── */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black flex flex-col"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="flex items-center justify-between px-5 py-4 relative z-10 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsLightboxOpen(false)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2 text-white/50 text-xs font-medium tabular-nums">
              <span style={{ color: accent }}>{modalImgIdx + 1}</span>
              <span>/</span>
              <span>{allImages.length}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-0 px-4" onClick={e => e.stopPropagation()}>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setModalImgIdx((prev) => (prev - 1 + allImages.length) % allImages.length)}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all rounded-full z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <button
                  onClick={() => setModalImgIdx((prev) => (prev + 1) % allImages.length)}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all rounded-full z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </>
            )}
            <div className="max-w-6xl w-full h-full flex items-center justify-center p-4 select-none">
              <img 
                src={allImages[modalImgIdx]} 
                alt={seoAlt} 
                className="max-w-full max-h-full object-contain rounded-lg" 
                loading="lazy"
                decoding="async"
                draggable="false" 
                style={{ imageRendering: 'auto' }} 
              />
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="flex-shrink-0 px-4 py-4 flex flex-col items-center gap-3 relative z-10" onClick={e => e.stopPropagation()}>
              <div className="flex gap-2 overflow-x-auto max-w-full px-2 no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setModalImgIdx(idx)}
                    className={"flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-xl transition-all duration-300 " + (idx === modalImgIdx ? 'opacity-100 scale-105' : 'opacity-30 hover:opacity-60')}
                    style={{ border: idx === modalImgIdx ? "2px solid " + accent : "2px solid transparent" }}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      decoding="async"
                      draggable="false" 
                      style={{ imageRendering: 'auto' }} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          <style>{SCROLLBAR_HIDE_CSS}</style>
        </div>
      )}
    </>
  );
}