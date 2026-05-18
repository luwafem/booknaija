import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  
  // Sign In States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const navigate = useNavigate();

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

    const subRes = await fetch('/.netlify/functions/create-subaccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: `Affiliate - ${sanitize(formData.get('full_name'))}`,
        settlement_bank: sanitize(formData.get('settlement_bank')),
        account_number: sanitize(formData.get('account_number')),
        percentage_charge: 60,
        primary_contact_name: sanitize(formData.get('full_name')),
        primary_contact_email: sanitize(formData.get('email')),
        primary_contact_phone: sanitize(formData.get('phone')),
      }),
    });

    const subData = await subRes.json();
    if (!subRes.ok || !subData.subaccount_code) {
      setError(subData.error || 'Failed to verify bank details.');
      setLoading(false);
      return;
    }

    const newAffId = `aff_${Date.now()}`;
    
    const saveRes = await fetch('/.netlify/functions/save-affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliate_id: newAffId,
        name: sanitize(formData.get('full_name')),
        email: sanitize(formData.get('email')),
        phone: sanitize(formData.get('phone')),
        subaccount_code: subData.subaccount_code,
        security_code: sanitize(formData.get('security_code')),
        security_question_1: q1,
        security_answer_1: sanitize(formData.get('security_answer_1')),
        security_question_2: q2,
        security_answer_2: sanitize(formData.get('security_answer_2'))
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

  const inputBase = "w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3.5 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-all";

  // --- SUCCESS STATE ---
  if (done) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-white border border-zinc-200 p-8 sm:p-10 rounded-2xl text-center shadow-sm">
          <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">You're In!</h2>
          <p className="text-zinc-500 text-sm mb-8">Share your unique link below. When your vendors pay their ₦2,500 at signup, you get ₦1,500 instantly.</p>
          
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-8">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Your Affiliate Link</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-bold text-zinc-900 truncate flex-1">booknaija.netlify.app/signup?ref={affiliateId}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(`https://booknaija.netlify.app/signup?ref=${affiliateId}`)}
                className="text-xs bg-zinc-900 text-white px-3 py-2 rounded-lg font-bold shrink-0 hover:bg-zinc-700 transition-colors active:scale-95"
              >
                Copy
              </button>
            </div>
          </div>

          <Link 
            to={`/affiliate/dashboard/${affiliateId}`}
            className="w-full bg-zinc-900 hover:bg-zinc-700 text-white py-3.5 rounded-xl text-sm font-semibold block text-center transition-colors active:scale-95"
          >
            Go to Affiliate Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col">
      
      {/* Top Bar */}
      <nav className="bg-white border-b border-zinc-100 px-4 sm:px-6 py-3 flex justify-between items-center shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <img src="/fav-removebg.png" alt="Logo" className="h-8 w-auto object-contain" />
        </Link>
        <Link to="/" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7-7h18" />
          </svg>
          Back to BookNaija
        </Link>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN - THE PITCH */}
        <div className="w-full lg:w-1/2 bg-zinc-50 border-b lg:border-b-0 lg:border-r border-zinc-100 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-lg mx-auto w-full">
            <div className="inline-block bg-zinc-200 text-zinc-700 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              Affiliate Program
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 mb-5">
              Turn your network into income.
            </h1>
            
            <p className="text-zinc-500 text-lg leading-relaxed mb-10 sm:mb-12">
              Help Nigerian businesses upgrade from WhatsApp status to a professional online store. You earn instantly when they sign up.
            </p>

            {/* The Math */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
              <div className="bg-white p-5 rounded-xl border border-zinc-200 text-center">
                <p className="text-2xl sm:text-3xl font-black text-zinc-900">₦2,500</p>
                <p className="text-xs font-medium text-zinc-400 mt-2">Vendor Pays</p>
              </div>
              <div className="bg-zinc-900 p-5 rounded-xl text-center relative overflow-hidden">
                <p className="text-2xl sm:text-3xl font-black text-white">₦1,500</p>
                <p className="text-xs font-medium text-zinc-400 mt-2">You Earn</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-zinc-200 text-center">
                <p className="text-2xl sm:text-3xl font-black text-zinc-400">₦1,000</p>
                <p className="text-xs font-medium text-zinc-400 mt-2">Platform</p>
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
                    <div key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                      <div className="w-5 h-5 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-600 shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-500 border-t border-zinc-200 pt-6">
              <p className="font-bold text-zinc-900">How do I get paid?</p>
              <p>Instantly. We use Paystack split payments. The moment a vendor pays, your ₦1,500 goes straight to your bank. No monthly delays.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - THE FORM */}
        <div className="w-full lg:w-1/2 bg-white p-8 sm:p-10 flex items-start justify-center pt-8 sm:pt-16 lg:pt-0 lg:items-center">
          <div className="w-full max-w-md">
            
            {/* Toggle Header */}
            <div className="flex border border-zinc-200 rounded-xl p-1 mb-6">
              <button 
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${isSignUp ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Sign Up
              </button>
              <button 
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${!isSignUp ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Sign In
              </button>
            </div>

            {/* Sign In Form */}
            {!isSignUp ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight mb-1">Welcome back</h2>
                  <p className="text-zinc-500 text-sm">Verify your security details to access your dashboard.</p>
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
                
                <div className="pt-4 border-t border-zinc-100">
                  <select required name="sign_in_question" defaultValue="" className={inputBase}>
                    <option value="" disabled>Choose your security question</option>
                    {securityQuestions.map((q, i) => <option key={i} value={q}>{q}</option>)}
                  </select>
                  <input 
                    required 
                    name="sign_in_answer" 
                    placeholder="Your answer" 
                    className={`${inputBase} mt-3`} 
                  />
                </div>

                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">{error}</div>}

                <button 
                  type="submit" 
                  disabled={signInLoading} 
                  className="w-full bg-zinc-900 hover:bg-zinc-700 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors disabled:bg-zinc-200 disabled:text-zinc-400 active:scale-95"
                >
                  {signInLoading ? 'Verifying...' : 'Access Dashboard'}
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Get your link</h2>
                  <p className="text-zinc-500 text-sm mt-1">Register to start earning ₦1,500 per referral.</p>
                </div>

                <input required name="full_name" placeholder="Full Name" className={inputBase} />
                <input required type="email" name="email" placeholder="Email address" className={inputBase} />
                <input required name="phone" placeholder="Phone number" className={inputBase} />
                
                <div className="pt-4 border-t border-zinc-100">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase mb-3">Payout Bank Details</p>
                  <input required name="account_name" placeholder="Account Name" className={inputBase} />
                  <select required name="settlement_bank" defaultValue="" className={`${inputBase} mt-3`}>
                    <option value="" disabled>Select Bank</option>
                    {banks.map((b, i) => <option key={i} value={b.code}>{b.name}</option>)}
                  </select>
                  <input required name="account_number" placeholder="10-digit Account Number" maxLength={10} className={`${inputBase} mt-3 font-mono`} />
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase mb-3">Account Security</p>
                  <input 
                    required 
                    name="security_code" 
                    placeholder="Create 4-Digit Security Code" 
                    maxLength={4}
                    pattern="[0-9]{4}"
                    title="Must be exactly 4 digits"
                    type="password"
                    className={`${inputBase} font-mono tracking-widest`} 
                  />
                  
                  <select required name="security_question_1" defaultValue="" className={`${inputBase} mt-3`}>
                    <option value="" disabled>Security Question 1</option>
                    {securityQuestions.map((q, i) => <option key={i} value={q}>{q}</option>)}
                  </select>
                  <input required name="security_answer_1" placeholder="Answer 1" className={`${inputBase} mt-3`} />

                  <select required name="security_question_2" defaultValue="" className={`${inputBase} mt-3`}>
                    <option value="" disabled>Security Question 2</option>
                    {securityQuestions.map((q, i) => <option key={i} value={q}>{q}</option>)}
                  </select>
                  <input required name="security_answer_2" placeholder="Answer 2" className={`${inputBase} mt-3`} />
                </div>

                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">{error}</div>}

                <button type="submit" disabled={loading} className="w-full bg-zinc-900 hover:bg-zinc-700 text-white py-3.5 rounded-xl text-sm font-semibold mt-2 transition-colors disabled:bg-zinc-200 disabled:text-zinc-400 active:scale-95">
                  {loading ? 'Verifying Bank...' : 'Create Affiliate Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}