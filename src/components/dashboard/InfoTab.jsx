// src/components/dashboard/InfoTab.jsx
import ImageUploadArea from './ImageUploadArea';

export default function InfoTab({
  biz,
  setField,
  accent,
  banks,
  resolveBankCode,
  resolveBankName,
  isExpired,
  isWarning,
  daysLeft,
  subLoading,
  subMsg,
  handlePaySubscription,
  bankUpdating,
  bankUpdateError,
  bankUpdateSuccess,
  bankName,
  setBankName,
  bankCode,
  setBankCode,
  bankAcc,
  setBankAcc,
  handleUpdateBank,
  handleCopyReferralLink,
  copied,
  handleCopyPageUrl,
  urlCopied,
  handleNameClick,
  referralCount,
  freeMonthsEarned,
  setShowMapPicker,
  mapsClaimed,
  mapsReadiness,
  handleLogoUpload,
  inp,
  sel,
  lbl,
  card,
}) {
  const referralUrl = window.location.origin + '/signup?ref=' + biz.slug;
  const pageUrl = window.location.origin + '/' + biz.slug;
  const hasPreciseLocation = biz.lat && biz.lng;
  const currentSettlementBankCode = resolveBankCode(biz.settlementBank);
  const currentSettlementBankName = resolveBankName(biz.settlementBank);

  return (
    <div className="space-y-6">
      {/* ── SUBSCRIPTION STATUS ── */}
      {(isExpired || isWarning) && (
        <div className={`rounded-2xl p-5 sm:p-6 text-white ${isExpired ? 'bg-red-600' : 'bg-amber-500'}`}>
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {isExpired ? 'Your Page is Inactive' : `Subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
              </h3>
              <p className="text-sm opacity-90 mt-1 leading-relaxed">
                {isExpired
                  ? 'Your bio-link is currently hidden. Pay now to reactivate it instantly.'
                  : 'Pay now to avoid losing access to your store and bookings.'}
              </p>
            </div>
          </div>
          {subMsg && <p className="text-sm font-medium bg-white/20 rounded-xl px-4 py-2.5 mb-3 text-center">{subMsg}</p>}
          <button
            type="button"
            onClick={handlePaySubscription}
            disabled={subLoading}
            className="w-full bg-white text-zinc-900 font-bold py-3.5 rounded-full hover:bg-zinc-100 transition-all duration-300 active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 text-[11px] tracking-[0.15em] uppercase"
          >
            {subLoading ? 'Processing...' : `Pay ₦2,500 for Next Month`}
          </button>
        </div>
      )}

      {/* ── BANK VERIFICATION (if pending) ── */}
      {(biz.subaccount_code === 'ACCT_PENDING' || !biz.subaccount_code) && (
        <div className={card}>
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-shrink-0 w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Payout Details Required</h3>
              <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">
                Your bank verification failed during signup. You won't receive payouts until this is fixed.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className={lbl}>Account Name</label>
              <input className={inp} placeholder="As on bank account" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Bank</label>
              <select className={sel} value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
                <option value="" disabled className="bg-zinc-900">Select your bank</option>
                {/* ✅ Fixed: added idx to key */}
                {banks.map((b, idx) => (
                  <option key={b.code + '-' + idx} value={b.code} className="bg-zinc-900">{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Account Number</label>
              <input
                className={inp + " font-mono tracking-wider"}
                placeholder="10-digit number"
                maxLength={10}
                value={bankAcc}
                onChange={(e) => setBankAcc(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          {bankUpdateError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-[11px] text-red-400">{bankUpdateError}</p>
            </div>
          )}
          {bankUpdateSuccess && (
            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[11px] text-emerald-400">Bank details verified! Refreshing...</p>
            </div>
          )}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleUpdateBank}
              disabled={bankUpdating || !bankName || !bankCode || !bankAcc}
              className="flex-1 bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition-all duration-300 active:scale-[0.98] disabled:bg-white/[0.06] disabled:text-zinc-500 text-[11px] tracking-[0.15em] uppercase"
            >
              {bankUpdating ? 'Verifying...' : 'Verify Bank Details'}
            </button>
            <a
              href="mailto:support@booknaija.com"
              className="flex-1 bg-white/[0.03] text-zinc-300 font-bold py-3 rounded-full border border-white/[0.06] text-center hover:bg-white/[0.06] transition-all duration-300 active:scale-[0.98] text-[11px] tracking-[0.15em] uppercase"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}

      {/* ── BANK TRANSFER DETAILS ── */}
      <div className={card}>
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
            <svg className="w-5 h-5" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Bank Transfer Details</h3>
            <p className="text-[13px] text-zinc-400 mt-0.5 leading-relaxed">
              Shown to customers who choose "Bank Transfer" as payment method.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className={lbl}>Account Name</label>
            <input
              className={inp}
              placeholder="e.g. Oluwafemi Emmanuel Ayedogbon"
              value={biz.accountName || ''}
              onChange={(e) => setField('accountName', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Bank</label>
              <select
                className={sel}
                value={currentSettlementBankCode}
                onChange={(e) => {
                  const selectedBank = banks.find((b) => b.code === e.target.value);
                  setField('settlementBank', selectedBank ? selectedBank.name : e.target.value);
                }}
              >
                <option value="" disabled className="bg-zinc-900">Select bank</option>
                {/* ✅ Fixed: added idx to key */}
                {banks.map((b, idx) => (
                  <option key={b.code + '-' + idx} value={b.code} className="bg-zinc-900">{b.name}</option>
                ))}
              </select>
              {!currentSettlementBankCode && biz.settlementBank && (
                <p className="text-[10px] text-zinc-500 mt-1">Current: {biz.settlementBank}</p>
              )}
            </div>
            <div>
              <label className={lbl}>Account Number</label>
              <input
                className={inp + " font-mono tracking-wider"}
                placeholder="10-digit number"
                maxLength={10}
                value={biz.accountNumber || ''}
                onChange={(e) => setField('accountNumber', e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
        </div>

        {biz.accountName && biz.accountNumber && biz.settlementBank && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">Bank transfer option is active on your booking page</p>
          </div>
        )}
        {(!biz.accountName || !biz.accountNumber || !biz.settlementBank) && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-[10px] text-amber-400 font-semibold tracking-wide">Fill in all 3 fields to enable bank transfers</p>
          </div>
        )}
      </div>

      {/* ── GOOGLE MAPS SECTION ── */}
      {!mapsClaimed && (
        <div className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight leading-tight">Get on Google Maps</h3>
                  <span className="px-2 py-0.5 bg-yellow-500 text-yellow-900 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] rounded-full whitespace-nowrap">+40% Traffic</span>
                </div>
                <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">Show up in "near me" searches</p>
              </div>
            </div>
            {!mapsReadiness.ready ? (
              <div className="bg-white/15 rounded-xl p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs font-semibold text-yellow-300 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Add these to enable setup:
                </p>
                <div className="space-y-1.5">
                  {mapsReadiness.issues.map((issue) => (
                    <div key={issue} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-yellow-400 rounded-full flex-shrink-0" />
                      <span className="text-xs text-emerald-50">{issue}</span>
                      <a href="#info-fields" className="text-yellow-300 hover:text-yellow-200 text-[10px] font-medium underline ml-auto transition-colors duration-300">Edit →</a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => window.open('https://business.google.com/create?hl=en', '_blank')}
                  className="w-full bg-white text-emerald-700 font-bold py-3 sm:py-3.5 px-4 rounded-full text-sm sm:text-base hover:bg-emerald-50 transition-all duration-300 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2.5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Add to Google Maps
                </button>
                <p className="text-[10px] text-emerald-200/80 text-center mt-2 px-2">Copy your website URL below • Free • ~2 mins</p>
              </div>
            )}
          </div>
        </div>
      )}

      {mapsClaimed && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-emerald-300 tracking-tight mb-0.5">On Google Maps</h3>
              <p className="text-[11px] text-emerald-400 leading-relaxed">"{biz.name} near me" searches will show your listing</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name + ' ' + (biz.location || ''))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-medium transition-colors duration-300 hover:opacity-70"
                  style={{ color: accent }}
                >
                  View on Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BUSINESS INFORMATION ─── */}
      <div id="info-fields" className={card}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-white tracking-tight">Business Information</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Referrals</span>
              <span className="text-xs font-medium text-white">{referralCount}</span>
              {freeMonthsEarned > 0 && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${accent}20`, color: accent }}>
                  {freeMonthsEarned} free
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.06]">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 transition-all duration-300 hover:scale-105"
            style={{ boxShadow: `0 0 0 1px ${accent}40` }}
            onClick={handleLogoUpload}
          >
            {biz.logo ? (
              <img src={biz.logo} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base font-light" style={{ backgroundColor: `${accent}15`, color: accent }}>
                {biz.name ? biz.name.charAt(0) : '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-lg font-medium text-white cursor-pointer hover:opacity-70 transition-opacity duration-300 truncate"
              onClick={handleNameClick}
            >
              {biz.name || 'Untitled Business'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Click name 3× to toggle feature switches</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={lbl}>Business Name</label>
            <input
              className={inp}
              placeholder="e.g. Ayedogbon Properties"
              value={biz.name || ''}
              onChange={(e) => setField('name', e.target.value)}
            />
          </div>

          <div>
            <label className={lbl}>Bio / Description</label>
            <textarea
              className={inp + " min-h-[100px] resize-y"}
              placeholder="Tell customers about your business..."
              value={biz.bio || ''}
              onChange={(e) => setField('bio', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Phone (WhatsApp)</label>
              <input
                className={inp}
                placeholder="e.g. 08012345678"
                value={biz.phone || ''}
                onChange={(e) => setField('phone', e.target.value)}
              />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input
                className={inp}
                type="email"
                placeholder="e.g. hello@example.com"
                value={biz.email || ''}
                onChange={(e) => setField('email', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={lbl}>Location</label>
            <div className="flex gap-2">
              <input
                className={inp + " flex-1"}
                placeholder="e.g. Lekki, Lagos"
                value={biz.location || ''}
                onChange={(e) => setField('location', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="px-4 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] whitespace-nowrap flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Map
              </button>
            </div>
            {hasPreciseLocation && (
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Precise location set
              </p>
            )}
          </div>

          <div>
            <label className={lbl}>Business Type</label>
            <select
              className={sel}
              value={biz.businessType || ''}
              onChange={(e) => setField('businessType', e.target.value)}
            >
              <option value="" className="bg-zinc-900">Select type</option>
              <option value="Shortlet" className="bg-zinc-900">Shortlet</option>
              <option value="Service" className="bg-zinc-900">Service</option>
              <option value="Product" className="bg-zinc-900">Product</option>
              <option value="Food" className="bg-zinc-900">Food / Restaurant</option>
              <option value="Car Rental" className="bg-zinc-900">Car Rental</option>
              <option value="Property" className="bg-zinc-900">Property</option>
            </select>
          </div>

          <div>
            <label className={lbl}>Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={biz.accent || '#c8a97e'}
                onChange={(e) => setField('accent', e.target.value)}
                className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent"
              />
              <input
                className={inp + " flex-1 font-mono text-xs tracking-wider"}
                value={biz.accent || '#c8a97e'}
                onChange={(e) => setField('accent', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={lbl}>Social Links</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[11px] w-20 flex-shrink-0">Instagram</span>
                <input
                  className={inp}
                  placeholder="https://instagram.com/..."
                  value={(biz.socials || {}).instagram || ''}
                  onChange={(e) => setField('socials', { ...biz.socials, instagram: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[11px] w-20 flex-shrink-0">TikTok</span>
                <input
                  className={inp}
                  placeholder="https://tiktok.com/..."
                  value={(biz.socials || {}).tiktok || ''}
                  onChange={(e) => setField('socials', { ...biz.socials, tiktok: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SHARE LINKS ─── */}
      <div className={card}>
        <h3 className="text-sm font-bold text-white tracking-tight mb-4">Share Links</h3>
        <div className="space-y-3">
          <div>
            <label className={lbl}>Referral Link</label>
            <div className="flex gap-2">
              <input className={inp + " flex-1 text-xs font-mono"} value={referralUrl} readOnly />
              <button
                type="button"
                onClick={handleCopyReferralLink}
                className="px-5 py-3 text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] whitespace-nowrap"
                style={{
                  backgroundColor: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                  color: copied ? '#10b981' : '#fff',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">
              {3 - (referralCount % 3)} more referral{3 - (referralCount % 3) !== 1 ? 's' : ''} until next free month
            </p>
          </div>
          <div>
            <label className={lbl}>Page URL</label>
            <div className="flex gap-2">
              <input className={inp + " flex-1 text-xs font-mono"} value={pageUrl} readOnly />
              <button
                type="button"
                onClick={handleCopyPageUrl}
                className="px-5 py-3 text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] whitespace-nowrap"
                style={{
                  backgroundColor: urlCopied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                  color: urlCopied ? '#10b981' : '#fff',
                }}
              >
                {urlCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}