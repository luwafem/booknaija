// src/pages/Signup.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [subaccountCode, setSubaccountCode] = useState(null);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [brandColor, setBrandColor] = useState('#c8a97e');
  const [logoUrl, setLogoUrl] = useState('');
  const [businessData, setBusinessData] = useState(null);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const referralParam = params.get('ref');

  const CLOUD_NAME = 'deexaiik4'; 
  const UPLOAD_PRESET = 'BizUploads'; 

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
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const openUploadWidget = () => {
    if (!window.cloudinary) {
      alert('Image upload widget is still loading, please wait a moment.');
      return;
    }
    const widget = window.cloudinary.createUploadWidget({
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      maxFiles: 1,
    }, (error, result) => {
      if (!error && result.event === "success") {
        setLogoUrl(result.info.secure_url);
      }
    });
    widget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.target;
    const formData = new FormData(form);

    const businessName = formData.get('business_name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const businessType = formData.get('business_type');
    const referralCode = formData.get('referral_code');
    const settlementBank = formData.get('settlement_bank');
    const accountNumber = formData.get('account_number');
    const accountName = formData.get('account_name');
    const colorToUse = brandColor || '#c8a97e';
    
    const businessSlug = generateSlug(businessName);

    let finalSubaccountCode = null;

    try {
      const subaccountRes = await fetch('/.netlify/functions/create-subaccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          settlement_bank: settlementBank,
          account_number: accountNumber,
          percentage_charge: 5,
          primary_contact_name: accountName || businessName,
          primary_contact_email: email,
          primary_contact_phone: phone,
        }),
      });

      const subaccountData = await subaccountRes.json();

      if (!subaccountRes.ok || !subaccountData.subaccount_code) {
        console.error('Subaccount creation failed:', subaccountData.error);
        setError(subaccountData.error || 'Could not verify bank details. Your application will still be reviewed.');
      } else {
        finalSubaccountCode = subaccountData.subaccount_code;
        setSubaccountCode(finalSubaccountCode);
      }
    } catch (err) {
      console.error("Error creating subaccount", err);
    }

    const codeForHeader = finalSubaccountCode || 'ACCT_PENDING';

    // Subaccount created, proceed to onboarding
    setDone(true);
    setBusinessData({ 
      businessName, 
      businessSlug, 
      email,
      phone,
      whatsapp: formData.get('whatsapp_number'),
      businessType,
      subaccountCode: codeForHeader,
      brandColor: colorToUse,
      logoUrl,
      bio: formData.get('business_description'),
      location: formData.get('business_address'),
      instagram: formData.get('instagram_link'),
      tiktok: formData.get('tiktok_link'),
      referralCode,
      referredBy: referralCode  // Add this for the backend to track
    });
    
    setLoading(false);
  };

  const inputBase = "w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all duration-200";
  const selectBase = "w-full appearance-none bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-purple-600 transition-all duration-200 cursor-pointer";
  const sectionTitle = "text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-6";
  const sectionDesc = "text-xs text-zinc-400 mb-3 -mt-1";

  if (done) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 relative">
        <div className="relative z-10 text-center max-w-sm bg-white border border-zinc-200 p-10 rounded-2xl">
          <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">You're on the list!</h2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            We've received your details. Now let's set up your products and services.
          </p>
          {subaccountCode && subaccountCode !== 'ACCT_PENDING' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-green-700 font-medium mb-1">Payment Setup Verified</p>
              <p className="text-xs text-green-600">
                Your account code: <span className="font-mono font-bold">{subaccountCode}</span>
              </p>
            </div>
          )}
          {error && (!subaccountCode || subaccountCode === 'ACCT_PENDING') && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-700">{error}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/onboarding', { state: businessData })}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
          >
            Continue to Setup Details
          </button>
          
          <div className="mt-4">
             <Link to="/" className="inline-flex items-center justify-center w-full text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200 font-medium">
               <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7 7h18" />
               </svg>
               Back to Home
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 py-12 relative">
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md bg-white border border-zinc-200 p-8 rounded-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">List your business</h2>
          <p className="text-zinc-500 text-sm mt-2">Join other Nigerian professionals.</p>
        </div>

        <div className="space-y-4">
          <input required name="business_name" placeholder="Business name" className={inputBase} />
          <input required type="email" name="email" placeholder="Email address" className={inputBase} />
          <input required name="phone" placeholder="Phone number (e.g. 0801...)" className={inputBase} />
          
          <div className="relative">
            <select required name="business_type" defaultValue="" className={selectBase}>
              <option value="" disabled>Business type</option>
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
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="pt-2">
            <p className={sectionTitle}>Business Profile</p>
            <p className={sectionDesc}>Tell your future customers about your business.</p>
          </div>

          <textarea required name="business_description" placeholder="Briefly describe what you do, your experience, and what makes you unique..." className={`${inputBase} h-24 resize-none`} />
          <input required name="business_address" placeholder="Business address (e.g. Lekki Phase 1, Lagos)" className={inputBase} />
          <input required name="whatsapp_number" placeholder="WhatsApp number (e.g. 2348012345678)" className={inputBase} />

          <div className="pt-2">
            <p className={sectionTitle}>Visual Assets</p>
            <p className={sectionDesc}>Upload your business logo (Square image).</p>
          </div>

          <div onClick={openUploadWidget} className="w-full aspect-video bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all relative overflow-hidden group">
             {logoUrl ? (
                <img src={logoUrl} className="w-full h-full object-contain p-2" alt="Logo Preview" />
             ) : (
                <>
                   <svg className="w-8 h-8 text-zinc-400 mb-2 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   <span className="text-xs text-zinc-500 font-medium">Upload Logo</span>
                </>
             )}
          </div>
          {logoUrl && (
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Remove Logo
              </button>
            </div>
          )}

          <div className="pt-2">
            <p className={sectionTitle}>Brand Aesthetics</p>
            <p className={sectionDesc}>Choose your brand color or paste a Hex code.</p>
          </div>
          
          <div 
            className={`flex items-center border-2 rounded-xl p-1.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-zinc-100 bg-white`}
            style={{ borderColor: brandColor }}
          >
            <div className="relative w-12 h-10 rounded-lg overflow-hidden cursor-pointer shrink-0 shadow-sm border border-zinc-200 ml-1">
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
                    if (!val.startsWith('#') && val.length > 0) {
                        val = '#' + val;
                    }
                    if (/^#([0-9A-F]{0,6})$/i.test(val)) {
                        setBrandColor(val);
                    }
                  }}
                  maxLength="7"
                  placeholder="RRGGBB"
                  className="w-full h-10 bg-transparent text-sm font-mono font-bold text-zinc-800 focus:outline-none uppercase placeholder-zinc-400"
               />
            </div>
          </div>

          <div className="pt-2">
            <p className={sectionTitle}>Services & Products</p>
            <p className={sectionDesc}>If applicable, tell us what you offer.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select name="num_services" defaultValue="" className={selectBase}>
                <option value="" disabled>Services (Optional)</option>
                <option value="1-2">1 - 2</option>
                <option value="3-5">3 - 5</option>
                <option value="6-10">6 - 10</option>
                <option value="10+">More than 10</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select name="has_products" defaultValue="" className={selectBase}>
                <option value="" disabled>Products (Optional)</option>
                <option value="Yes">Yes, I sell products</option>
                <option value="No">No, services only</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className={sectionTitle}>Online Presence</p>
            <p className={sectionDesc}>Links to your social media pages.</p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.948-.073-3.259 0-3.668.014-4.948.072-4.354.2-6.782 2.618-6.979 6.98-.059 1.28-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072zM12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5zm5.843-8.843a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
              </svg>
            </div>
            <input name="instagram_link" placeholder="Instagram link (optional)" className={`${inputBase} pl-11`} />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.16V11.7a4.81 4.81 0 01-3.77-1.84V6.69h3.77z"/>
              </svg>
            </div>
            <input name="tiktok_link" placeholder="TikTok link (optional)" className={`${inputBase} pl-11`} />
          </div>

          <input name="other_socials" placeholder="Other socials / Website (optional)" className={inputBase} />

          <div className="pt-2">
            <p className={sectionTitle}>Payout Details</p>
            <p className={sectionDesc}>Where should we send your earnings?</p>
          </div>

          <input required name="account_name" placeholder="Account name (as on bank account)" className={inputBase} />

          <div className="relative">
            <select required name="settlement_bank" disabled={banksLoading} defaultValue="" className={`${selectBase} ${banksLoading ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed' : 'text-zinc-900'}`}>
              <option value="" disabled>
                {banksLoading ? 'Loading banks...' : 'Select your bank'}
              </option>
              {banks.map((bank, index) => (
                <option key={`${bank.code}-${index}`} value={bank.code}>
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

          <input required name="account_number" placeholder="10-digit account number" maxLength={10} pattern="[0-9]{10}" inputMode="numeric" className={`${inputBase} font-mono tracking-wider`} />
          
          <input name="referral_code" placeholder="Referral Code (Optional)" defaultValue={referralParam} className={`${inputBase} uppercase`} />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-amber-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 mb-1">Payment Processing Policy</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  All payments are processed securely via <span className="font-bold">Paystack</span>. Payouts typically process within 24 hours on business days. Please note that payments made on <span className="font-bold">weekends or public holidays</span> will be settled on the next working day.
                </p>
              </div>
            </div>
            
            <label className="flex items-start gap-2 mt-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={consent} 
                onChange={(e) => setConsent(e.target.checked)} 
                required 
                name="paystack_consent" 
                className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer" 
              />
              <span className="text-xs font-medium text-amber-800 group-hover:text-amber-900">
                I understand that payouts can take up to 24 hours, and are paused over weekends and public holidays.
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !consent} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 mt-2 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting Application...
              </span>
            ) : (
              'Get Started'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200 font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}