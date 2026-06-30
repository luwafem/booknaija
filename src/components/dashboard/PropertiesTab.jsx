// src/components/dashboard/PropertiesTab.jsx
import TagInput from './TagInput';

export default function PropertiesTab({ biz, setNested, addItem, removeItem, uploadImage, accent, inp, sel, lbl, card }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Properties</h3>
        <button
          type="button"
          onClick={() => addItem('properties', {
            id: 'prop-' + Date.now(),
            name: '',
            location: '',
            type: 'rent',
            price: '',
            bedrooms: '',
            bathrooms: '',
            description: '',
            amenities: [],
            images: []
          })}
          className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
          style={{ backgroundColor: accent }}
        >
          + Add Property
        </button>
      </div>

      {(biz.properties || []).length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-zinc-500 text-sm">No properties added yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {(biz.properties || []).map((prop) => (
          <div key={prop.id} className={card}>
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Property</h4>
              <button type="button" onClick={() => removeItem('properties', prop.id)} className="text-zinc-500 hover:text-red-400 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>Property Name</label>
                <input className={inp} placeholder="e.g. 3 Bedroom Duplex" value={prop.name || ''} onChange={(e) => setNested('properties', prop.id, { name: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Location</label>
                <input className={inp} placeholder="e.g. Lekki Phase 1" value={prop.location || ''} onChange={(e) => setNested('properties', prop.id, { location: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Type</label>
                <select className={sel} value={prop.type || 'rent'} onChange={(e) => setNested('properties', prop.id, { type: e.target.value })}>
                  <option value="rent" className="bg-zinc-900">For Rent</option>
                  <option value="sale" className="bg-zinc-900">For Sale</option>
                  <option value="shortlet" className="bg-zinc-900">Shortlet</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Price (₦)</label>
                <input className={inp} type="number" placeholder="0" value={prop.price || ''} onChange={(e) => setNested('properties', prop.id, { price: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Bedrooms</label>
                  <input className={inp} type="number" placeholder="0" value={prop.bedrooms || ''} onChange={(e) => setNested('properties', prop.id, { bedrooms: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>Bathrooms</label>
                  <input className={inp} type="number" placeholder="0" value={prop.bathrooms || ''} onChange={(e) => setNested('properties', prop.id, { bathrooms: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>
                <textarea className={inp + " min-h-[100px] resize-y"} placeholder="Describe this property..." value={prop.description || ''} onChange={(e) => setNested('properties', prop.id, { description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Amenities</label>
                <TagInput
                  items={prop.amenities || []}
                  onAdd={(val) => {
                    const updated = [...(prop.amenities || []), val];
                    setNested('properties', prop.id, { amenities: updated });
                  }}
                  onRemove={(idx) => {
                    const updated = (prop.amenities || []).filter((_, i) => i !== idx);
                    setNested('properties', prop.id, { amenities: updated });
                  }}
                  placeholder="e.g. Swimming Pool"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={lbl}>Images (max 5)</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(prop.images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden group/img">
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = prop.images.filter((_, i) => i !== idx);
                          setNested('properties', prop.id, { images: newImages });
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
                {(prop.images || []).length < 5 && (
                  <div
                    className="aspect-[4/3] rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                    onClick={() =>
                      uploadImage(
                        (url) => {
                          const newImages = [...(prop.images || []), url];
                          setNested('properties', prop.id, { images: newImages });
                        },
                        true,
                        5
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