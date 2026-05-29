import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const businessCategories = [
  { name: 'Hair Stylist', icon: <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 004.6 9c-1.2.7-2 2-2 3.4 0 1.3.7 2.5 1.8 3.2-.1.4-.1.8-.1 1.2 0 2.8 1.9 5.2 4.5 5.9.8.5 1.8.8 2.8.8h1.2c1 0 2-.3 2.8-.8 2.6-.7 4.5-3.1 4.5-5.9 0-.4 0-.8-.1-1.2 1.1-.7 1.8-1.9 1.8-3.2 0-1.4-.8-2.7-2-3.4-.2-1.8-1.4-3.3-3.1-3.9A3.7 3.7 0 0012 3z" />, example: 'booknaija.com/braid-gallery', items: ['Knotless Braids', 'Wig Install', 'Silk Bonnet'] },
  { name: 'Real Estate', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />, example: 'booknaija.com/luxury-homes', items: ['Property Listings', 'Book Viewings', 'For Sale / Rent'] },
  { name: 'Lash Artist', icon: <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />, example: 'booknaija.com/lash-luxe', items: ['Classic Lashes', 'Volume Set', 'Lash Serum'] },
  { name: 'Fashion / Boutique', icon: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />, example: 'booknaija.com/ankara-royale', items: ['Ankara Gowns', 'Ready to Wear', 'Custom Orders'] },
];

const moreCategories = ['Nail Technician', 'Makeup Artist', 'Skin Care', 'Cleaner', 'Tutor', 'Restaurant', 'Auto Dealer', 'Shortlet / Airbnb'];

const features = [
  { t: 'Card & Bank Transfer', d: 'Stop chasing money. Clients pay securely via Paystack or Bank Transfer. Get paid upfront, every time.', icon: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
  { t: 'Product Sales', d: 'Not just bookings. Sell wigs, care products, or merchandise directly from your storefront.', icon: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
  { t: 'Google Calendar Sync', d: 'Avoid double-bookings. We automatically block slots when you have personal plans.', icon: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
  { t: 'Automated Reminders', d: 'We send WhatsApp and Email reminders so your clients never miss an appointment.', icon: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
  { t: 'Referral Rewards', d: 'Refer 3 friends and get a free month. Unlimited earnings potential.', icon: <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /> },
  { t: 'Bio-Link Ready', d: 'A beautiful, mobile-first page designed to look perfect inside Instagram and TikTok.', icon: <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /> },
];

const steps = [
  { n: '1', t: 'Create Your Storefront', d: 'Add your business name, services, and products. Your professional link will be live within 30 minutes.' },
  { n: '2', t: 'Set Your Availability', d: 'Define your working hours for bookings and manage your product inventory.' },
  { n: '3', t: 'Add to Your Bio', d: 'Paste your unique booknaija.com/yourname link into your Instagram or TikTok bio.' },
];

const metrics = [
  { value: '24/7', label: 'Bookings & Sales' },
  { value: '0%', label: 'Commission Fees' },
  { value: '₦', label: 'Instant Payments' },
  { value: '100%', label: 'Your Audience' },
];

export default function Landing() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bn-theme') || 'dark';
    return 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const debounceTimer = useRef(null);

  const active = useMemo(() => businessCategories[activeCategory], [activeCategory]);
  const d = theme === 'dark';

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('bn-theme', next);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.add('bn-anim-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bn-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('bn-anim-ready');
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev === businessCategories.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const q = searchQuery.trim().toLowerCase();
        const { data, error } = await supabase
          .from('businesses')
          .select('slug, name, tagline, logo, accent')
          .eq('active', true)
          .or('name.ilike.%' + q + '%,slug.ilike.%' + q + '%')
          .limit(8);
        if (error) {
          setSearchResults([]);
        } else {
          setSearchResults(data || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // Theme tokens  light mode uses deeper, more saturated values
  const T = {
    page: d ? 'bg-[#050505]' : 'bg-white',
    pageText: d ? 'text-white' : 'text-zinc-900',
    nav: d ? 'bg-[#050505]/90 border-white/[0.08]' : 'bg-white/90 border-zinc-300',
    text: d ? 'text-white' : 'text-zinc-900',
    textSub: d ? 'text-zinc-300' : 'text-zinc-700',
    textMuted: d ? 'text-zinc-400' : 'text-zinc-600',
    textFaint: d ? 'text-zinc-600' : 'text-zinc-400',
    textAccent: d ? 'text-lime-400' : 'text-lime-700',
    border: d ? 'border-white/[0.08]' : 'border-zinc-300',
    borderHover: d ? 'hover:border-white/15' : 'hover:border-zinc-400',
    borderSub: d ? 'border-white/[0.05]' : 'border-zinc-200',
    sectionBorder: d ? 'border-white/[0.06]' : 'border-zinc-200',
    card: d ? 'bg-white/[0.04]' : 'bg-zinc-100',
    cardAlt: d ? 'bg-white/[0.06]' : 'bg-zinc-200/70',
    input: d
      ? 'bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:ring-lime-500/50 focus:border-lime-500/50'
      : 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:ring-lime-500/30 focus:border-lime-500/30',
    searchDrop: d ? 'bg-zinc-900 border-white/10 shadow-black/40' : 'bg-white border-zinc-300 shadow-lg',
    searchItem: d ? 'hover:bg-white/5 border-white/5' : 'hover:bg-zinc-50 border-zinc-200',
    footer: d ? 'bg-[#0A0A0A] border-white/[0.06]' : 'bg-zinc-100 border-zinc-200',
    accentBg: d ? 'bg-lime-500/10' : 'bg-lime-100',
    accentBg2: d ? 'bg-lime-500/15' : 'bg-lime-200',
    accentBorder: d ? 'border-lime-400/20' : 'border-lime-500/30',
    accentBgSub: d ? 'bg-lime-400/5' : 'bg-lime-50',
    dot: d ? 'bg-zinc-700' : 'bg-zinc-400',
    mockFrame: d ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-300 border-zinc-400',
    mockScreen: d ? 'bg-[#0A0A0A]' : 'bg-zinc-100',
    mockBar: d ? 'bg-zinc-800' : 'bg-zinc-300',
    mockCard: d ? 'bg-white/[0.06] border-white/[0.08]' : 'bg-white border-zinc-300',
    mockCardDim: d ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-zinc-50 border-zinc-200',
    mockDisabled: d ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-400',
    badge: d ? 'bg-[#0A0A0A] border-white/[0.1]' : 'bg-white border-zinc-300 shadow-sm',
    badgeIcon: d ? 'bg-white/[0.06]' : 'bg-zinc-200',
    linkColor: d ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900',
    catInactive: d
      ? 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:border-white/15 hover:text-white'
      : 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:text-zinc-900',
    urlBar: d ? 'bg-[#0A0A0A]' : 'bg-zinc-100',
    redIcon: d ? 'text-red-400' : 'text-red-500',
    redIconSub: d ? 'text-red-400/60' : 'text-red-400',
    analyticsBg: d ? 'bg-black/10' : 'bg-white/30',
    analyticsBorder: d ? 'border-black/5' : 'border-white/20',
    accentDot: d ? 'bg-lime-400/10' : 'bg-lime-200',
    accentDotBorder: d ? 'border-lime-400/20' : 'border-lime-400/40',
  };

  return (
    <div className={`min-h-screen ${T.page} ${T.pageText} font-sans selection:bg-lime-500/30 selection:text-white overflow-x-hidden transition-colors duration-300`}>
      <style>{`
        [data-animate]{opacity:1;transform:translateY(0)}
        .bn-anim-ready [data-animate]{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
        .bn-anim-ready [data-animate].bn-visible{opacity:1;transform:translateY(0)}
        .bn-anim-ready [data-delay-1]{transition-delay:.1s}
        .bn-anim-ready [data-delay-2]{transition-delay:.2s}
        .bn-anim-ready [data-delay-3]{transition-delay:.3s}
        @keyframes bn-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .bn-float{animation:bn-float 3s ease-in-out infinite}
        @keyframes bn-float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .bn-float2{animation:bn-float2 3.5s ease-in-out infinite;animation-delay:.6s}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-lime-400 text-black text-center py-2 px-4 text-xs sm:text-sm font-bold">
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black" />
          </span>
          <span className="hidden sm:inline">Meta took down your page?</span>
          <span className="sm:hidden">Meta took your page?</span>
          &nbsp;Your BookNaija link never goes down.
          <Link to="/signup" className="underline underline-offset-2 font-extrabold hover:text-lime-900 transition-colors ml-1">
            Get protected →
          </Link>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className={`${T.nav} backdrop-blur-xl sticky top-0 z-50 border-b transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/fav-removebg.png" alt="BookNaija" className="h-8 w-auto transition-transform group-hover:scale-105" />
            
          </Link>

          <div className={`hidden md:flex items-center gap-6 text-sm font-medium ${T.textMuted}`}>
            <a href="#features" className={`hover:${T.text} transition-colors`}>Features</a>
            <a href="#showcase" className={`hover:${T.text} transition-colors`}>Showcase</a>
            <a href="#pricing" className={`hover:${T.text} transition-colors`}>Pricing</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/dashboard" className={`hidden sm:flex text-sm font-medium ${T.linkColor} transition-colors`}>
              Dashboard
            </Link>
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                d ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
              aria-label="Toggle theme"
            >
              {d ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              to="/signup"
              className="bg-lime-400 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-bold hover:bg-lime-300 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* LEFT */}
              <div className="relative z-10" data-animate>
                <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
                  RUN YOUR
                  <br />
                  BUSINESS
                  <br />
                  <span className={T.textAccent}>WITHOUT</span>
                  <br />
                  INSTAGRAM DMs
                </h1>

                <p className={`mt-6 sm:mt-8 text-base sm:text-lg ${T.textSub} leading-relaxed max-w-lg`}>
                  Build a storefront that takes bookings, receives payments, sells
                  products, and keeps your business alive even when social platforms fail you.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/signup"
                    className="bg-lime-400 text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold hover:bg-lime-300 transition-all text-center flex items-center justify-center gap-2"
                  >
                    Create Storefront
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <button
                    className={`border ${T.border} ${T.card} transition-all px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold ${T.textSub} flex items-center justify-center gap-2`}
                  >
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${T.textAccent}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Demo
                  </button>
                </div>

                <div className={`mt-4 flex items-center gap-2 text-sm ${T.textMuted}`}>
                  Refer 3 friends = <span className={`font-semibold ${T.textAccent}`}>1 Free Month</span>
                </div>

                {/* Search Bar */}
                <div className="max-w-sm mt-8">
                  <label className={`block text-sm font-medium ${T.textMuted} mb-2`}>
                    Find a registered business
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`h-4 w-4 ${T.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className={`block w-full pl-9 pr-3 py-2.5 ${T.input} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="animate-spin h-4 w-4 text-lime-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {searchQuery.trim() && (
                    <div className={`mt-2 ${T.searchDrop} rounded-lg overflow-hidden shadow-xl`}>
                      {isSearching ? (
                        <div className="px-3 py-4 text-center">
                          <p className={`text-sm ${T.textMuted}`}>Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-56 overflow-y-auto">
                          {searchResults.map((b) => (
                            <Link
                              key={b.slug}
                              to={'/' + b.slug}
                              className={`block px-3 py-2.5 transition-colors border-b last:border-0 ${T.searchItem}`}
                              onClick={() => setSearchQuery('')}
                            >
                              <div className="flex items-center gap-2.5">
                                {b.logo ? (
                                  <div className="bg-white rounded p-0.5">
                                    <img src={b.logo} alt="" className="w-6 h-6 object-contain" />
                                  </div>
                                ) : (
                                  <div
                                    className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: b.accent || '#52525b' }}
                                  >
                                    {b.name ? b.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() : '??'}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${T.text} truncate`}>{b.name}</p>
                                  <p className={`text-xs ${T.textMuted} truncate`}>{b.tagline}</p>
                                </div>
                                <div className={`text-[9px] font-semibold ${T.textAccent} ${T.accentBg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                                  Visit
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : hasSearched ? (
                        <div className="px-3 py-4 text-center">
                          <p className={`text-sm ${T.textMuted}`}>No businesses found</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className={`mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t ${T.borderSub} pt-8`}>
                  {metrics.map((item) => (
                    <div key={item.label}>
                      <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${T.text}`}>
                        {item.value}
                      </div>
                      <div className={`text-xs sm:text-sm ${T.textMuted} mt-1 font-medium`}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT  Desktop Phone Mockup */}
              <div className="hidden lg:flex items-center justify-center relative" data-animate data-delay-2>
                <div
                  className="relative"
                  style={{ transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
                >
                  <div className={`relative ${T.mockFrame} rounded-[2.5rem] p-2.5 border`}>
                    <div className={`${T.mockScreen} rounded-[2rem] h-[540px] w-[280px] overflow-hidden flex flex-col`}>
                      <div className={`h-7 ${T.mockScreen} flex justify-between items-center px-5 pt-1.5`}>
                        <div className={`text-[10px] font-medium ${T.textMuted}`}>9:41</div>
                        <div className={`w-16 h-4 ${T.mockBar} rounded-full absolute left-1/2 -translate-x-1/2 top-1.5`} />
                        <div className="flex gap-0.5">
                          <div className={`w-2.5 h-2.5 ${T.dot} rounded-full`} />
                          <div className={`w-2.5 h-2.5 ${T.dot} rounded-full`} />
                        </div>
                      </div>

                      <div className={`flex-1 p-4 pt-2 flex flex-col ${T.mockScreen}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className={`text-[10px] ${T.textMuted} uppercase tracking-wider font-semibold`}>storefront</div>
                            <div className={`font-bold text-base mt-0.5 ${T.text}`}>Braid Gallery</div>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-extrabold text-sm">
                            BG
                          </div>
                        </div>

                        <div className="rounded-xl bg-lime-400 text-black p-4">
                          <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">This Week</div>
                          <div className="text-3xl font-extrabold mt-1">₦420k</div>
                          <div className="text-xs font-semibold opacity-80 mt-1">Revenue processed</div>
                        </div>

                        <div className="mt-4 flex-1 space-y-2 overflow-hidden">
                          {[
                            { title: 'Knotless Braids', price: '₦25,000', tag: 'Book' },
                            { title: 'Silk Bonnet', price: '₦5,000', tag: 'Buy' },
                            { title: 'Wig Install', price: '₦10,000', tag: 'Full', disabled: true },
                          ].map((item) => (
                            <div
                              key={item.title}
                              className={`p-2.5 rounded-lg flex items-center justify-between ${item.disabled ? T.mockCardDim + ' opacity-50' : T.mockCard}`}
                            >
                              <div>
                                <div className={`font-medium text-xs ${item.disabled ? T.textMuted : T.text}`}>{item.title}</div>
                                <div className={`text-[10px] ${T.textMuted} mt-0.5`}>{item.price}</div>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-2.5 py-1 rounded ${item.disabled ? T.mockDisabled : 'bg-lime-400 text-black'}`}
                              >
                                {item.tag}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className={`mt-2 ${T.mockCard} rounded-xl p-3`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`text-[10px] ${T.textMuted}`}>Today</div>
                              <div className={`text-xl font-extrabold ${T.text}`}>18 Clients</div>
                            </div>
                            <div className={`w-9 h-9 rounded-full ${T.accentDot} border ${T.accentDotBorder} flex items-center justify-center`}>
                              <div className="w-3 h-3 rounded-full bg-lime-400 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Payment Badge */}
                  <div className={`absolute -right-6 top-20 ${T.badge} p-2.5 rounded-lg shadow-lg bn-float z-10`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 ${T.accentBg2} rounded-full flex items-center justify-center`}>
                        <svg className={`w-3.5 h-3.5 ${T.textAccent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-[9px] ${T.textMuted}`}>Payment</p>
                        <p className={`text-[11px] font-bold ${T.textAccent}`}>₦25,000</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Meta Shield Badge */}
                  <div className={`absolute -left-4 bottom-28 ${T.badge} p-2.5 rounded-lg shadow-lg bn-float2 z-10`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 ${T.badgeIcon} rounded-full flex items-center justify-center`}>
                        <svg className={`w-3.5 h-3.5 ${T.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-[9px] ${T.textMuted}`}>Meta-proof</p>
                        <p className={`text-[9px] font-bold ${T.text}`}>Always live</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile Dashboard Preview ── */}
            <div className="lg:hidden mt-10" data-animate data-delay-2>
              <div className={`${T.badge} ${T.border} rounded-2xl p-4 overflow-hidden`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className={`text-[10px] ${T.textMuted} uppercase tracking-wider font-semibold`}>storefront</div>
                    <div className={`font-bold text-lg ${T.text}`}>Braid Gallery</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-extrabold text-sm">
                    BG
                  </div>
                </div>
                <div className="rounded-xl bg-lime-400 text-black p-4">
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">This Week</div>
                  <div className="text-3xl font-extrabold mt-1">₦420k</div>
                  <div className="text-xs font-semibold opacity-80 mt-1">Revenue processed</div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { title: 'Knotless Braids', price: '₦25,000', tag: 'Book' },
                    { title: 'Silk Bonnet', price: '₦5,000', tag: 'Buy' },
                  ].map((item) => (
                    <div key={item.title} className={`${T.mockCard} rounded-lg p-3 flex items-center justify-between`}>
                      <div>
                        <div className={`text-sm font-medium ${T.text}`}>{item.title}</div>
                        <div className={`text-xs ${T.textMuted} mt-0.5`}>{item.price}</div>
                      </div>
                      <span className="bg-lime-400 text-black text-[10px] font-bold px-2.5 py-1 rounded-md">{item.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BUSINESS SHOWCASE ── */}
        <section id="showcase" className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10" data-animate>
              <div>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
                  NOT JUST FOR
                  <br />
                  <span className={T.textMuted}>BEAUTY BRANDS</span>
                </h2>
              </div>
              <p className={`${T.textSub} text-base sm:text-lg max-w-md leading-relaxed`}>
                Hairstylists, realtors, restaurants, shortlets, auto dealers, tutors  one storefront adapts to every business.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide" data-animate data-delay-1>
              {businessCategories.map((cat, i) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(i)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 rounded-lg whitespace-nowrap transition-all text-xs sm:text-sm font-semibold ${
                    activeCategory === i
                      ? 'bg-lime-400 text-black'
                      : T.catInactive
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    {cat.icon}
                  </svg>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Showcase Layout */}
            <div className="mt-8 grid lg:grid-cols-2 gap-6 items-start" data-animate data-delay-2>
              {/* Info Card */}
              <div className={`${T.cardAlt} ${T.border} rounded-xl p-6 relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-lime-400" />
                <div className={`${T.textMuted} uppercase tracking-[0.2em] text-[10px] font-semibold`}>Live Storefront</div>
                <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 ${T.text}`}>{active.name}</div>
                <div className={`mt-4 ${T.textSub} leading-relaxed text-sm sm:text-base`}>
                  Accept bookings, collect payments, sell products, and run your business from one mobile-first storefront.
                </div>
                <div className="mt-6 space-y-3">
                  {active.items.map((item) => (
                    <div key={item} className={`flex items-center gap-3 p-3 ${T.card} ${T.borderSub} border rounded-lg`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0`} />
                      <div className={`text-sm font-medium ${T.text}`}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browser Mockup */}
              <div className={`${T.cardAlt} ${T.border} rounded-xl overflow-hidden`}>
                <div className={`flex items-center gap-1.5 px-4 py-3 border-b ${T.borderSub} ${T.urlBar}`}>
                  <div className="flex gap-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${T.dot}`} />
                    <div className={`w-2.5 h-2.5 rounded-full ${T.dot}`} />
                    <div className={`w-2.5 h-2.5 rounded-full ${T.dot}`} />
                  </div>
                  <div className={`ml-3 ${T.mockScreen} rounded px-3 py-1 text-[10px] ${T.textMuted} border ${T.borderSub} font-mono flex-1 text-center`}>
                    {active.example}
                  </div>
                </div>

                <div className={`p-4 sm:p-6 ${T.page}`}>
                  <div className={`rounded-xl overflow-hidden ${T.card} ${T.border}`}>
                    <div className={`h-28 sm:h-36 ${T.accentBgSub} relative`}>
                      <div className={`absolute inset-0 ${T.textMuted} flex items-center justify-center text-xs font-medium`}>
                        Cover Image
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className={`text-lg sm:text-xl font-extrabold ${T.text}`}>{active.name}</div>
                          <div className={`${T.textMuted} mt-0.5 text-xs sm:text-sm`}>Lagos, Nigeria</div>
                        </div>
                        <button className="bg-lime-400 text-black px-4 py-2 rounded-lg font-bold text-xs flex-shrink-0">
                          Book Now
                        </button>
                      </div>
                      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {active.items.map((item) => (
                          <div key={item} className={`${T.card} ${T.borderSub} border rounded-lg p-3`}>
                            <div className={`h-14 rounded ${T.card} ${T.borderSub} border mb-2`} />
                            <div className={`font-semibold text-xs ${T.text}`}>{item}</div>
                            <div className={`text-[10px] ${T.textMuted} mt-0.5`}>Available now</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* More Categories */}
            <div className="mt-10 text-center" data-animate data-delay-3>
              <p className={`text-[10px] font-semibold ${T.textMuted} uppercase tracking-widest mb-3`}>Also perfect for</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {moreCategories.map((cat) => (
                  <span key={cat} className={`px-3 py-1.5 ${T.card} ${T.border} rounded-md text-xs ${T.textSub}`}>
                    {cat}
                  </span>
                ))}
                <span className={`px-3 py-1.5 ${T.card} ${T.border} rounded-md text-xs ${T.textSub}`}>
                  &amp; more
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── META-PROOF COMPARISON ── */}
        <section className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div data-animate>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
                  STOP BUILDING
                  <br />
                  ON RENTED
                  <br />
                  <span className={T.textMuted}>LAND</span>
                </h2>
                <p className={`mt-6 ${T.textSub} text-base sm:text-lg leading-relaxed max-w-lg`}>
                  Instagram and Facebook pages get disabled every day  often without
                  warning. When your page goes down, your DMs, your audience, and
                  your income disappear.{' '}
                  <span className={`font-semibold ${T.text}`}>Not with BookNaija.</span>
                </p>
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 bg-lime-400 text-black px-6 py-3 text-sm font-bold rounded-xl hover:bg-lime-300 transition-all mt-6"
                >
                  Protect Your Business
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              <div className="space-y-4" data-animate data-delay-2>
                {/* Without BookNaija */}
                <div className={`${T.card} ${T.border} rounded-xl p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 ${T.badgeIcon} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-4 h-4 ${T.redIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${T.text}`}>Without BookNaija</p>
                      <p className={`text-[10px] ${T.textMuted}`}>Meta page disabled</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['All DMs gone', 'No way to receive bookings', "Clients can't find you", 'Income stops completely'].map((item) => (
                      <div key={item} className={`flex items-center gap-2 text-sm ${T.textMuted}`}>
                        <svg className={`w-3.5 h-3.5 ${T.redIconSub} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* With BookNaija */}
                <div className={`${T.cardAlt} ${T.border} rounded-xl p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 ${T.accentBg} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-4 h-4 ${T.textAccent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${T.text}`}>With BookNaija</p>
                      <p className={`text-[10px] ${T.textAccent}`}>Business as usual</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['Link still works perfectly', 'Bookings keep coming in', 'Payments still process', 'Your income never stops'].map((item) => (
                      <div key={item} className={`flex items-center gap-2 text-sm ${T.text}`}>
                        <svg className={`w-3.5 h-3.5 ${T.textAccent} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GET PAID + OWN AUDIENCE ── */}
        <section id="features" className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 md:space-y-24">
            {/* Get Paid */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div data-animate>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
                  NO MORE
                  <br />
                  <span className={T.textMuted}>"I'LL PAY</span>
                  <br />
                  LATER"
                </h2>
                <p className={`mt-6 ${T.textSub} text-base sm:text-lg leading-relaxed max-w-lg`}>
                  Clients book and pay before arriving. No chasing transfers. No
                  missed appointments. No endless DMs.
                </p>
              </div>

              <div className={`${T.card} ${T.border} rounded-xl p-5 sm:p-6 relative overflow-hidden`} data-animate data-delay-2>
                <div className={`absolute top-0 left-0 w-px h-full ${d ? 'bg-gradient-to-b from-lime-400/40 to-transparent' : 'bg-gradient-to-b from-lime-500/30 to-transparent'} ml-[1.85rem]`} />
                <div className="space-y-3">
                  {[
                    'Client booked appointment',
                    'Payment received instantly',
                    'Calendar updated automatically',
                    'Reminder sent via WhatsApp',
                  ].map((item, i) => (
                    <div key={item} className={`flex items-center gap-4 ${T.page} ${T.borderSub} border rounded-lg p-3.5 sm:p-4`}>
                      <div className={`w-8 h-8 rounded-lg ${T.accentBg} ${T.textAccent} font-bold flex items-center justify-center text-xs border ${T.accentBorder} flex-shrink-0`}>
                        {i + 1}
                      </div>
                      <div className={`font-medium text-sm ${T.text}`}>{item}</div>
                      <div className={`w-2 h-2 rounded-full bg-lime-500 ml-auto flex-shrink-0`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Own Your Audience */}
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-1" data-animate data-delay-1>
                <div className="bg-lime-400 rounded-xl p-6 sm:p-8 text-black relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">Business Analytics</div>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        ['₦1.2M', 'Monthly Revenue'],
                        ['84%', 'Repeat Clients'],
                        ['324', 'Bookings'],
                        ['4.9★', 'Client Rating'],
                      ].map(([v, l]) => (
                        <div key={l} className={`${T.analyticsBg} rounded-lg p-3 sm:p-4 border ${T.analyticsBorder}`}>
                          <div className="text-2xl sm:text-3xl font-extrabold">{v}</div>
                          <div className="mt-1 text-xs font-medium opacity-70">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2" data-animate>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
                  YOUR DATA,
                  <br />
                  YOUR CLIENTS,
                  <br />
                  <span className={T.textMuted}>YOUR RULES</span>
                </h2>
                <p className={`mt-6 ${T.textSub} text-base sm:text-lg leading-relaxed max-w-lg`}>
                  Social platforms can suspend pages overnight. Your storefront,
                  payments, client data, and bookings stay fully under your control.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-10" data-animate>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
                EVERYTHING <span className={T.textMuted}>INCLUDED</span>
              </h2>
              <p className={`mt-4 ${T.textSub} text-base sm:text-lg max-w-xl mx-auto`}>
                Everything you need to run your business from your phone.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {features.map((f, i) => (
                <div
                  key={f.t}
                  className={`${T.card} ${T.border} rounded-lg p-5 transition-all duration-200 hover:scale-[1.01]`}
                  data-animate
                  data-delay-1={i % 3 === 1 ? true : undefined}
                  data-delay-2={i % 3 === 2 ? true : undefined}
                  data-delay-3={i % 3 === 0 ? true : undefined}
                >
                  <div className={`w-9 h-9 ${T.badgeIcon} ${T.textSub} rounded-lg flex items-center justify-center mb-3`}>
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      {f.icon}
                    </svg>
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${T.text}`}>{f.t}</h4>
                  <p className={`${T.textSub} text-sm leading-relaxed`}>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div data-animate>
                <h2 className={`text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.05em] leading-[0.9] ${T.text}`}>
                  ₦2,500<span className={`${T.textMuted} text-2xl sm:text-3xl font-medium`}>/mo</span>
                </h2>
                <p className={`mt-6 ${T.textSub} text-base sm:text-lg max-w-md leading-relaxed`}>
                  Everything included. Unlimited bookings. Unlimited products.
                  Unlimited payments. No commissions.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {['Unlimited Bookings', 'Card Payments', 'Bank Transfers', 'WhatsApp Reminders', 'Product Sales', 'Custom Storefront'].map((item) => (
                    <div key={item} className={`px-3 py-1.5 rounded-md border ${T.accentBorder} ${T.accentBg} ${T.textAccent} text-xs font-medium`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative" data-animate data-delay-2>
                <div className={`${T.cardAlt} p-6 sm:p-8 rounded-xl ${T.border}`}>
                  <div className="absolute -top-3 left-6 bg-lime-400 text-black px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    All Access
                  </div>
                  <div className="pt-4">
                    <p className={`${T.textMuted} text-[10px] font-semibold uppercase tracking-wider mb-2`}>Monthly Plan</p>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl sm:text-5xl font-extrabold tracking-tighter ${T.text}`}>₦2,500</span>
                        <span className={`${T.textMuted} font-medium text-sm`}>/month</span>
                      </div>
                    </div>
                    <ul className="space-y-2.5 mb-6 text-sm">
                      {[
                        'Sell Services & Products',
                        'Card & Bank Transfer Payments',
                        'Google Calendar Sync',
                        'Listings for any business type',
                        'Meta-proof storefront',
                      ].map((item) => (
                        <li key={item} className={`flex items-center gap-2.5 ${T.textSub}`}>
                          <div className={`w-4 h-4 ${T.accentBg2} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <svg className={`w-2.5 h-2.5 ${T.textAccent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {item}
                        </li>
                      ))}
                      <li className={`flex items-center gap-2.5 ${T.text} font-semibold pt-1`}>
                        <div className={`w-4 h-4 ${T.accentBg2} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-2.5 h-2.5 ${T.textAccent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        Refer 3 friends = 1 Free Month
                      </li>
                    </ul>
                    <Link
                      to="/signup"
                      className="block w-full bg-lime-400 text-black py-3.5 font-bold rounded-xl hover:bg-lime-300 transition-all text-center text-sm"
                    >
                      Start Your Storefront
                    </Link>
                    <p className={`mt-2.5 text-xs ${T.textMuted} text-center`}>Cancel anytime. No contracts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STEPS ── */}
        <section className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 max-w-xl mx-auto" data-animate>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${T.text}`}>
                Ready in <span className={T.textAccent}>30 minutes</span>
              </h2>
              <p className={`mt-3 ${T.textSub} text-sm sm:text-base`}>We handle technical setup. You just handle the business.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 relative">
              <div className={`hidden sm:block absolute top-8 left-[16%] right-[16%] h-px ${T.borderSub}`} />
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`relative ${T.card} p-5 sm:p-6 rounded-xl ${T.border} ${T.borderHover} transition-all`}
                  data-animate
                  data-delay-1={i === 0 ? true : undefined}
                  data-delay-2={i === 1 ? true : undefined}
                  data-delay-3={i === 2 ? true : undefined}
                >
                  <div className={`w-10 h-10 ${T.accentBg} ${T.textAccent} rounded-lg flex items-center justify-center font-extrabold text-base mb-4`}>
                    {s.n}
                  </div>
                  <h4 className={`text-base font-bold mb-1.5 ${T.text}`}>{s.t}</h4>
                  <p className={`${T.textSub} text-sm leading-relaxed`}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className={`relative py-16 md:py-24 lg:py-32 border-t ${T.sectionBorder} overflow-hidden z-10`}>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center" data-animate>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.04em] leading-[0.95] ${T.text}`}>
              BUILD A BUSINESS
              <br />
              <span className={T.textMuted}>THAT DOESN'T DEPEND ON</span>
              <br />
              SOCIAL MEDIA
            </h2>
            <p className={`mt-6 ${T.textSub} text-base sm:text-lg max-w-2xl mx-auto leading-relaxed`}>
              Your storefront stays online. Your payments keep working. Your business keeps growing.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="bg-lime-400 text-black px-8 py-4 rounded-xl text-sm sm:text-base font-bold hover:bg-lime-300 transition-all inline-flex items-center justify-center gap-2"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                className={`border ${T.border} ${T.card} transition-all px-8 py-4 rounded-xl text-sm sm:text-base font-semibold ${T.textSub} inline-flex items-center justify-center gap-2`}
              >
                See Demo
              </button>
            </div>
            <p className={`mt-4 text-xs sm:text-sm ${T.textMuted}`}>
              No contracts. Cancel anytime. Refer 3 friends = 1 free month.
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className={`${T.footer} border-t pt-10 pb-8 px-4 sm:px-6 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <img src="/fav-removebg.png" alt="BookNaija" className="h-8 w-auto" />
                
              </Link>
              <p className={`text-xs mt-2 max-w-[200px] ${T.textMuted}`}>Your business. One simple link. Meta-proof.</p>
            </div>
            <div className="flex gap-8 sm:gap-12">
              <div className="space-y-2.5">
                <p className={`text-[10px] font-bold ${T.textMuted} uppercase tracking-widest`}>Product</p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><a href="#pricing" className={`${T.textMuted} hover:text-lime-500 transition-colors`}>Pricing</a></li>
                  <li><a href="#features" className={`${T.textMuted} hover:text-lime-500 transition-colors`}>Features</a></li>
                  <li><Link to="/signup" className={`${T.textMuted} hover:text-lime-500 transition-colors`}>Sign Up</Link></li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <p className={`text-[10px] font-bold ${T.textMuted} uppercase tracking-widest`}>Partners</p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><Link to="/affiliate-signup" className={`${T.textMuted} hover:text-lime-500 transition-colors`}>Affiliate</Link></li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <p className={`text-[10px] font-bold ${T.textMuted} uppercase tracking-widest`}>Company</p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><Link to="/blog" className={`${T.textMuted} hover:text-lime-500 transition-colors`}>Blog</Link></li>
                  <li><Link to="/privacy" className={`${T.textMuted} hover:text-lime-500 transition-colors`}>Privacy</Link></li>
                  <li><Link to="/terms" className={`${T.textMuted} hover:text-lime-500 transition-colors`}>Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className={`pt-6 border-t ${T.borderSub} flex flex-col sm:flex-row justify-between gap-3 items-center`}>
            <p className={`text-xs ${T.textFaint}`}>
              © {new Date().getFullYear()} BookNaija Technologies.
            </p>
            <div className={`flex gap-4 text-xs ${T.textFaint}`}>
              <Link to="/terms" className="hover:text-lime-500 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-lime-500 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}