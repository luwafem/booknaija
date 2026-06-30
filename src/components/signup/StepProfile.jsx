// src/components/signup/StepProfile.jsx
export default function StepProfile({
  formValues,
  handleChange,
  inputBase,
  labelBase,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelBase}>Business description *</label>
        <textarea
          required
          name="business_description"
          value={formValues.business_description}
          onChange={handleChange}
          placeholder="Briefly describe what you do, your experience, and what makes you unique..."
          className={`${inputBase} h-24 resize-none`}
        />
      </div>
      <div>
        <label className={labelBase}>Business address *</label>
        <input
          required
          name="business_address"
          value={formValues.business_address}
          onChange={handleChange}
          placeholder="e.g. Lekki Phase 1, Lagos"
          className={inputBase}
        />
      </div>
      <div>
        <label className={labelBase}>WhatsApp number *</label>
        <input
          required
          name="whatsapp_number"
          value={formValues.whatsapp_number}
          onChange={handleChange}
          placeholder="2348012345678"
          className={inputBase}
        />
      </div>
    </div>
  );
}