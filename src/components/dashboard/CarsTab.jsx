// src/components/dashboard/CarsTab.jsx
export default function CarsTab({ biz, setNested, addItem, removeItem, uploadImage, accent, inp, lbl, card }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Cars</h3>
        <button
          type="button"
          onClick={() =>
            addItem('cars', {
              id: 'car-' + Date.now(),
              name: '',
              description: '',
              price: 0,
              image: '',
              images: [],
              type: 'rent',
              year: new Date().getFullYear(),
              mileage: '',
              transmission: '',
              fuel: '',
            })
          }
          className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
          style={{ backgroundColor: accent }}
        >
          + Add Car
        </button>
      </div>

      {(biz.cars || []).length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 11M3 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6M3 11h18" />
          </svg>
          <p className="text-zinc-500 text-sm">No cars added yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {(biz.cars || []).map((car) => (
          <div key={car.id} className={card}>
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Car</h4>
              <button
                type="button"
                onClick={() => removeItem('cars', car.id)}
                className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={lbl}>Car Name</label>
                <input
                  className={inp}
                  placeholder="e.g. Toyota Camry 2023"
                  value={car.name || ''}
                  onChange={(e) => setNested('cars', car.id, { name: e.target.value })}
                />
              </div>

              <div>
                <label className={lbl}>Type</label>
                <select
                  className="w-full appearance-none bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-white/[0.12] focus:ring-1 focus:ring-white/[0.06] transition-all duration-300 cursor-pointer"
                  value={car.type || 'rent'}
                  onChange={(e) => setNested('cars', car.id, { type: e.target.value })}
                >
                  <option value="rent" className="bg-zinc-900">Rent</option>
                  <option value="sale" className="bg-zinc-900">Sale</option>
                </select>
              </div>

              <div>
                <label className={lbl}>Year</label>
                <input
                  className={inp}
                  type="number"
                  placeholder="e.g. 2024"
                  value={car.year || ''}
                  onChange={(e) => setNested('cars', car.id, { year: Number(e.target.value) || new Date().getFullYear() })}
                />
              </div>

              <div>
                <label className={lbl}>Price (₦)</label>
                <input
                  className={inp}
                  type="number"
                  placeholder="0"
                  value={car.price || ''}
                  onChange={(e) => setNested('cars', car.id, { price: Number(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className={lbl}>Mileage</label>
                <input
                  className={inp}
                  placeholder="e.g. 50,000 km"
                  value={car.mileage || ''}
                  onChange={(e) => setNested('cars', car.id, { mileage: e.target.value })}
                />
              </div>

              <div>
                <label className={lbl}>Transmission</label>
                <input
                  className={inp}
                  placeholder="e.g. Automatic"
                  value={car.transmission || ''}
                  onChange={(e) => setNested('cars', car.id, { transmission: e.target.value })}
                />
              </div>

              <div>
                <label className={lbl}>Fuel</label>
                <input
                  className={inp}
                  placeholder="e.g. Petrol"
                  value={car.fuel || ''}
                  onChange={(e) => setNested('cars', car.id, { fuel: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>
                <textarea
                  className={inp + " min-h-[80px] resize-y"}
                  placeholder="Describe this car..."
                  value={car.description || ''}
                  onChange={(e) => setNested('cars', car.id, { description: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={lbl}>Images (max 3)</label>
              <div className="grid grid-cols-3 gap-2">
                {(car.images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = car.images.filter((_, i) => i !== idx);
                          setNested('cars', car.id, { images: newImages, image: newImages[0] || '' });
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
                {(car.images || []).length < 3 && (
                  <div
                    className="aspect-square rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                    onClick={() =>
                      uploadImage(
                        (url) => {
                          const newImages = [...(car.images || []), url];
                          setNested('cars', car.id, { images: newImages, image: newImages[0] || '' });
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