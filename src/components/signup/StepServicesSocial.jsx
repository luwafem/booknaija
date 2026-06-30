// src/components/signup/StepServicesSocial.jsx
export default function StepServicesSocial({
  formValues,
  handleChange,
  currentTypeFeatures,
  inputBase,
  selectBase,
  sectionTitle,
  sectionDesc,
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
      {!currentTypeFeatures?.propertiesEnabled && (
        <div>
          <p className={sectionTitle}>Services offered</p>
          <div className="relative">
            <select
              name="num_services"
              value={formValues.num_services}
              onChange={handleChange}
              className={selectBase}
            >
              <option value="" disabled>Select range</option>
              <option value="1-2">1 - 2 services</option>
              <option value="3-5">3 - 5 services</option>
              <option value="6-10">6 - 10 services</option>
              <option value="10+">More than 10</option>
            </select>
            <ChevronDown />
          </div>
        </div>
      )}

      {!currentTypeFeatures?.propertiesEnabled && (
        <div>
          <p className={sectionTitle}>Do you sell products?</p>
          <p className={sectionDesc}>
            {currentTypeFeatures?.productsEnabled
              ? 'Your business type typically sells products. Override if needed.'
              : 'Your business type typically doesn\'t sell products. Enable if you do.'}
          </p>
          <div className="relative">
            <select
              name="has_products"
              value={formValues.has_products}
              onChange={handleChange}
              className={selectBase}
            >
              <option value="" disabled>Select option</option>
              <option value="Yes">Yes, I sell products</option>
              <option value="No">No, services only</option>
            </select>
            <ChevronDown />
          </div>
        </div>
      )}

      {currentTypeFeatures?.propertiesEnabled && (
        <div className="bg-zinc-900/20 border border-zinc-500/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-zinc-300 mb-1">Property Listings Setup</p>
          <p className="text-xs text-zinc-400">You'll add your properties, images, and pricing details after payment in the setup wizard.</p>
        </div>
      )}

      <div className="pt-2">
        <p className={sectionTitle}>Social links</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.948-.073-3.259 0-3.668.014-4.948.072-4.354.2-6.782 2.618-6.979 6.98-.059 1.28-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072zM12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5zm5.843-8.843a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
          </svg>
        </div>
        <input
          name="instagram_link"
          value={formValues.instagram_link}
          onChange={handleChange}
          placeholder="Instagram (optional)"
          className={`${inputBase} pl-11`}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.16V11.7a4.81 4.81 0 01-3.77-1.84V6.69h3.77z" />
          </svg>
        </div>
        <input
          name="tiktok_link"
          value={formValues.tiktok_link}
          onChange={handleChange}
          placeholder="TikTok (optional)"
          className={`${inputBase} pl-11`}
        />
      </div>

      <input
        name="other_socials"
        value={formValues.other_socials}
        onChange={handleChange}
        placeholder="Website / other (optional)"
        className={inputBase}
      />

      <input
        name="referral_code"
        value={formValues.referral_code}
        onChange={handleChange}
        placeholder="Referral code (optional)"
        className={`${inputBase} uppercase`}
      />
    </div>
  );
}