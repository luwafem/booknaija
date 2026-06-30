// src/components/onboarding/StepFood.jsx
export default function StepFood({
  foods,
  addFood,
  removeFood,
  updateFood,
  addFoodImage,
  removeFoodImage,
  addAddonGroup,
  removeAddonGroup,
  updateAddonGroup,
  addAddonOption,
  removeAddonOption,
  updateAddonOption,
  inputBase,
  selectBase,
  sectionTitle,
  sectionDesc,
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <p className={sectionTitle}>Food Menu</p>
          <p className={sectionDesc}>Add menu items with variations.</p>
        </div>
        <button
          type="button"
          onClick={addFood}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {foods.map(item => (
          <div key={item.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
            <button
              type="button"
              onClick={() => removeFood(item.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 z-10"
            >
              ✕
            </button>

            <div className="space-y-2">
              <input
                className={inputBase}
                placeholder="Food Name"
                value={item.name}
                onChange={e => updateFood(item.id, 'name', e.target.value)}
              />
              <input
                className={inputBase}
                placeholder="Price (₦)"
                type="number"
                value={item.price}
                onChange={e => updateFood(item.id, 'price', e.target.value)}
              />
              <textarea
                className={inputBase + " h-16 resize-none"}
                placeholder="Description"
                value={item.description}
                onChange={e => updateFood(item.id, 'description', e.target.value)}
              />
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
              <div className="grid grid-cols-3 gap-2">
                {(item.images || []).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => removeFoodImage(item.id, idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(item.images || []).length < 3 && (
                  <button
                    type="button"
                    onClick={() => addFoodImage(item)}
                    className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all"
                  >
                    <span className="text-xs">+ Photos</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Variations & Addons</span>
                <button
                  type="button"
                  onClick={() => addAddonGroup(item.id)}
                  className="text-xs text-white hover:text-zinc-300 font-medium transition-colors"
                >
                  + Add Group
                </button>
              </div>

              {item.addons && item.addons.length > 0 && (
                <div className="space-y-3">
                  {item.addons.map(addon => (
                    <div key={addon.id} className="bg-zinc-800 rounded-xl border border-zinc-700 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          className={inputBase + " flex-1 font-medium"}
                          placeholder="Group Name (e.g. Size)"
                          value={addon.label}
                          onChange={e => updateAddonGroup(item.id, addon.id, 'label', e.target.value)}
                        />
                        <select
                          className={selectBase + " w-24"}
                          value={addon.type}
                          onChange={e => updateAddonGroup(item.id, addon.id, 'type', e.target.value)}
                        >
                          <option value="single" className="bg-zinc-800">Single</option>
                          <option value="multi" className="bg-zinc-800">Multi</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeAddonGroup(item.id, addon.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1 shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-2 pl-1 border-l-2 border-zinc-700 ml-1">
                        {addon.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              className={inputBase + " flex-1 py-2.5 text-sm"}
                              placeholder="Option name"
                              value={opt.name}
                              onChange={e => updateAddonOption(item.id, addon.id, opt.id, 'name', e.target.value)}
                            />
                            <div className="relative w-24 shrink-0">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">+₦</span>
                              <input
                                type="number"
                                className={inputBase + " pl-7 py-2.5 text-sm"}
                                placeholder="0"
                                value={opt.price || ''}
                                onChange={e => updateAddonOption(item.id, addon.id, opt.id, 'price', e.target.value)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAddonOption(item.id, addon.id, opt.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-1 shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addAddonOption(item.id, addon.id)}
                          className="w-full py-2 text-xs text-zinc-400 hover:text-white font-medium transition-colors flex items-center justify-center gap-1 rounded-lg hover:bg-zinc-700"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}