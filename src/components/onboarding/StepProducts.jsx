// src/components/onboarding/StepProducts.jsx
export default function StepProducts({
  products,
  addProduct,
  removeProduct,
  updateProduct,
  updateProductSizes,
  updateProductColors,
  addProductImage,
  removeProductImage,
  sectionTitle,
  sectionDesc,
  inputBase,
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <p className={sectionTitle}>Products</p>
          <p className={sectionDesc}>Items you sell.</p>
        </div>
        <button
          type="button"
          onClick={addProduct}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
            <button
              type="button"
              onClick={() => removeProduct(product.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"
            >
              ✕
            </button>
            <div className="space-y-2">
              <input
                className={inputBase}
                placeholder="Product Name"
                value={product.name}
                onChange={e => updateProduct(product.id, 'name', e.target.value)}
              />
              <input
                className={inputBase}
                placeholder="Price (₦)"
                type="number"
                value={product.price}
                onChange={e => updateProduct(product.id, 'price', e.target.value)}
              />
              <textarea
                className={inputBase + " h-16 resize-none"}
                placeholder="Description"
                value={product.description}
                onChange={e => updateProduct(product.id, 'description', e.target.value)}
              />
              <input
                className={inputBase}
                placeholder="Sizes (comma separated, e.g. S, M, L, XL)"
                value={(product.sizes || []).join(', ')}
                onChange={e => updateProductSizes(product.id, e.target.value)}
              />
              <input
                className={inputBase}
                placeholder="Colors (comma separated, e.g. Red, Blue, Black)"
                value={(product.colors || []).join(', ')}
                onChange={e => updateProductColors(product.id, e.target.value)}
              />
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
              <div className="grid grid-cols-3 gap-2">
                {(product.images || []).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => removeProductImage(product.id, idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(product.images || []).length < 3 && (
                  <button
                    type="button"
                    onClick={() => addProductImage(product)}
                    className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all"
                  >
                    <span className="text-xs">+ Photos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}