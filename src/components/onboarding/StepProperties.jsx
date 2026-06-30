// src/components/onboarding/StepProperties.jsx
export default function StepProperties({
  properties,
  businessType,
  addProperty,
  removeProperty,
  updateProperty,
  addPropertyImage,
  removePropertyImage,
  inputBase,
  selectBase,
  sectionTitle,
  sectionDesc,
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <p className={sectionTitle}>Properties</p>
          <p className={sectionDesc}>
            Add your {businessType === 'Shortlet' ? 'shortlets' : 'listings'}.
          </p>
        </div>
        <button
          type="button"
          onClick={addProperty}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {properties.map(prop => (
          <div key={prop.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
            <button
              type="button"
              onClick={() => removeProperty(prop.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"
            >
              ✕
            </button>

            <div className="space-y-2">
              <input
                className={inputBase}
                placeholder="Property Name (e.g. 3 Bed Detached Duplex)"
                value={prop.name}
                onChange={e => updateProperty(prop.id, 'name', e.target.value)}
              />
              <input
                className={inputBase}
                placeholder="Location (e.g. Lekki Phase 1)"
                value={prop.location}
                onChange={e => updateProperty(prop.id, 'location', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputBase}
                  placeholder="Price (₦)"
                  type="number"
                  value={prop.price}
                  onChange={e => updateProperty(prop.id, 'price', e.target.value)}
                />
                <select
                  className={selectBase}
                  value={prop.type}
                  onChange={e => updateProperty(prop.id, 'type', e.target.value)}
                >
                  <option value="sale" className="bg-zinc-800">For Sale</option>
                  <option value="rent" className="bg-zinc-800">For Rent</option>
                  <option value="shortlet" className="bg-zinc-800">Shortlet</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputBase}
                  placeholder="Bedrooms"
                  type="number"
                  value={prop.bedrooms}
                  onChange={e => updateProperty(prop.id, 'bedrooms', e.target.value)}
                />
                <input
                  className={inputBase}
                  placeholder="Bathrooms"
                  type="number"
                  value={prop.bathrooms}
                  onChange={e => updateProperty(prop.id, 'bathrooms', e.target.value)}
                />
              </div>
              <textarea
                className={inputBase + " h-20 resize-none"}
                placeholder="Description"
                value={prop.description}
                onChange={e => updateProperty(prop.id, 'description', e.target.value)}
              />
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 5)</p>
              <div className="grid grid-cols-3 gap-2">
                {(prop.images || []).map((img, idx) => (
                  <div key={idx} className="aspect-video bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => removePropertyImage(prop.id, idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(prop.images || []).length < 5 && (
                  <button
                    type="button"
                    onClick={() => addPropertyImage(prop)}
                    className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all"
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