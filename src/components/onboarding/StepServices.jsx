// src/components/onboarding/StepServices.jsx
export default function StepServices({
  services,
  addService,
  removeService,
  updateService,
  addServiceImage,
  removeServiceImage,
  sectionTitle,
  sectionDesc,
  inputBase,
  labelBase,
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <p className={sectionTitle}>Services</p>
          <p className={sectionDesc}>Add the services you offer.</p>
        </div>
        <button
          type="button"
          onClick={addService}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {services.map(service => (
          <div key={service.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
            <button
              type="button"
              onClick={() => removeService(service.id)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"
            >
              ✕
            </button>
            <div className="space-y-2">
              <input
                className={inputBase}
                placeholder="Service Name"
                value={service.name}
                onChange={e => updateService(service.id, 'name', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputBase}
                  placeholder="Price (₦)"
                  type="number"
                  value={service.price}
                  onChange={e => updateService(service.id, 'price', e.target.value)}
                />
                <input
                  className={inputBase}
                  placeholder="Duration"
                  value={service.duration}
                  onChange={e => updateService(service.id, 'duration', e.target.value)}
                />
              </div>
              <textarea
                className={inputBase + " h-16 resize-none"}
                placeholder="Description"
                value={service.description}
                onChange={e => updateService(service.id, 'description', e.target.value)}
              />
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
              <div className="grid grid-cols-3 gap-2">
                {(service.images || []).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => removeServiceImage(service.id, idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(service.images || []).length < 3 && (
                  <button
                    type="button"
                    onClick={() => addServiceImage(service)}
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