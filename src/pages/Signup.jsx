import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [brandColor, setBrandColor] = useState('#c8a97e');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [params] = useSearchParams();
  const referralParam = params.get('ref');

  const CLOUD_NAME = 'deexaiik4';
  const UPLOAD_PRESET = 'BizUploads';

  const steps = [
    { id: 1, title: 'Business Info', desc: 'Basic details' },
    { id: 2, title: 'Profile', desc: 'About your business' },
    { id: 3, title: 'Branding', desc: 'Logo & colors' },
    { id: 4, title: 'Services', desc: 'What you offer' },
    { id: 5, title: 'Payout', desc: 'Get paid' },
  ];

  // ── All form values live in state so they survive step changes ──
  const [formValues, setFormValues] = useState({
    business_name: '',
    email: '',
    phone: '',
    business_type: '',
    business_description: '',
    business_address: '',
    whatsapp_number: '',
    num_services: '',
    has_products: '',
    instagram_link: '',
    tiktok_link: '',
    other_socials: '',
    referral_code: referralParam || '',
    account_name: '',
    settlement_bank: '',
    account_number: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch('/.netlify/functions/list-banks');
        const data = await res.json();
        if (Array.isArray(data)) {
          setBanks(data);
        }
      } catch (err) {
        console.error('Failed to load banks:', err);
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();

    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const generateSlug = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const openUploadWidget = () => {
    if (!window.cloudinary) {
      alert('Image upload widget is still loading, please wait a moment.');
      return;
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
      },
      (error, result) => {
        if (!error && result.event === 'success') {
          setLogoUrl(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!formValues.business_name.trim()) { setError('Business name is required.'); return false; }
      if (!formValues.email.trim()) { setError('Email is required.'); return false; }
      if (!formValues.phone.trim()) { setError('Phone number is required.'); return false; }
      if (!formValues.business_type) { setError('Please select a business type.'); return false; }
    }
    if (step === 2) {
      if (!formValues.business_description.trim()) { setError('Business description is required.'); return false; }
      if (!formValues.business_address.trim()) { setError('Business address is required.'); return false; }
      if (!formValues.whatsapp_number.trim()) { setError('WhatsApp number is required.'); return false; }
    }
    if (step === 5) {
      if (!formValues.account_name.trim()) { setError('Account name is required.'); return false; }
      if (!formValues.settlement_bank) { setError('Please select a bank.'); return false; }
      if (!/^[0-9]{10}$/.test(formValues.account_number)) { setError('Account number must be exactly 10 digits.'); return false; }
      if (!consent) { setError('Please accept the payment policy.'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length) setCurrentStep((c) => c + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 1) setCurrentStep((c) => c - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper: fetch with timeout to prevent hanging
  const fetchWithTimeout = async (url, options, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(5)) return;

    setLoading(true);
    setError('');

    const {
      business_name,
      email,
      phone,
      business_type,
      settlement_bank,
      account_number,
      account_name,
      whatsapp_number,
      business_description,
      business_address,
      instagram_link,
      tiktok_link,
    } = formValues;

    const colorToUse = brandColor || '#c8a97e';
    const businessSlug = generateSlug(business_name);
    const signupAmount = 2500;

    if (!businessSlug) {
      setError('Business name is missing. Please go back to Step 1.');
      setLoading(false);
      return;
    }

    let finalSubaccountCode = null;

    try {
      // 1. Create subaccount with timeout
      const subaccountRes = await fetchWithTimeout(
        '/.netlify/functions/create-subaccount',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name,
            settlement_bank,
            account_number,
            percentage_charge: 5,
            primary_contact_name: account_name || business_name,
            primary_contact_email: email,
            primary_contact_phone: phone,
          }),
        },
        15000
      );

      if (!subaccountRes.ok) {
        const errData = await subaccountRes.json().catch(() => ({}));
        console.error('Subaccount creation failed:', errData.error || subaccountRes.statusText);
        finalSubaccountCode = 'ACCT_PENDING';
      } else {
        const subaccountData = await subaccountRes.json();
        finalSubaccountCode = subaccountData.subaccount_code || 'ACCT_PENDING';
      }
    } catch (err) {
      console.error('Error creating subaccount:', err.message);
      finalSubaccountCode = 'ACCT_PENDING';
    }

    // 2. Look up the human-readable bank name from the bank code
    const selectedBank = banks.find((b) => b.code === settlement_bank);
    const settlementBankName = selectedBank ? selectedBank.name : settlement_bank;

    // 3. Save to localStorage (survives Paystack redirect)
    const tempBusinessData = {
      businessName: business_name,
      businessSlug,
      email,
      phone,
      whatsapp: whatsapp_number,
      businessType: business_type,
      subaccountCode: finalSubaccountCode,
      brandColor: colorToUse,
      logoUrl,
      bio: business_description,
      location: business_address,
      instagram: instagram_link,
      tiktok: tiktok_link,
      referredBy: referralParam,
      initialPaymentAmount: signupAmount,
      // ─── BANK DETAILS FOR ONBOARDING PRE-FILL ───
      accountName: account_name,
      accountNumber: account_number,
      settlementBank: settlementBankName,
      // ──────────────────────────────────────────────
    };

    localStorage.setItem(`pending_signup_${businessSlug}`, JSON.stringify(tempBusinessData));

    // 4. Initialize Payment with timeout
    try {
      const payRes = await fetchWithTimeout(
        '/.netlify/functions/initialize-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            amount: signupAmount,
            slug: businessSlug,
            referredBy: referralParam && referralParam.startsWith('aff_') ? referralParam : null,
            callback_url: `${window.location.origin}/onboarding?slug=${businessSlug}`,
          }),
        },
        20000
      );

      if (!payRes.ok) {
        const errData = await payRes.json().catch(() => ({}));
        throw new Error(errData.error || `Payment init failed: ${payRes.status}`);
      }

      const payData = await payRes.json();

      if (payData.authorization_url) {
        window.location.href = payData.authorization_url;
        return; // Don't set loading false - redirect handles it
      } else {
        throw new Error(payData.error || 'No authorization URL returned from Paystack.');
      }
    } catch (err) {
      console.error('Payment initialization error:', err.message);
      setError(
        err.message.includes('aborted')
          ? 'Request timed out. Please check your connection and try again.'
          : err.message || 'Failed to start payment. Please try again.'
      );
      setLoading(false);
    }
  };

  // High-contrast dark theme styles
  const inputBase =
    'w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200';
  const selectBase =
    'w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200 cursor-pointer';
  const sectionTitle = 'text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 mt-1';
  const sectionDesc = 'text-xs text-zinc-400 mb-3 -mt-1';
  const labelBase = 'block text-sm font-medium text-zinc-200 mb-1.5';

  const ChevronDown = () => (
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white">
      {/* Header - White background (matching landing page) */}
      <nav className="bg-white sticky top-0 z-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-9 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Manage Business
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold text-white bg-zinc-900 px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-xs text-zinc-500">{steps.find((s) => s.id === currentStep)?.title}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            {/* Step dots for mobile */}
            <div className="flex justify-center gap-1.5 mt-3 md:hidden">
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep) {
                      setError('');
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentStep === step.id ? 'bg-white w-4' : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  aria-label={`Go to step ${step.id}: ${step.title}`}
                />
              ))}
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Step Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
              <h2 className="text-lg font-bold text-white">{steps.find((s) => s.id === currentStep)?.title}</h2>
              <p className="text-sm text-zinc-400 mt-0.5">{steps.find((s) => s.id === currentStep)?.desc}</p>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Global error for any step */}
              {error && currentStep !== 5 && (
                <div className="bg-red-900/40 border border-red-700 rounded-xl p-3">
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* STEP 1: Business Info */}
              {currentStep === 1 && (
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
                        <option value="" disabled>
                          Select type
                        </option>
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
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Business Profile */}
              {currentStep === 2 && (
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
              )}

              {/* STEP 3: Branding */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <p className={sectionTitle}>Logo</p>
                    <p className={sectionDesc}>Upload a square image for best results.</p>
                    <div
                      onClick={openUploadWidget}
                      className="w-full aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 hover:bg-zinc-700/50 transition-all relative overflow-hidden group"
                    >
                      {logoUrl ? (
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <img src={logoUrl} className="max-w-full max-h-full object-contain" alt="Logo Preview" />
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-zinc-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-zinc-400 font-medium">Tap to upload</span>
                        </>
                      )}
                    </div>
                    {logoUrl && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoUrl('');
                          }}
                          className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className={sectionTitle}>Brand color</p>
                    <p className={sectionDesc}>Pick a color or enter a hex code.</p>
                    <div
                      className="flex items-center border rounded-xl p-1.5 transition-all bg-zinc-800"
                      style={{ borderColor: brandColor }}
                    >
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden cursor-pointer shrink-0 shadow-sm border border-zinc-700">
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                        />
                        <div className="w-full h-full pointer-events-none" style={{ backgroundColor: brandColor }}></div>
                      </div>
                      <div className="relative flex-1 mx-2">
                        <input
                          type="text"
                          name="brand_color"
                          value={brandColor}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                            if (/^#([0-9A-F]{0,6})$/i.test(val)) setBrandColor(val);
                          }}
                          maxLength="7"
                          placeholder="RRGGBB"
                          className="w-full h-10 bg-transparent text-sm font-mono font-bold text-white focus:outline-none uppercase placeholder-zinc-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Services & Social */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <p className={sectionTitle}>Services offered</p>
                    <div className="relative">
                      <select
                        name="num_services"
                        value={formValues.num_services}
                        onChange={handleChange}
                        className={selectBase}
                      >
                        <option value="" disabled>
                          Select range
                        </option>
                        <option value="1-2">1 - 2 services</option>
                        <option value="3-5">3 - 5 services</option>
                        <option value="6-10">6 - 10 services</option>
                        <option value="10+">More than 10</option>
                      </select>
                      <ChevronDown />
                    </div>
                  </div>

                  <div>
                    <p className={sectionTitle}>Do you sell products?</p>
                    <div className="relative">
                      <select
                        name="has_products"
                        value={formValues.has_products}
                        onChange={handleChange}
                        className={selectBase}
                      >
                        <option value="" disabled>
                          Select option
                        </option>
                        <option value="Yes">Yes, I sell products</option>
                        <option value="No">No, services only</option>
                      </select>
                      <ChevronDown />
                    </div>
                  </div>

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
              )}

              {/* STEP 5: Payout & Submit */}
              {currentStep === 5 && (
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
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
                        name="paystack_consent"
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
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-800/50 flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-white hover:bg-zinc-200 text-zinc-900 py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !consent}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    loading || !consent
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                      : 'bg-white hover:bg-zinc-200 text-zinc-900 hover:scale-[1.02]'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Pay ₦2,500 to Get Started'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer - White background (matching landing page) */}
      <footer className="bg-white border-t border-zinc-200 pt-12 pb-8 px-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <Link to="/" className="flex items-center">
                <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-10 w-auto object-contain" />
              </Link>
            </div>

            <div className="flex gap-10 text-sm">
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</p>
                <ul className="space-y-2">
                  <li>
                    <Link to="/#pricing" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/#features" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Sign Up
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Partners</p>
                <ul className="space-y-2">
                  <li>
                    <Link to="/affiliate-signup" className="text-zinc-700 font-medium hover:text-zinc-900 transition-colors">
                      Affiliate
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Company</p>
                <ul className="space-y-2">
                  <li>
                    <Link to="/blog" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row justify-between gap-4 items-center">
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
            <div className="flex gap-4 text-sm text-zinc-500">
              <Link to="/terms" className="hover:text-zinc-700 transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-zinc-700 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}