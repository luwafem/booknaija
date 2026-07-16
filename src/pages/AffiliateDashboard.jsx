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
    a: 'Those are just catalogs, not a store. People still have to DM you, negotiate, and do bank transfers. BookNaija gives you a checkout link so customers pay securely with card or bank transfer before you even talk to them.',
  },
  {
    q: '"₦2,500 is too much"',
    a: 'It costs less than one Instagram ad. And for ₦2,500/month you get a store that takes card & bank transfer payments 24/7 AND puts you on Google Maps where people are already searching for you. One customer from a "near me" search pays for the whole month. Plus, refer 3 friends and your next month is free.',
  },
  {
    q: '"How will people find my store?"',
    a: 'Your BookNaija page is built for Google. It ranks in search results, shows up on Google Maps for "near me" searches, and we walk you through claiming your Google Business Profile in under 2 minutes. Plus you can still share your store link on WhatsApp and Instagram it just converts way better now.',
  },
  {
    q: '"I don\'t know how to use technology"',
    a: "That's why I'm here. I will set the whole thing up for you your store, your Google Maps listing, everything. You just need to tell me your business name, what you sell, and your bank details for payment. I handle the rest.",
  },
  {
    q: '"I already have a website / Instagram page"',
    a: 'A website nobody finds is just a digital business card. BookNaija is different because it puts you on Google Maps and optimizes your page for "near me" searches. When someone in your area searches "lash artist near me" or "food near me," you show up. Your Instagram page can\'t do that.',
  },
];

const SWIPE_FILES = [
  {
    id: 'casual',
    label: 'Casual / Friend',
    text: `Hey! Are you still only selling on WhatsApp status? I found something that gives you a proper online store WITH Google Maps so people searching "near me" actually find you.\n\nBookNaija sets up your store + puts you on Google Maps + customers pay you directly with card or bank transfer. All for ₦2,500/month.\n\nHere's the link:`,
  },
  {
    id: 'local',
    label: 'Local Business / In-Person',
    text: `Hi! I noticed your business isn't showing up on Google Maps when people search in your area. You're losing customers who are literally looking for what you sell.\n\nI can fix that today + set you up with a full online store where customers can book or buy and pay directly with card or bank transfer.\n\nIt's ₦2,500/month. Let me know if you want me to set it up for you.`,
  },
  {
    id: 'professional',
    label: 'Professional / Cold Pitch',
    text: `Hi [Name], I help local businesses get found on Google.\n\nRight now, when someone searches "[their service] near me" in your area, your business doesn't appear. That's free traffic you're losing every day.\n\nI can set up your Google Maps ranking + a professional online storefront (with card & bank transfer payments) + SEO optimization so you show up in searches. Everything runs on autopilot.\n\nThe plan is ₦2,500/month. Should I send the details?`,
  },
];

export default function AffiliateDashboard() {
  const { affiliateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [swipeCopied, setSwipeCopied] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showInactive, setShowInactive] = useState(true); // NEW: toggle to show/hide inactive referrals

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

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center bg-zinc-900 p-10 rounded-2xl border border-zinc-800 max-w-sm">
        <h2 className="text-lg font-bold text-white mb-2">Affiliate Not Found</h2>
        <p className="text-zinc-400 text-sm mb-4">Please check your link or sign up again.</p>
        <Link to="/affiliate-signup" className="text-white font-bold text-sm hover:text-zinc-200 transition-colors">Go to Signup</Link>
      </div>
    </div>
  );

  // Destructure summary and referrals from the new data structure
  const { referrals = [], summary = {} } = data;
  const {
    total = 0,
    active = 0,
    inactive = 0,
    fullyPaid = 0,
    month1Paid = 0,
    unpaid = 0,
    totalEarned = 0,
    totalPending = 0,
    potentialEarnings = 0,
  } = summary;

  // ─── FILTER REFERRALS (optional: hide inactive) ───
  const filteredReferrals = showInactive ? referrals : referrals.filter(ref => ref.active);

  // Dark theme styles matching other pages
  const cardBase = "bg-zinc-900 border border-zinc-800 rounded-xl";
  const labelBase = "text-xs font-bold text-zinc-400 uppercase tracking-wider";
  const statValue = "text-3xl sm:text-4xl font-black text-white";
  const statDesc = "text-[10px] text-zinc-400 mt-2 font-medium";
  const sectionHeader = "px-6 py-4 border-b border-zinc-800 bg-zinc-900/50";
  const sectionTitle = "text-base font-bold text-white";
  const sectionDesc = "text-xs text-zinc-400 mt-1";
  const expandBtn = "w-full flex items-center justify-between text-left";
  const expandIcon = "w-4 h-4 text-zinc-500 transition-transform shrink-0 ml-4";
  const contentBox = "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4";
  const contentTitle = "text-xs font-bold text-zinc-300 mb-1.5";
  const contentText = "text-[11px] text-zinc-400 leading-relaxed";
  const btnPrimary = "bg-white text-zinc-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors shrink-0";
  const btnSecondary = "bg-zinc-800 text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-zinc-700 transition-colors";

  // Helper to get badge styles based on commission status
  const getBadgeStyles = (statusColor) => {
    switch (statusColor) {
      case 'green':
        return 'text-xs font-bold text-green-400 bg-green-900/30 border border-green-700 px-3 py-1 rounded-full';
      case 'orange':
        return 'text-xs font-bold text-orange-400 bg-orange-900/30 border border-orange-700 px-3 py-1 rounded-full';
      case 'yellow':
        return 'text-xs font-bold text-yellow-400 bg-yellow-900/30 border border-yellow-700 px-3 py-1 rounded-full';
      case 'gray':
        return 'text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full';
      default:
        return 'text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full';
    }
  };

  // ─── Helper to get display status for inactive businesses ───
  const getInactiveDisplay = (ref) => {
    const month = ref.affiliate_commission_month || 0;
    if (month === 0) return 'Inactive (No earnings)';
    if (month === 1) return `Inactive (₦1,500 earned)`;
    if (month >= 2) return `Inactive (₦2,500 earned)`;
    return 'Inactive';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white flex flex-col">
      
      {/* Header - White background matching landing page */}
      <nav className="bg-white border-b border-zinc-200 px-6 py-3 sticky top-0 z-50 shrink-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/fav-removebg.png" alt="Logo" className="h-9 w-auto object-contain" />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider hidden sm:inline">Affiliate Portal</span>
          </Link>
          <p className="text-sm font-medium text-zinc-600">Welcome, {data.affiliate.name.split(' ')[0]}</p>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ===== HOW YOU GET PAID ===== */}
        <div className={`${cardBase} p-5`}>
          <p className="text-base font-bold text-white">You earn up to ₦2,500 per referral</p>
          <p className="text-sm text-zinc-400 mt-1">
            When a vendor pays their ₦2,500 monthly plan using your link, 
            <span className="font-bold text-white"> ₦1,500 is sent instantly</span> to your bank via Paystack split. 
            If they stay active for a second month, you get 
            <span className="font-bold text-white"> another ₦1,000</span> automatically. 
            That's <span className="font-bold text-white">₦2,500 total</span> — the full month's fee back to you!
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            💡 If a referred business becomes inactive, you won't earn future commissions on them.
          </p>
        </div>

        {/* ===== STATS (Using new summary) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${cardBase} p-5`}>
            <p className={labelBase}>Total Referrals</p>
            <p className={statValue}>{total}</p>
            <p className={statDesc}>
              {active} active · {inactive} inactive
            </p>
          </div>
          <div className={`${cardBase} p-5`}>
            <p className={labelBase}>Earned So Far</p>
            <p className={statValue}>₦{totalEarned.toLocaleString()}</p>
            {totalPending > 0 && (
              <p className={statDesc}>₦{totalPending.toLocaleString()} pending</p>
            )}
            {inactive > 0 && (
              <p className="statDesc text-[10px] text-zinc-500 mt-1">
                ⚠️ {inactive} inactive — no future earnings from these
              </p>
            )}
          </div>
          <div className={`${cardBase} p-5`}>
            <p className={labelBase}>Potential Earnings</p>
            <p className={statValue}>₦{potentialEarnings.toLocaleString()}</p>
            <p className={statDesc}>
              {fullyPaid} fully paid · {month1Paid} on month 2 · {unpaid} on month 1
            </p>
          </div>
          <div className={`${cardBase} p-5`}>
            <p className={`${labelBase} mb-2`}>Your Unique Link</p>
            <div className="flex items-center gap-2">
              <input 
                readOnly 
                value={data.affiliate.link || ''} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-300 truncate focus:outline-none"
              />
              <button 
                onClick={copyLink}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${copied ? 'bg-green-600 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-200'}`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-2">
              Share this link to track your referrals and earn commissions.
            </p>
          </div>
        </div>

        {/* ===== BUSINESSES WE SERVE (unchanged) ===== */}
        <div className={`${cardBase} overflow-hidden`}>
          <div className={sectionHeader}>
            <h3 className={sectionTitle}>Businesses We Serve</h3>
            <p className={sectionDesc}>Any of these business types can be set up on BookNaija. Use this list to find leads.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {BUSINESS_TYPES.map((type) => (
                <div 
                  key={type} 
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-center text-xs font-semibold text-zinc-300"
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

        {/* ===== AFFILIATE TOOLKIT (unchanged) ===== */}
        <div className={`${cardBase} overflow-hidden`}>
          <div className={sectionHeader}>
            <h3 className={sectionTitle}>Affiliate Toolkit</h3>
            <p className={sectionDesc}>Everything you need to close deals. Use what works, skip what doesn't.</p>
          </div>
          
          <div className="divide-y divide-zinc-800">

            {/* --- Demo Store --- */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Live Demo Store</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Show vendors what their store will look like. This closes deals faster than any pitch.</p>
                </div>
                <a 
                  href="https://booknaija.netlify.app/demo" 
                  target="_blank" 
                  rel="noreferrer"
                  className={btnPrimary}
                >
                  View Demo
                </a>
              </div>
            </div>

            {/* --- Core Pitch --- */}
            <div className="p-6">
              <button 
                onClick={() => toggleSection('pitch')}
                className={expandBtn}
              >
                <div>
                  <p className="text-sm font-bold text-white">The Core Pitch</p>
                  <p className="text-xs text-zinc-400 mt-0.5">What you're selling and why they need it.</p>
                </div>
                <svg className={`${expandIcon} ${expandedSection === 'pitch' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'pitch' && (
                <div className="mt-4 space-y-3">
                  <div className={contentBox}>
                    <p className={contentTitle}>The #1 hook: Google Maps + "Near Me" Visibility</p>
                    <p className={contentText}>
                      Most Nigerian businesses are invisible on Google. When someone searches "lash artist near me" or "food near me" in their area, nothing comes up. BookNaija fixes this. Every store page is SEO-optimized to rank on Google, and we walk them through claiming their Google Business Profile so they appear on Maps. This alone is worth more than ₦2,500/month.
                    </p>
                  </div>
                  <div className={contentBox}>
                    <p className={contentTitle}>The full package</p>
                    <p className={contentText}>
                      BookNaija gives them three things: (1) A professional online store where customers can browse, book, or order and pay directly with card or bank transfer. (2) Google Maps visibility so people searching in their area find them. (3) SEO-optimized page that ranks in Google search results for their business name and services. The location they set on their store also pinpoints them on Maps with accurate directions.
                    </p>
                  </div>
                  <div className={contentBox}>
                    <p className={contentTitle}>The pain you solve</p>
                    <p className={contentText}>
                      They're stuck selling through WhatsApp status and DMs chasing payments, dealing with fake buyers, zero Google visibility. You're offering the upgrade from "DM me to order" to a real store with card & bank transfer payments that customers actually find on Google.
                    </p>
                  </div>
                  <div className={contentBox}>
                    <p className={contentTitle}>The price point</p>
                    <p className={contentText}>
                      ₦2,500/month. Cancel anytime. No contracts, no hidden fees. One customer from a Google "near me" search pays for the entire month. After signup, their dashboard has a direct button to claim their Google Business Profile takes under 2 minutes. And if they refer 3 friends, their next month is free.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* --- Closing Approaches --- */}
            <div className="p-6">
              <button 
                onClick={() => toggleSection('closes')}
                className={expandBtn}
              >
                <div>
                  <p className="text-sm font-bold text-white">Closing Approaches</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Suggested ways to close. Adapt them, combine them, or ignore them entirely.</p>
                </div>
                <svg className={`${expandIcon} ${expandedSection === 'closes' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'closes' && (
                <div className="mt-4 space-y-4">
                  <div className={contentBox}>
                    <p className={contentTitle}>The Google Maps Angle (strongest)</p>
                    <p className={contentText}>
                      Search for local businesses on Google Maps. Hair salons, restaurants, boutiques if they aren't listed, they're losing customers every day to the ones that are. Walk in or message them: "I can put you on Google Maps so people searching 'near me' find you, AND give you a full online store with card & bank transfer payments. ₦2,500/month, cancel anytime." The Maps angle is the easiest hook because the problem is visible you can literally show them their competitors ranking while they don't exist.
                    </p>
                  </div>
                  <div className={contentBox}>
                    <p className={contentTitle}>The WhatsApp Status Angle</p>
                    <p className={contentText}>
                      Target vendors posting items on their status. Ask: "Are you tired of chasing DMs for money and dealing with fake buyers?" Then offer the upgrade a real store with card & bank transfer payments that goes straight to their bank. Mention that they'll also show up on Google Maps, so they get customers who aren't even on their WhatsApp.
                    </p>
                  </div>
                  <div className={contentBox}>
                    <p className={contentTitle}>The Done-For-You Angle</p>
                    <p className={contentText}>
                      Many business owners don't want to set anything up themselves. Offer to do it all: "Just give me your business name, what you sell, your location, and your bank details. I'll set up your store, pin you on the map, and get you on Google." They pay ₦2,500/month, you sign them up with your link, you keep ₦1,500. Their dashboard even has a button to claim their Google Business Profile in 2 minutes.
                    </p>
                  </div>
                  <div className={contentBox}>
                    <p className={contentTitle}>The Agency / Bundle Angle</p>
                    <p className={contentText}>
                      Sell a "Digital Presence Setup" to businesses Google Maps ranking + SEO-optimized storefront + Card & Bank Transfer payments + location pinning with directions. Charge them ₦15,000+ as a setup fee. You pay ₦2,500/month via your link (earning ₦1,500 back instantly), so your real cost is ₦1,000. You keep the rest.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* --- Swipe Files --- */}
            <div className="p-6">
              <button 
                onClick={() => toggleSection('swipes')}
                className={expandBtn}
              >
                <div>
                  <p className="text-sm font-bold text-white">WhatsApp Swipe Files</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Copy, tweak, and send. Or write your own these are just starting points.</p>
                </div>
                <svg className={`${expandIcon} ${expandedSection === 'swipes' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'swipes' && (
                <div className="mt-4 space-y-4">
                  {SWIPE_FILES.map((swipe) => (
                    <div key={swipe.id} className={`${contentBox} border-zinc-700`}>
                      <p className={contentTitle}>{swipe.label}</p>
                      <p className="text-sm text-zinc-300 whitespace-pre-line">{swipe.text}</p>
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => copySwipe(swipe.text, swipe.id)}
                          className={`${btnSecondary} ${swipeCopied === swipe.id ? 'bg-green-600 text-white' : ''}`}
                        >
                          {swipeCopied === swipe.id ? 'Copied' : 'Copy Text'}
                        </button>
                        <button 
                          onClick={() => shareToWhatsApp(swipe.text)}
                          className={btnPrimary}
                        >
                          Open in WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- Objection Handler --- */}
            <div className="p-6">
              <button 
                onClick={() => toggleSection('objections')}
                className={expandBtn}
              >
                <div>
                  <p className="text-sm font-bold text-white">Objection Handler</p>
                  <p className="text-xs text-zinc-400 mt-0.5">When they push back, here's how to respond.</p>
                </div>
                <svg className={`${expandIcon} ${expandedSection === 'objections' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === 'objections' && (
                <div className="mt-4 space-y-3">
                  {OBJECTIONS.map((obj) => (
                    <div key={obj.q} className={contentBox}>
                      <p className={contentTitle}>{obj.q}</p>
                      <p className={contentText}>{obj.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ===== REFERRALS LIST (Updated with commission status & inactive toggle) ===== */}
        <div className={`${cardBase} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className={sectionTitle}>Your Referrals</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {filteredReferrals.length} shown ({referrals.length - filteredReferrals.length} hidden)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={() => setShowInactive(!showInactive)}
                  className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-700 text-white focus:ring-zinc-500 cursor-pointer"
                />
                Show inactive
              </label>
            </div>
          </div>
          
          {filteredReferrals.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-400 font-medium">No referrals to show.</p>
              {!showInactive && inactive > 0 && (
                <p className="text-zinc-400 text-sm mt-1">
                  You have {inactive} inactive business{inactive > 1 ? 'es' : ''}. Toggle "Show inactive" to view them.
                </p>
              )}
              {referrals.length === 0 && (
                <p className="text-zinc-400 text-sm mt-1">Share your link with businesses to start earning commissions.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filteredReferrals.map((ref) => {
                const { commission } = ref;
                const badgeClass = getBadgeStyles(commission.statusColor);
                const statusLabel = ref.active ? commission.status : getInactiveDisplay(ref);

                return (
                  <div key={ref.slug} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {ref.logo ? (
                        <img src={ref.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-zinc-800 border border-zinc-700 p-1 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                          {ref.name.substring(0,2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{ref.name}</p>
                        <p className="text-xs text-zinc-400 font-mono truncate">booknaija.netlify.app/{ref.slug}</p>
                        {!ref.active && (
                          <span className="text-[9px] text-zinc-500 mt-0.5 block">
                            ⚠️ Inactive — no future commissions
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={badgeClass}>
                        {statusLabel}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">
                        ₦{commission.total.toLocaleString()} total
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== PAYOUT INFO (unchanged) ===== */}
        <div className={`${cardBase} p-6`}>
          <h3 className="text-base font-bold text-white mb-1">Payout Details</h3>
          <p className="text-xs text-zinc-400 mb-4">Commissions are sent automatically to your linked bank account.</p>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            {data.affiliate.subaccount_code ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${labelBase} mb-1`}>Bank Account</p>
                  <p className="text-sm font-bold text-white">Connected via Paystack</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Your bank details are securely stored with Paystack. Commissions are sent automatically after each paid month.</p>
                </div>
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${labelBase} mb-1`}>Bank Account</p>
                  <p className="text-sm font-bold text-white">Not connected</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Your bank account has not been linked yet. Contact support to resolve this.</p>
                </div>
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
        </div>
      </footer>
    </div>
  );
}