// src/components/onboarding/StepCars.jsx
export default function StepCars({
  cars,
  addCar,
  removeCar,
  updateCar,
  setCarImages,
  addCarImage,
  inputBase,
  sectionTitle,
  sectionDesc,
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <p className={sectionTitle}>Cars</p>
          <p className={sectionDesc}>Add vehicles for rent or sale.</p>
        </div>
        <button
          type="button"
          onClick={addCar}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {cars.map(car => (
          <div key={car.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
            <button
              type="button"
              onClick={() => removeCar(car.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">Type</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={"type-" + car.id}
                      checked={car.type === 'rent'}
                      onChange={() => updateCar(car.id, 'type', 'rent')}
                      className="accent-white"
                    />
                    Rent
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={"type-" + car.id}
                      checked={car.type === 'sale'}
                      onChange={() => updateCar(car.id, 'type', 'sale')}
                      className="accent-white"
                    />
                    Sale
                  </label>
                </div>
                <input
                  className={inputBase}
                  placeholder="Car Name"
                  value={car.name}
                  onChange={e => updateCar(car.id, 'name', e.target.value)}
                />
                <input
                  className={inputBase}
                  placeholder="Year"
                  type="number"
                  value={car.year}
                  onChange={e => updateCar(car.id, 'year', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <input
                  className={inputBase}
                  placeholder="Price (₦)"
                  type="number"
                  value={car.price}
                  onChange={e => updateCar(car.id, 'price', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputBase}
                    placeholder="Mileage"
                    value={car.mileage}
                    onChange={e => updateCar(car.id, 'mileage', e.target.value)}
                  />
                  <input
                    className={inputBase}
                    placeholder="Transmission"
                    value={car.transmission}
                    onChange={e => updateCar(car.id, 'transmission', e.target.value)}
                  />
                </div>
                <input
                  className={inputBase}
                  placeholder="Fuel Type"
                  value={car.fuel}
                  onChange={e => updateCar(car.id, 'fuel', e.target.value)}
                />
              </div>
            </div>

            <textarea
              className={inputBase + " h-16 resize-none mt-2"}
              placeholder="Description"
              value={car.description}
              onChange={e => updateCar(car.id, 'description', e.target.value)}
            />

            <div className="mt-3">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
              <div className="grid grid-cols-3 gap-2">
                {(car.images || []).map((img, idx) => (
                  <div key={idx} className="aspect-video bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => setCarImages(car.id, car.images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addCarImage(car)}
                  className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all"
                >
                  <span className="text-xs">+ Photos</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}