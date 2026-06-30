// src/components/signup/StepBusinessInfo.jsx
export default function StepBusinessInfo({
  formValues,
  handleChange,
  currentTypeFeatures,
  inputBase,
  selectBase,
  labelBase,
}) {
  const ChevronDown = () => (
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className={labelBase}>Business name *</label>
        <input
          required
          name="business_name"
          value={formValues.business_name}
          onChange={handleChange}
          placeholder="e.g. Braid Gallery"
          className={inputBase}
        />
      </div>
      <div>
        <label className={labelBase}>Email address *</label>
        <input
          required
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={inputBase}
        />
      </div>
      <div>
        <label className={labelBase}>Phone number *</label>
        <input
          required
          name="phone"
          value={formValues.phone}
          onChange={handleChange}
          placeholder="0801 234 5678"
          className={inputBase}
        />
      </div>
      <div>
        <label className={labelBase}>Business type *</label>
        <div className="relative">
          <select
            required
            name="business_type"
            value={formValues.business_type}
            onChange={handleChange}
            className={selectBase}
          >
            <option value="" disabled>Select type</option>
            <option value="Lash Artist">Lash Artist</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Tutor">Tutor</option>
            <option value="Hair Stylist">Hair Stylist</option>
            <option value="Makeup Artist">Makeup Artist</option>
            <option value="Nail Technician">Nail Technician</option>
            <option value="Skin Care">Skin Care / Facialist</option>
            <option value="Fashion">Fashion / Boutique</option>
            <option value="Restaurant">Restaurant / Food</option>
            <option value="Auto">Auto Dealer / Rental</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Shortlet">Shortlet / Airbnb</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown />
        </div>
      </div>

      {currentTypeFeatures && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 mt-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Based on your business type, your page will include:
          </p>
          <div className="flex flex-wrap gap-2">
            {currentTypeFeatures.servicesEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Services
              </span>
            )}
            {currentTypeFeatures.productsEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Products
              </span>
            )}
            {currentTypeFeatures.carsEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Car Listings
              </span>
            )}
            {currentTypeFeatures.foodEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Food Ordering
              </span>
            )}
            {currentTypeFeatures.propertiesEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Property Listings
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}