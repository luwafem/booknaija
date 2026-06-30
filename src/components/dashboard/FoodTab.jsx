// src/components/dashboard/FoodTab.jsx
import { useRef } from 'react';

export default function FoodTab({ biz, setNested, addItem, removeItem, uploadImage, accent, inp, sel, lbl, card }) {
  // Helper functions for add-ons (these were originally inside the Dashboard component)
  const addAddonGroup = (foodId) => {
    const newAddon = { id: 'a-' + Date.now(), label: '', type: 'single', options: [] };
    const food = biz.food.find(f => f.id === foodId);
    if (food) {
      const updatedAddons = [...(food.addons || []), newAddon];
      setNested('food', foodId, { addons: updatedAddons });
    }
  };

  const removeAddonGroup = (foodId, addonId) => {
    const food = biz.food.find(f => f.id === foodId);
    if (food) {
      const updatedAddons = (food.addons || []).filter(a => a.id !== addonId);
      setNested('food', foodId, { addons: updatedAddons });
    }
  };

  const updateAddonGroup = (foodId, addonId, field, value) => {
    const food = biz.food.find(f => f.id === foodId);
    if (food) {
      const updatedAddons = (food.addons || []).map(a =>
        a.id === addonId ? { ...a, [field]: value } : a
      );
      setNested('food', foodId, { addons: updatedAddons });
    }
  };

  const addAddonOption = (foodId, addonId) => {
    const food = biz.food.find(f => f.id === foodId);
    if (food) {
      const updatedAddons = (food.addons || []).map(a =>
        a.id === addonId
          ? { ...a, options: [...(a.options || []), { id: 'opt-' + Date.now(), name: '', price: 0 }] }
          : a
      );
      setNested('food', foodId, { addons: updatedAddons });
    }
  };

  const removeAddonOption = (foodId, addonId, optId) => {
    const food = biz.food.find(f => f.id === foodId);
    if (food) {
      const updatedAddons = (food.addons || []).map(a =>
        a.id === addonId
          ? { ...a, options: (a.options || []).filter(o => o.id !== optId) }
          : a
      );
      setNested('food', foodId, { addons: updatedAddons });
    }
  };

  const updateAddonOption = (foodId, addonId, optId, field, value) => {
    const food = biz.food.find(f => f.id === foodId);
    if (food) {
      const updatedAddons = (food.addons || []).map(a =>
        a.id === addonId
          ? { ...a, options: (a.options || []).map(o => o.id === optId ? { ...o, [field]: value } : o) }
          : a
      );
      setNested('food', foodId, { addons: updatedAddons });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Menu Items</h3>
        <button
          type="button"
          onClick={() => addItem('food', { id: 'food-' + Date.now(), name: '', description: '', price: 0, image: '', images: [], addons: [] })}
          className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
          style={{ backgroundColor: accent }}
        >
          + Add Item
        </button>
      </div>

      {(biz.food || []).length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-zinc-500 text-sm">No menu items added yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {(biz.food || []).map((item) => (
          <div key={item.id} className={card}>
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Menu Item</h4>
              <button type="button" onClick={() => removeItem('food', item.id)} className="text-zinc-500 hover:text-red-400 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Item Name</label>
                <input className={inp} placeholder="e.g. Jollof Rice" value={item.name || ''} onChange={(e) => setNested('food', item.id, { name: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Price (₦)</label>
                <input className={inp} type="number" placeholder="0" value={item.price || ''} onChange={(e) => setNested('food', item.id, { price: Number(e.target.value) || 0 })} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>
                <textarea className={inp + " min-h-[80px] resize-y"} placeholder="Describe this item..." value={item.description || ''} onChange={(e) => setNested('food', item.id, { description: e.target.value })} />
              </div>
            </div>

            <div className="mt-4">
              <label className={lbl}>Images (max 3)</label>
              <div className="grid grid-cols-3 gap-2">
                {(item.images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = item.images.filter((_, i) => i !== idx);
                          setNested('food', item.id, { images: newImages, image: newImages[0] || '' });
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
                {(item.images || []).length < 3 && (
                  <div
                    className="aspect-square rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                    onClick={() =>
                      uploadImage(
                        (url) => {
                          const newImages = [...(item.images || []), url];
                          setNested('food', item.id, { images: newImages, image: newImages[0] || '' });
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

            {/* ─── ADD-ONS SECTION ─── */}
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Add-ons / Extras</h4>
                <button
                  type="button"
                  onClick={() => addAddonGroup(item.id)}
                  className="text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
                >
                  + Add Group
                </button>
              </div>

              {(item.addons || []).length === 0 && (
                <p className="text-[11px] text-zinc-500 text-center py-4">No add-ons yet</p>
              )}

              <div className="space-y-4">
                {(item.addons || []).map((addon) => (
                  <div key={addon.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        className={inp + " flex-1 text-sm"}
                        placeholder="Group name (e.g. Drink Options)"
                        value={addon.label || ''}
                        onChange={(e) => updateAddonGroup(item.id, addon.id, 'label', e.target.value)}
                      />
                      <select
                        className={sel + " w-32"}
                        value={addon.type || 'single'}
                        onChange={(e) => updateAddonGroup(item.id, addon.id, 'type', e.target.value)}
                      >
                        <option value="single" className="bg-zinc-900">Single</option>
                        <option value="multiple" className="bg-zinc-900">Multiple</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeAddonGroup(item.id, addon.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(addon.options || []).map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            className={inp + " flex-1 text-xs"}
                            placeholder="Option name"
                            value={opt.name || ''}
                            onChange={(e) => updateAddonOption(item.id, addon.id, opt.id, 'name', e.target.value)}
                          />
                          <input
                            className={inp + " w-24 text-xs text-right font-mono"}
                            type="number"
                            placeholder="₦0"
                            value={opt.price || ''}
                            onChange={(e) => updateAddonOption(item.id, addon.id, opt.id, 'price', Number(e.target.value) || 0)}
                          />
                          <button
                            type="button"
                            onClick={() => removeAddonOption(item.id, addon.id, opt.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addAddonOption(item.id, addon.id)}
                        className="w-full py-2 border border-dashed border-white/[0.06] rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-all duration-300"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}