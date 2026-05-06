import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AffiliateSignup() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState('');
  const [affiliateId, setAffiliateId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/.netlify/functions/list-banks')
      .then(res => res.json())
      .then(data => setBanks(data || []))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;
    const formData = new FormData(form);

    // 1. Create Paystack Subaccount (Takes 60% = 1,500 Naira later)
    const subRes = await fetch('/.netlify/functions/create-subaccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: `Affiliate - ${formData.get('full_name')}`,
        settlement_bank: formData.get('settlement_bank'),
        account_number: formData.get('account_number'),
        percentage_charge: 60, // THE MAGIC NUMBER: 60% of 2500 = 1500
        primary_contact_name: formData.get('full_name'),
        primary_contact_email: formData.get('email'),
        primary_contact_phone: formData.get('phone'),
      }),
    });

    const subData = await subRes.json();
    if (!subRes.ok || !subData.subaccount_code) {
      setError(subData.error || 'Failed to verify bank details.');
      setLoading(false);
      return;
    }

    // 2. Save Affiliate to your DB (NOW UNCOMMENTED!)
    const newAffId = `aff_${Date.now()}`;
    
    const saveRes = await fetch('/.netlify/functions/save-affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliate_id: newAffId,
        name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subaccount_code: subData.subaccount_code
      })
    });

    const saveData = await saveRes.json();
    if (!saveRes.ok) {
      setError('Failed to save affiliate account. Please try again.');
      setLoading(false);
      return;
    }

    setAffiliateId(newAffId);
    setDone(true);
    setLoading(false);
  };

  const inputBase = "w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600";

  if (done) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6">
        <div className="max-w-sm bg-white border border-zinc-200 p-10 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">You're In!</h2>
          <p className="text-zinc-500 mb-6">Share your unique link below. When your vendors pay their 2,500 Naira in Month 2, you get 1,500 Naira instantly.</p>
          
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-2">
            <code className="text-sm font-bold text-purple-600 truncate">booknaija.netlify.app/signup?ref={affiliateId}</code>
            <button 
              onClick={() => navigator.clipboard.writeText(`https://booknaija.netlify.app/signup?ref=${affiliateId}`)}
              className="text-xs bg-purple-600 text-white px-3 py-2 rounded-lg font-bold shrink-0"
            >
              Copy
            </button>
          </div>

          <Link 
            to={`/affiliate/dashboard/${affiliateId}`}
            className="w-full bg-zinc-900 text-white py-3.5 rounded-xl text-sm font-semibold block text-center"
          >
            Go to Affiliate Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Become an Affiliate</h2>
          <p className="text-zinc-500 text-sm mt-2">Earn 1,500 Naira per business you refer.</p>
        </div>

        <div className="space-y-4">
          <input required name="full_name" placeholder="Full Name" className={inputBase} />
          <input required type="email" name="email" placeholder="Email address" className={inputBase} />
          <input required name="phone" placeholder="Phone number" className={inputBase} />
          
          <div className="pt-4 border-t border-zinc-100">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Payout Bank Details</p>
            <input required name="account_name" placeholder="Account Name" className={inputBase} />
            <select required name="settlement_bank" defaultValue="" className={`${inputBase} mt-4`}>
              <option value="" disabled>Select Bank</option>
              {banks.map((b, i) => <option key={i} value={b.code}>{b.name}</option>)}
            </select>
            <input required name="account_number" placeholder="10-digit Account Number" maxLength={10} className={`${inputBase} mt-4 font-mono`} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl text-sm font-semibold mt-4 disabled:bg-zinc-200">
            {loading ? 'Verifying Bank...' : 'Create Affiliate Account'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-900 font-medium">Back to Home</Link>
        </div>
      </form>
    </div>
  );
}