// src/components/dashboard/ProductsTab.jsx
export default function ProductsTab({ biz, setNested, addItem, removeItem, uploadImage, accent, inp, lbl, card }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Products</h3>
        <button
          type="button"
          onClick={() => addItem('products', { id: 'prod-' + Date.now(), name: '', description: '', price: 0, image: '', images: [] })}
          className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
          style={{ backgroundColor: accent }}
        >
          + Add Product
        </button>
      </div>

      {(biz.products || []).length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-zinc-500 text-sm">No products added yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {(biz.products || []).map((prod) => (
          <div key={prod.id} className={card}>
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Product</h4>
              <button type="button" onClick={() => removeItem('products', prod.id)} className="text-zinc-500 hover:text-red-400 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>Product Name</label>
                <input className={inp} placeholder="e.g. Organic Honey" value={prod.name || ''} onChange={(e) => setNested('products', prod.id, { name: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>
                <textarea className={inp + " min-h-[80px] resize-y"} placeholder="Describe this product..." value={prod.description || ''} onChange={(e) => setNested('products', prod.id, { description: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Price (₦)</label>
                <input className={inp} type="number" placeholder="0" value={prod.price || ''} onChange={(e) => setNested('products', prod.id, { price: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="mt-4">
              <label className={lbl}>Images (max 3)</label>
              <div className="grid grid-cols-3 gap-2">
                {(prod.images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = prod.images.filter((_, i) => i !== idx);
                          setNested('products', prod.id, { images: newImages, image: newImages[0] || '' });
                        }}
                        className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {(prod.images || []).length < 3 && (
                  <div
                    className="aspect-square rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                    onClick={() =>
                      uploadImage(
                        (url) => {
                          const newImages = [...(prod.images || []), url];
                          setNested('products', prod.id, { images: newImages, image: newImages[0] || '' });
                        },
                        true,
                        3
                      )
                    }
                  >
                    <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}