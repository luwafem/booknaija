// src/components/signup/StepPayout.jsx
export default function StepPayout({
  formValues,
  handleChange,
  consent,
  setConsent,
  banks,
  banksLoading,
  error,
  inputBase,
  selectBase,
  labelBase,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelBase}>Account name *</label>
        <input
          required
          name="account_name"
          value={formValues.account_name}
          onChange={handleChange}
          placeholder="As it appears on your bank account"
          className={inputBase}
        />
      </div>

      <div>
        <label className={labelBase}>Bank *</label>
        <div className="relative">
          <select
            required
            name="settlement_bank"
            value={formValues.settlement_bank}
            onChange={handleChange}
            disabled={banksLoading}
            className={`${selectBase} ${banksLoading ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : ''}`}
          >
            <option value="" disabled className="bg-zinc-800">
              {banksLoading ? 'Loading banks...' : 'Select your bank'}
            </option>
            {banks.map((bank, index) => (
              <option key={`${bank.code}-${index}`} value={bank.code} className="bg-zinc-800">
                {bank.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-400">
            {banksLoading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className={labelBase}>Account number *</label>
        <input
          required
          name="account_number"
          value={formValues.account_number}
          onChange={handleChange}
          placeholder="10 digits"
          maxLength={10}
          pattern="[0-9]{10}"
          inputMode="numeric"
          className={`${inputBase} font-mono tracking-wider`}
        />
      </div>

      {/* Policy notice */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mt-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-zinc-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200 mb-1">Payment Policy</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Payments via <span className="font-medium text-white">Paystack</span>. Payouts process within 24 hours on
              business days. Weekend/holiday payments settle next working day.
            </p>
          </div>
        </div>
        <label className="flex items-start gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-700 text-white focus:ring-zinc-500 cursor-pointer"
          />
          <span className="text-xs font-medium text-zinc-300">
            I understand payout timing and weekend delays.
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-3">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}