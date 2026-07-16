import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../lib/csrf'; // 👈 NEW

const securityQuestions = [
  "What is the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is your favorite food?"
];

// --- SANITIZATION HELPER ---
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
};

export default function AffiliateSignup() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState('');
  const [affiliateId, setAffiliateId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Sign In States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const navigate = useNavigate();

  const signupSteps = [
    { id: 1, title: 'Personal Info', desc: 'Your contact details' },
    { id: 2, title: 'Bank Details', desc: 'Where you get paid' },
    { id: 3, title: 'Security', desc: 'Protect your account' },
  ];

  useEffect(() => {
    fetch('/.netlify/functions/list-banks')
      .then(res => res.json())
      .then(data => setBanks(data || []))
      .catch(err => console.error(err));
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInLoading(true);
    setError('');
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      const res = await fetch('/.netlify/functions/affiliate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: sanitize(signInEmail),
          securityCode: sanitize(formData.get('sign_in_code')),
          securityQuestion: sanitize(formData.get('sign_in_question')),
          securityAnswer: sanitize(formData.get('sign_in_answer'))
        })
      });

      const data = await res.json();

      if (res.ok && data.affiliateId) {
        navigate(`/affiliate/dashboard/${data.affiliateId}`);
      } else {
        setError(data.error || 'Invalid details. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;
    const formData = new FormData(form);

    const q1 = sanitize(formData.get('security_question_1'));
    const q2 = sanitize(formData.get('security_question_2'));

    if (q1 === q2) {
      setError('Please choose two different security questions.');
      setLoading(false);
      return;
    }

    // Collect bank details for both subaccount and transfer recipient
    const settlementBankCode = sanitize(formData.get('settlement_bank'));
    const accountNumber = sanitize(formData.get('account_number'));
    const accountName = sanitize(formData.get('account_name'));
    const fullName = sanitize(formData.get('full_name'));
    const email = sanitize(formData.get('email'));
    const phone = sanitize(formData.get('phone'));

    // --- Step 1: Create Paystack Subaccount (split for 60% + 40%) ---
    // The subaccount is used for the initial 60% split (₦1,500) on the first payment.
    const subRes = await fetch('/.netlify/functions/create-subaccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: `Affiliate - ${fullName}`,
        settlement_bank: settlementBankCode,
        account_number: accountNumber,
        percentage_charge: 40, // Platform takes 40%, affiliate gets 60% (₦1,500)
        primary_contact_name: fullName,
        primary_contact_email: email,
        primary_contact_phone: phone,
      }),
    });

    const subData = await subRes.json();
    if (!subRes.ok || !subData.subaccount_code) {
      setError(subData.error || 'Failed to verify bank details.');
      setLoading(false);
      return;
    }

    const newAffId = `aff_${Date.now()}`;
    
    // --- Step 2: Save affiliate with all required fields ---
    // The backend will create a Transfer Recipient for the 40% (₦1,000) payment later.
    const saveRes = await fetch('/.netlify/functions/save-affiliate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(), // 👈 CSRF header added
      },
      body: JSON.stringify({
        affiliate_id: newAffId,
        name: fullName,
        email: email,
        phone: phone,
        subaccount_code: subData.subaccount_code,
        security_code: sanitize(formData.get('security_code')),
        security_question_1: q1,
        security_answer_1: sanitize(formData.get('security_answer_1')),
        security_question_2: q2,
        security_answer_2: sanitize(formData.get('security_answer_2')),
        // NEW FIELDS for Transfer Recipient
        settlement_bank: settlementBankCode,
        account_number: accountNumber,
        account_name: accountName,
      })
    });

    const saveData = await saveRes.json();
    
    if (!saveRes.ok) {
      if (saveRes.status === 409) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(saveData.error || 'Failed to save affiliate account. Please try again.');
      }
      setLoading(false);
      return;
    }

    setAffiliateId(newAffId);
    setDone(true);
    setLoading(false);
  };

  const nextStep = () => {
    if (currentStep < signupSteps.length) {
      setCurrentStep(c => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(c => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Dark theme input/select styles matching other pages
  const inputBase = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3.5 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200";
  const selectBase = "w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200 cursor-pointer";
  const labelBase = "block text-sm font-medium text-zinc-200 mb-1.5";
  const sectionTitle = "text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 mt-1";
  const sectionDesc = "text-xs text-zinc-400 mb-3 -mt-1";

  // --- SUCCESS STATE (Updated copy) ---
  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white flex items-center justify-center px-6 py-12">
        
        {/* Header */}
        <nav className="bg-white sticky top-0 z-50 border-b border-zinc-200 w-full absolute left-0">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-9 w-auto object-contain" />
            </Link>
            <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Back to Home
            </Link>
          </div>
        </nav>

        <div className="w-full max-w-md pt-20">
          <div className="bg-zinc-900 border border-zinc-800 p-8 sm:p-10 rounded-2xl text-center shadow-xl">
            <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You're In!</h2>
            <p className="text-zinc-400 text-sm mb-4">
              Share your unique link. When a vendor pays their ₦2,500, you get <span className="text-white font-bold">₦1,500 instantly</span>.
              If they stay subscribed for a second month, you'll receive another <span className="text-white font-bold">₦1,000</span>.
            </p>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-8">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Your Affiliate Link</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-bold text-white truncate flex-1 font-mono">booknaija.netlify.app/signup?ref={affiliateId}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(`https://booknaija.netlify.app/signup?ref=${affiliateId}`)}
                  className="text-xs bg-white text-zinc-900 px-3 py-2 rounded-lg font-bold shrink-0 hover:bg-zinc-200 transition-colors active:scale-95"
                >
                  Copy
                </button>
              </div>
            </div>

            <Link 
              to={`/affiliate/dashboard/${affiliateId}`}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-900 py-3.5 rounded-xl text-sm font-semibold block text-center transition-colors active:scale-95"
            >
              Go to Affiliate Dashboard
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-zinc-200 pt-10 pb-6 px-6 mt-12 w-full">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
          </div>
        </footer>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white flex flex-col">
      
      {/* Header */}
      <nav className="bg-white border-b border-zinc-200 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/fav-removebg.png" alt="Logo" className="h-9 w-auto object-contain" />
          </Link>
          <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7-7h18" />
            </svg>
            Back to BookNaija
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN - THE PITCH (Updated for 60%+40%) */}
        <div className="w-full lg:w-1/2 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-lg mx-auto w-full">
            
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-5">
              Turn your network into income.
            </h1>
            
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 sm:mb-12">
              Help Nigerian businesses upgrade from WhatsApp status to a professional online store. 
              You earn <span className="text-white font-bold">₦1,500 instantly</span> on the first payment 
              and <span className="text-white font-bold">₦1,000 more</span> if they stay for Month 2 — 
              that’s <span className="text-white font-bold">₦2,500 total</span> per referral!
            </p>

            {/* The Math - updated to show two payments */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12">
              <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 text-center">
                <p className="text-2xl sm:text-3xl font-black text-white">₦1,500</p>
                <p className="text-xs font-medium text-zinc-400 mt-2">Month 1 (Instant)</p>
              </div>
              <div className="bg-white p-5 rounded-xl text-center relative overflow-hidden">
                <p className="text-2xl sm:text-3xl font-black text-zinc-900">₦1,000</p>
                <p className="text-xs font-medium text-zinc-500 mt-2">Month 2 (Bonus)</p>
              </div>
            </div>

            {/* Updated Who To Refer List */}
            <div className="mb-10 sm:mb-12">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5">Who to refer</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  'Lash Artists', 
                  'Cleaners', 
                  'Tutors', 
                  'Hair Stylists', 
                  'Makeup Artists', 
                  'Nail Technicians', 
                  'Skincare & Facialists', 
                  'Fashion & Boutiques', 
                  'Restaurants & Food', 
                  'Auto Dealers & Rentals'
                ].map(function (item) {
                  return (
                    <div key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                      <div className="w-5 h-5 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-400 border-t border-zinc-800 pt-6">
              <p className="font-bold text-white">How do I get paid?</p>
              <p>
                <span className="text-white font-semibold">₦1,500</span> is sent to your bank instantly via Paystack split 
                when the vendor pays their first ₦2,500. If they stay active for a second month, 
                <span className="text-white font-semibold"> another ₦1,000</span> is automatically sent to your bank. 
                No monthly delays — we handle everything.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - THE FORM (unchanged, but passes all bank details) */}
        <div className="w-full lg:w-1/2 bg-zinc-950 p-8 sm:p-10 flex items-start justify-center pt-8 sm:pt-16 lg:pt-0 lg:items-center">
          <div className="w-full max-w-md">
            
            {/* Toggle Header */}
            <div className="flex border border-zinc-700 rounded-xl p-1 mb-6 bg-zinc-900">
              <button 
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); setCurrentStep(1); }}
                className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${isSignUp ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
              >
                Sign Up
              </button>
              <button 
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${!isSignUp ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
              >
                Sign In
              </button>
            </div>

            {/* Sign In Form (unchanged) */}
            {!isSignUp ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white mb-1">Welcome back</h2>
                  <p className="text-zinc-400 text-sm">Verify your security details to access your dashboard.</p>
                </div>
                
                <input 
                  required 
                  type="email" 
                  name="sign_in_email" 
                  placeholder="Email address" 
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className={inputBase} 
                />
                <input 
                  required 
                  name="sign_in_code" 
                  placeholder="4-Digit Security Code" 
                  maxLength={4}
                  type="password"
                  className={`${inputBase} font-mono tracking-widest`} 
                />
                
                <div className="pt-4 border-t border-zinc-800">
                  <select required name="sign_in_question" defaultValue="" className={selectBase}>
                    <option value="" disabled className="bg-zinc-800">Choose your security question</option>
                    {securityQuestions.map((q, i) => <option key={i} value={q} className="bg-zinc-800">{q}</option>)}
                  </select>
                  <input 
                    required 
                    name="sign_in_answer" 
                    placeholder="Your answer" 
                    className={`${inputBase} mt-3`} 
                  />
                </div>

                {error && <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 text-xs text-red-300">{error}</div>}

                <button 
                  type="submit" 
                  disabled={signInLoading} 
                  className="w-full bg-white hover:bg-zinc-200 text-zinc-900 py-3.5 rounded-xl text-sm font-semibold transition-colors disabled:bg-zinc-700 disabled:text-zinc-400 active:scale-95"
                >
                  {signInLoading ? 'Verifying...' : 'Access Dashboard'}
                </button>
              </form>
            ) : (
              /* Sign Up Form - STEPPED (unchanged but now passes all bank fields) */
              <form onSubmit={handleSignUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                
                {/* Progress Indicator */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-400">Step {currentStep} of {signupSteps.length}</span>
                    <span className="text-xs text-zinc-500">{signupSteps.find(s => s.id === currentStep)?.title}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / signupSteps.length) * 100}%` }}
                    />
                  </div>
                  {/* Mobile step dots */}
                  <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                    {signupSteps.map(step => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentStep === step.id ? 'bg-white w-4' : 'bg-zinc-700 hover:bg-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Step Header */}
                <div className="mb-5 pb-4 border-b border-zinc-800">
                  <h2 className="text-lg font-bold text-white">{signupSteps.find(s => s.id === currentStep)?.title}</h2>
                  <p className="text-sm text-zinc-400 mt-0.5">{signupSteps.find(s => s.id === currentStep)?.desc}</p>
                </div>

                {/* STEP 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelBase}>Full Name *</label>
                      <input required name="full_name" placeholder="e.g. Chioma Ade" className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Email address *</label>
                      <input required type="email" name="email" placeholder="you@example.com" className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Phone number *</label>
                      <input required name="phone" placeholder="0801 234 5678" className={inputBase} />
                    </div>
                  </div>
                )}

                {/* STEP 2: Bank Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <p className={sectionTitle}>Payout Bank Details</p>
                    <p className={sectionDesc}>We'll use these to send your ₦1,500 instantly and your ₦1,000 bonus later.</p>
                    <div>
                      <label className={labelBase}>Account Name *</label>
                      <input required name="account_name" placeholder="As it appears on your bank account" className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Bank *</label>
                      <select required name="settlement_bank" defaultValue="" className={selectBase}>
                        <option value="" disabled className="bg-zinc-800">Select your bank</option>
                        {banks.map((b, i) => <option key={i} value={b.code} className="bg-zinc-800">{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelBase}>Account Number *</label>
                      <input required name="account_number" placeholder="10-digit account number" maxLength={10} className={`${inputBase} font-mono`} />
                    </div>
                  </div>
                )}

                {/* STEP 3: Security */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <p className={sectionTitle}>Account Security</p>
                    <p className={sectionDesc}>You'll use these to access your affiliate dashboard.</p>
                    
                    <div>
                      <label className={labelBase}>4-Digit Security Code *</label>
                      <input 
                        required 
                        name="security_code" 
                        placeholder="••••" 
                        maxLength={4}
                        pattern="[0-9]{4}"
                        type="password"
                        className={`${inputBase} font-mono tracking-widest text-center text-lg`} 
                      />
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                      <label className={labelBase}>Security Question 1 *</label>
                      <select required name="security_question_1" defaultValue="" className={selectBase}>
                        <option value="" disabled className="bg-zinc-800">Select a question...</option>
                        {securityQuestions.map((q, i) => <option key={i} value={q} className="bg-zinc-800">{q}</option>)}
                      </select>
                      <input required name="security_answer_1" placeholder="Your answer" className={`${inputBase} mt-3`} />
                    </div>

                    <div>
                      <label className={labelBase}>Security Question 2 *</label>
                      <select required name="security_question_2" defaultValue="" className={selectBase}>
                        <option value="" disabled className="bg-zinc-800">Select a different question...</option>
                        {securityQuestions.map((q, i) => <option key={i} value={q} className="bg-zinc-800">{q}</option>)}
                      </select>
                      <input required name="security_answer_2" placeholder="Your answer" className={`${inputBase} mt-3`} />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 text-xs text-red-300 mt-4">{error}</div>}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-800">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-sm font-semibold transition-all"
                    >
                      Back
                    </button>
                  )}
                  {currentStep < signupSteps.length ? (
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
                      disabled={loading} 
                      className="flex-1 bg-white hover:bg-zinc-200 text-zinc-900 py-3 rounded-xl text-sm font-semibold transition-all disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        'Create Affiliate Account'
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
        </div>
      </footer>
    </div>
  );
}