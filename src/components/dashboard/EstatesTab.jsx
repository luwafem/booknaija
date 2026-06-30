// src/components/dashboard/EstatesTab.jsx
import Toggle from './Toggle';
import TagInput from './TagInput';
import ImageUploadArea from './ImageUploadArea';

export default function EstatesTab({ biz, setNested, addItem, removeItem, uploadImage, accent, inp, lbl, card }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Estates</h3>
        <button
          type="button"
          onClick={() => addItem('estates', {
            id: 'est-' + Date.now(),
            name: '',
            tagline: '',
            description: '',
            location: '',
            priceRange: { min: 0, max: 0 },
            totalUnits: 0,
            availableUnits: 0,
            completionDate: '',
            heroImage: '',
            images: [],
            amenities: [],
            unitTypes: [],
            featured: false,
          })}
          className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
          style={{ backgroundColor: accent }}
        >
          + Add Estate
        </button>
      </div>

      {(biz.estates || []).length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-zinc-500 text-sm">No estates added yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {(biz.estates || []).map((estate) => (
          <div key={estate.id} className={card}>
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Estate</h4>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Featured</span>
                  <Toggle
                    checked={estate.featured || false}
                    onChange={() => setNested('estates', estate.id, { featured: !estate.featured })}
                  />
                </label>
                <button type="button" onClick={() => removeItem('estates', estate.id)} className="text-zinc-500 hover:text-red-400 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>Estate Name</label>
                <input className={inp} placeholder="e.g. Palm Springs Estate" value={estate.name || ''} onChange={(e) => setNested('estates', estate.id, { name: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Tagline</label>
                <input className={inp} placeholder="e.g. Luxury living in the heart of Lekki" value={estate.tagline || ''} onChange={(e) => setNested('estates', estate.id, { tagline: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Location</label>
                <input className={inp} placeholder="e.g. Ibeju-Lekki" value={estate.location || ''} onChange={(e) => setNested('estates', estate.id, { location: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>Completion Date</label>
                <input className={inp} placeholder="e.g. Q4 2025" value={estate.completionDate || ''} onChange={(e) => setNested('estates', estate.id, { completionDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>Price Min (₦)</label>
                  <input className={inp + " text-xs"} type="number" placeholder="0" value={estate.priceRange?.min || ''} onChange={(e) => setNested('estates', estate.id, { priceRange: { ...estate.priceRange, min: Number(e.target.value) || 0 } })} />
                </div>
                <div>
                  <label className={lbl}>Price Max (₦)</label>
                  <input className={inp + " text-xs"} type="number" placeholder="0" value={estate.priceRange?.max || ''} onChange={(e) => setNested('estates', estate.id, { priceRange: { ...estate.priceRange, max: Number(e.target.value) || 0 } })} />
                </div>
                <div>
                  <label className={lbl}>Units</label>
                  <input className={inp + " text-xs"} type="number" placeholder="0" value={estate.totalUnits || ''} onChange={(e) => setNested('estates', estate.id, { totalUnits: Number(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>
                <textarea className={inp + " min-h-[100px] resize-y"} placeholder="Describe this estate..." value={estate.description || ''} onChange={(e) => setNested('estates', estate.id, { description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Amenities</label>
                <TagInput
                  items={estate.amenities || []}
                  onAdd={(val) => {
                    const updated = [...(estate.amenities || []), val];
                    setNested('estates', estate.id, { amenities: updated });
                  }}
                  onRemove={(idx) => {
                    const updated = (estate.amenities || []).filter((_, i) => i !== idx);
                    setNested('estates', estate.id, { amenities: updated });
                  }}
                  placeholder="e.g. Swimming Pool"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Unit Types</label>
                <TagInput
                  items={estate.unitTypes || []}
                  onAdd={(val) => {
                    const updated = [...(estate.unitTypes || []), val];
                    setNested('estates', estate.id, { unitTypes: updated });
                  }}
                  onRemove={(idx) => {
                    const updated = (estate.unitTypes || []).filter((_, i) => i !== idx);
                    setNested('estates', estate.id, { unitTypes: updated });
                  }}
                  placeholder="e.g. 3BR Duplex"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={lbl}>Hero Image</label>
              <ImageUploadArea
                currentImage={estate.heroImage}
                onUpload={() => uploadImage((url) => setNested('estates', estate.id, { heroImage: url }), false, 1)}
                aspect="21/9"
              />
            </div>

            <div className="mt-4">
              <label className={lbl}>Gallery Images</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(estate.images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden group/img">
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = estate.images.filter((_, i) => i !== idx);
                          setNested('estates', estate.id, { images: newImages });
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
                <div
                  className="aspect-[4/3] rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                  onClick={() =>
                    uploadImage(
                      (url) => {
                        const newImages = [...(estate.images || []), url];
                        setNested('estates', estate.id, { images: newImages });
                      },
                      true,
                      10
                    )
                  }
                >
                  <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}