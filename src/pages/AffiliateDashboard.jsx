import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AffiliateDashboard() {
  const { affiliateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/.netlify/functions/get-affiliate-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ affiliateId })
        });
        const result = await res.json();
        if (result.affiliate) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (affiliateId) fetchStats();
  }, [affiliateId]);

  const copyLink = () => {
    if (data?.affiliate?.link) {
      navigator.clipboard.writeText(data.affiliate.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <p className="text-zinc-500 font-medium">Loading dashboard...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="text-center bg-white p-10 rounded-2xl border border-zinc-200 max-w-sm">
        <h2 className="text-xl font-bold mb-2">Affiliate Not Found</h2>
        <p className="text-zinc-500 text-sm mb-4">Please check your link or sign up again.</p>
        <Link to="/affiliate-signup" className="text-purple-600 font-bold text-sm hover:underline">Go to Signup</Link>
      </div>
    </div>
  );

  const totalReferred = data.referrals.length;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <nav className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/fav-removebg.png" alt="Logo" className="h-10 w-auto object-contain" />
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Affiliate Portal</span>
          </Link>
          <p className="text-sm font-medium text-zinc-600">Welcome, {data.affiliate.name.split(' ')[0]}</p>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Payout Notice */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-purple-800">How you get paid</p>
            <p className="text-xs text-purple-700 mt-1">
              You earn <span className="font-bold">1,500 Naira</span> automatically via Paystack when a vendor you referred upgrades to the 2,500 Naira monthly plan. The money is sent directly to the bank account you provided. No manual withdrawals needed.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-zinc-200">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Total Referred (Free Trial)</p>
            <p className="text-4xl font-black text-zinc-900">{totalReferred}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Unique Referral Link</p>
            <div className="flex items-center gap-2 mt-2">
              <input 
                readOnly 
                value={data.affiliate.link} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-700 truncate"
              />
              <button 
                onClick={copyLink}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition-colors shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h3 className="text-base font-bold text-zinc-900">Your Referred Businesses</h3>
          </div>
          
          {totalReferred === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-400 font-medium">No one has signed up using your link yet.</p>
              <p className="text-zinc-400 text-sm mt-1">Share your link on WhatsApp or Twitter to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {data.referrals.map((ref) => (
                <div key={ref.slug} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {ref.logo ? (
                      <img src={ref.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-zinc-50 border border-zinc-100 p-1" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                        {ref.name.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{ref.name}</p>
                      <p className="text-xs text-zinc-400 font-mono">booknaija.netlify.app/{ref.slug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* In a real app, you'd check if they paid 2500 here. For now, we assume 'active' means they upgraded */}
                    {ref.active ? (
                      <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                        Paid (You earned ₦1,500)
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full">
                        Free Trial
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}