import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const BUSINESS_TYPES = [
  'Lash Artist',
  'Cleaner',
  'Tutor',
  'Hair Stylist',
  'Makeup Artist',
  'Nail Technician',
  'Skin Care / Facialist',
  'Fashion / Boutique',
  'Restaurant / Food',
  'Auto Dealer / Rental',
];

const OBJECTIONS = [
  {
    q: '"I already sell on Instagram / WhatsApp status"',
    a: 'Those are just catalogs, not a store. People still have to DM you, negotiate, and do bank transfers. BookNaija gives you a checkout link so customers pay with card before you even talk to them.',
  },
  {
    q: '"₦2,500 is too much"',
    a: 'It costs less than one Instagram ad. And you only pay once to set up a store that takes card payments 24/7. One single order from your store pays for the whole thing.',
  },
  {
    q: '"How will people find my store?"',
    a: 'We set you up on Google Maps so when people search "hair stylist near me" or "food near me," you show up. Plus you can still share your store link on your WhatsApp status and Instagram, it just converts way better now.',
  },
  {
    q: '"I don\'t know how to use technology"',
    a: "That's why I'm here. I will set the whole thing up for you. You just need to tell me your business name, what you sell, and your bank details for payment. I handle the rest.",
  },
];

export default function AffiliateDashboard() {
  const { affiliateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [swipeCopied, setSwipeCopied] = useState('');
  const [affiliateType, setAffiliateType] = useState(null);

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

  const copySwipe = (text, id) => {
    navigator.clipboard.writeText(text);
    setSwipeCopied(id);
    setTimeout(() => setSwipeCopied(''), 2000);
  };

  const shareToWhatsApp = (text) => {
    if (!data?.affiliate?.link) return;
    const message = encodeURIComponent(`${text}\n\n${data.affiliate.link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
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
  const paidReferrals = data.referrals.filter(r => r.affiliate_bounty_paid).length;
  const pendingReferrals = totalReferred - paidReferrals;
  const totalEarned = paidReferrals * 1500;
  const pendingEarned = pendingReferrals * 1500;

  const whatsappNetworker = `Are you still selling only on WhatsApp status? Stop chasing DMs and dealing with "I want to buy" trolls!\n\nI just started using BookNaija. It gives you a proper online store for your fashion, food, or products where customers pay you directly with card before ordering.\n\nSetup is just ₦2,500. Here's the link to get your store:`;

  const whatsappHustler = `Hey! I noticed your business isn't showing up on Google Maps when people search in your area.\n\nI can fix that for you today + set you up with a full online store where customers can buy your products or book your services and pay directly with card.\n\nSetup is just ₦2,500. Let me know if you want me to set it up for you.`;

  const whatsappAgency = `Hi [Name], I run digital setups for local businesses. Right now, you're losing sales by only selling via WhatsApp status and you're invisible on Google Maps.\n\nI can set up your Google Maps ranking, a professional e-commerce storefront (for fashion, food, cars, or bookings), and automated Paystack payments. Everything runs on autopilot.\n\nThe onboarding setup is ₦2,500. Should I send the details?`;

  const getSwipeText = () => {
    if (affiliateType === 'networker') return whatsappNetworker;
    if (affiliateType === 'hustler') return whatsappHustler;
    return whatsappAgency;
  };

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

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ===== HOW YOU GET PAID ===== */}
        <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-5 flex items-start gap-4">
          <div>
            <p className="text-base font-bold text-zinc-900">You earn ₦1,500 per setup</p>
            <p className="text-sm text-zinc-600 mt-1">
              When a vendor pays their ₦2,500 using your link, <span className="font-bold text-zinc-900">₦1,500 is sent instantly to your bank</span> via Paystack. The remaining ₦1,000 goes to the platform.
            </p>
          </div>
        </div>

        {/* ===== STATS & LINK ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Total Referred</p>
            <p className="text-4xl font-black text-zinc-900">{totalReferred}</p>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">{pendingReferrals} pending / {paidReferrals} paid</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Total Earnings</p>
            <p className="text-4xl font-black text-zinc-900">₦{totalEarned.toLocaleString()}</p>
            {pendingEarned > 0 && (
              <p className="text-[10px] text-zinc-500 mt-2 font-medium">₦{pendingEarned.toLocaleString()} pending payout</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Your Unique Link</p>
            <div className="flex items-center gap-2">
              <input 
                readOnly 
                value={data.affiliate.link} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-700 truncate"
              />
              <button 
                onClick={copyLink}
                className={"bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 " + (copied ? 'bg-purple-600' : 'hover:bg-zinc-700')}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-semibold mt-2">
              Always share this exact link so you get credited for the ₦1,500 commission.
            </p>
          </div>
        </div>

        {/* ===== BUSINESSES WE SERVE ===== */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
            <h3 className="text-base font-bold text-zinc-900">Businesses We Serve</h3>
            <p className="text-xs text-zinc-500 mt-1">Any of these business types can be set up on BookNaija. Use this list to find leads.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {BUSINESS_TYPES.map((type) => (
                <div 
                  key={type} 
                  className="bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2.5 text-center text-xs font-semibold text-zinc-700"
                >
                  {type}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 mt-4 font-medium">
              Don't see a fit? Any business that sells products or takes bookings can use BookNaija.
            </p>
          </div>
        </div>

        {/* ===== THE PLAYBOOK GATE ===== */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-zinc-900">The Affiliate Playbook</h3>
              <p className="text-xs text-zinc-500 mt-1">Choose your strategy to close deals and earn commissions.</p>
            </div>
            {affiliateType && (
              <button 
                onClick={() => setAffiliateType(null)} 
                className="text-xs font-semibold text-zinc-400 hover:text-purple-600 transition-colors"
              >
                Switch Path
              </button>
            )}
          </div>
          
          <div className="p-6">
            {!affiliateType ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-600 text-center mb-6">
                  How do you plan to refer businesses?
                </p>
                
                <button 
                  onClick={() => setAffiliateType('networker')}
                  className="w-full p-5 border-2 border-zinc-200 bg-white rounded-xl text-left hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                      <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 mb-1 text-sm">The Networker</h4>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        You know lots of vendors. You share links in WhatsApp groups and tell friends to upgrade from WhatsApp status to a proper online store.
                      </p>
                    </div>
                  </div>
                </button>

                <div className="grid md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAffiliateType('hustler')}
                    className="p-5 border-2 border-zinc-200 rounded-xl text-left hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-zinc-200 transition-colors">
                      <svg className="w-5 h-5 text-zinc-600 group-hover:text-zinc-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-zinc-900 mb-1 text-sm">The Street Scout</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      You walk up to businesses. You sell the "Google Maps + Storefront" done-for-you setup.
                    </p>
                  </button>

                  <button 
                    onClick={() => setAffiliateType('agency')}
                    className="p-5 border-2 border-zinc-200 rounded-xl text-left hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-zinc-200 transition-colors">
                      <svg className="w-5 h-5 text-zinc-600 group-hover:text-zinc-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-zinc-900 mb-1 text-sm">Agency / Pro</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      You sell digital services and want to use BookNaija as a white-label e-commerce backend.
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Live Demo */}
                <div className="bg-zinc-900 text-white p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Show them a live demo</p>
                    <p className="text-sm font-medium mt-1">Let them see what their store will look like.</p>
                  </div>
                  <a 
                    href="https://booknaija.netlify.app/demo" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white text-zinc-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors shrink-0"
                  >
                    View Demo Store
                  </a>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-lg">
                  <p className="text-xs font-bold text-zinc-900 mb-1">Your Secret Weapon: Google Maps + Full Storefront</p>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    BookNaija isn't just for bookings. You are selling a <span className="font-bold">"Done-For-You Online Store & Google Maps Setup"</span>. Businesses can sell fashion, food, cars, and products with direct Paystack payouts, while showing up in "near me" searches.
                  </p>
                </div>

                {affiliateType === 'networker' ? (
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">The Networker Close</p>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 text-zinc-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Target the "WhatsApp Status" Pain</p>
                          <p className="text-[11px] text-zinc-500">Look for vendors posting items on their status. Ask them: "Are you tired of chasing DMs for money and dealing with fake buyers?"</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 text-zinc-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Offer the Upgrade</p>
                          <p className="text-[11px] text-zinc-500">Tell them BookNaija gives them a real store with card payments. No more chasing money, it comes straight to their bank.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 text-zinc-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Drop the Link</p>
                          <p className="text-[11px] text-zinc-500">Share your affiliate link in the group or DM. When they sign up and pay ₦2,500, you get ₦1,500 instantly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : affiliateType === 'hustler' ? (
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">The Street Scout Close</p>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">1</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Find the Gap</p>
                          <p className="text-[11px] text-zinc-500">Search for local businesses on Google Maps. If they aren't there, you've found a lead who is losing "near me" customers.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">2</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Pitch the Full Package</p>
                          <p className="text-[11px] text-zinc-500">Tell them you can put them on Google Maps AND give them a store for their products/food/cars with card payments. All for ₦2,500.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">3</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Do it for them</p>
                          <p className="text-[11px] text-zinc-500">They pay you. You sign them up with your link, fill their info, and set up their store/Maps. You keep ₦1,500.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">The Agency Close</p>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">1</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Audit their Digital Presence</p>
                          <p className="text-[11px] text-zinc-500">Show them their missing Google Maps listing and how selling on WhatsApp status limits their growth and lacks professional checkout.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">2</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Bundle the Setup</p>
                          <p className="text-[11px] text-zinc-500">Sell a "Digital Infrastructure Setup" (Maps + E-commerce Store for fashion/food/cars + Paystack). Charge them whatever you want (e.g., ₦15,000+).</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">3</div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Fulfill with BookNaija</p>
                          <p className="text-[11px] text-zinc-500">You pay the ₦2,500 via your affiliate link. You just earned ₦1,500 back instantly, meaning your tool cost was only ₦1,000. You keep the rest of the client fee.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Swipe File with WhatsApp Share */}
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">WhatsApp Swipe File</p>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                    <p className="text-sm text-zinc-800 whitespace-pre-line">{getSwipeText()}</p>
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => copySwipe(getSwipeText(), affiliateType)}
                        className="bg-zinc-200 text-zinc-900 px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-zinc-300 transition-colors"
                      >
                        {swipeCopied === affiliateType ? 'Copied' : 'Copy Text'}
                      </button>
                      <button 
                        onClick={() => shareToWhatsApp(getSwipeText())}
                        className="bg-zinc-900 text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-zinc-700 transition-colors"
                      >
                        Open in WhatsApp
                      </button>
                    </div>
                  </div>
                </div>

                {/* Objection Handler */}
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Objection Handler</p>
                  <div className="space-y-3">
                    {OBJECTIONS.map((obj) => (
                      <div key={obj.q} className="bg-zinc-50 border border-zinc-100 rounded-lg p-4">
                        <p className="text-xs font-bold text-zinc-900 mb-1.5">{obj.q}</p>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">{obj.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== REFERRALS LIST ===== */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h3 className="text-base font-bold text-zinc-900">Your Referred Businesses</h3>
          </div>
          
          {totalReferred === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-400 font-medium">No one has signed up using your link yet.</p>
              <p className="text-zinc-400 text-sm mt-1">Choose your playbook above to close your first deal.</p>
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
                    {ref.affiliate_bounty_paid ? (
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                        Paid (Earned ₦1,500)
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== PAYOUT INFO ===== */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h3 className="text-base font-bold text-zinc-900 mb-1">Payout Details</h3>
          <p className="text-xs text-zinc-500 mb-4">Commissions are sent instantly to your linked bank account via Paystack.</p>
          <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4">
            {data.affiliate.subaccount_code ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Bank Account</p>
                  <p className="text-sm font-bold text-zinc-900">Connected via Paystack</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Your bank details are securely stored with Paystack. Commissions are sent automatically after each paid signup.</p>
                </div>
                <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Bank Account</p>
                  <p className="text-sm font-bold text-zinc-900">Not connected</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Your bank account has not been linked yet. Contact support to resolve this.</p>
                </div>
                <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}