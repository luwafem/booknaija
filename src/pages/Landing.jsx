import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const steps = [
  { 
    n: '1', 
    t: 'Create Your Storefront', 
    d: 'Add your business name, services, and products. Your professional link will be live within 30 minutes.' 
  },
  { 
    n: '2', 
    t: 'Set Your Availability', 
    d: 'Define your working hours for bookings and manage your product inventory.' 
  },
  { 
    n: '3', 
    t: 'Add to Your Bio', 
    d: 'Paste your unique booknaija.com/yourname link into your Instagram or TikTok bio.' 
  },
];

const features = [
  { t: 'Card & Bank Transfer', d: 'Stop chasing money. Clients pay securely via Paystack or directly via Bank Transfer. Get paid upfront, every time.', icon: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
  { t: 'Product Sales', d: 'Not just bookings. Sell wigs, care products, or merchandise directly from your storefront.', icon: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
  { t: 'Google Calendar Sync', d: 'Avoid double-bookings. We automatically block slots when you have personal plans.', icon: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
  { t: 'Automated Reminders', d: 'We send WhatsApp and Email reminders to your clients so they never miss an appointment.', icon: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
  { t: 'Referral Rewards', d: 'Refer 3 friends to BookNaija and get a free month. Unlimited earnings potential.', icon: <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /> },
  { t: 'Bio-Link Ready', d: 'A beautiful, mobile-first page designed to look perfect inside Instagram and TikTok.', icon: <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /> },
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(function () {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);

    debounceTimer.current = setTimeout(async function () {
      try {
        var query = searchQuery.trim().toLowerCase();
        
        var { data, error } = await supabase
          .from('businesses')
          .select('slug, name, tagline, logo, accent')
          .eq('active', true)
          .or('name.ilike.%' + query + '%,slug.ilike.%' + query + '%')
          .limit(8);

        if (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } else {
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('Search exception:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 300);

    return function () {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white">
      
      {/* Header - White background */}
      <nav className="bg-white sticky top-0 z-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/fav-removebg.png" 
              alt="BookNaija Logo" 
              className="h-9 w-auto object-contain" 
            />
          </Link>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link 
              to="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
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

      <main className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0  pointer-events-none" />
          
          <div className="relative px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5">
                Your business. <br />
                <span className="text-white">
                  One simple link.
                </span>
              </h1>
              
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-lg mb-8">
                Stop the <span className="text-white font-medium">DM to book</span> cycle. Turn your bio into a professional storefront where clients book services, buy products, and pay upfront.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link 
                  to="/signup"
                  className="inline-flex items-center justify-center bg-white text-zinc-900 px-7 py-3.5 text-sm md:text-base font-semibold rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.02]"
                >
                  Get Started for ₦2,500
                </Link>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  Refer & Earn Free Months
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-sm">
                <label className="block text-sm font-medium text-zinc-400 mb-2.5">
                  Find a registered business
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-4.5 w-4.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3.5 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={function(e) { setSearchQuery(e.target.value); }}
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                      <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>

                {searchQuery.trim() && (
                  <div className="mt-2.5 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
                    {isSearching ? (
                      <div className="px-3.5 py-5 text-center">
                        <p className="text-sm text-zinc-500">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        {searchResults.map(function (b) {
                          return (
                            <Link 
                              key={b.slug} 
                              to={'/' + b.slug}
                              className="block px-3.5 py-2.5 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                              onClick={function() { setSearchQuery(''); }}
                            >
                              <div className="flex items-center gap-2.5">
                                {b.logo ? (
                                  <div className="bg-white rounded-md p-0.5">
                                    <img 
                                      src={b.logo} 
                                      alt="" 
                                      className="w-7 h-7 object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div 
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: b.accent || '#52525b' }}
                                  >
                                    {b.name ? b.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase() : '??'}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{b.name}</p>
                                  <p className="text-xs text-zinc-500 truncate">{b.tagline}</p>
                                </div>
                                <div className="text-[10px] font-medium text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-md flex-shrink-0">
                                  Visit
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : hasSearched ? (
                      <div className="px-3.5 py-5 text-center">
                        <p className="text-sm text-zinc-500">No businesses found</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* 3D Phone Mockup - Scaled down */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
              <div className="relative scale-90 lg:scale-100" style={{ 
                transform: 'perspective(1000px) rotateY(-12deg) rotateX(4deg)',
                transformStyle: 'preserve-3d'
              }}>
                {/* Phone Frame */}
                <div className="relative bg-zinc-800 rounded-[2.5rem] p-2.5 border-3 border-zinc-700 shadow-2xl">
                  <div className="bg-zinc-950 rounded-[2rem] h-[520px] w-[280px] overflow-hidden flex flex-col">
                    {/* Status Bar */}
                    <div className="h-7 bg-zinc-950 flex justify-between items-center px-5 pt-1.5">
                      <div className="text-[10px] font-medium">9:41</div>
                      <div className="w-16 h-4 bg-zinc-800 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5" />
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 bg-zinc-700 rounded-full" />
                        <div className="w-3 h-3 bg-zinc-700 rounded-full" />
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="flex-1 p-4 pt-3 flex flex-col bg-zinc-950">
                      <div className="flex items-center gap-3.5 mb-6">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5">
                          <img src="/fav-removebg.png" alt="" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">Braid Gallery</h3>
                          <p className="text-[10px] text-zinc-500">Lagos, Nigeria</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                          <div className="flex justify-between items-start mb-1.5">
                            <div>
                              <p className="font-medium text-sm">Knotless Braids</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">3h • ₦25,000</p>
                            </div>
                            <button className="bg-white text-zinc-900 text-[10px] font-medium px-3 py-1.5 rounded-lg">Book</button>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">Silk Bonnet</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">Item • ₦5,000</p>
                            </div>
                            <button className="bg-zinc-800 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg">Buy</button>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 opacity-60">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">Wig Install</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">1h • ₦10,000</p>
                            </div>
                            <button className="bg-zinc-800 text-zinc-500 text-[10px] font-medium px-3 py-1.5 rounded-lg" disabled>Full</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -right-6 top-24 bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-lg" style={{ transform: 'translateZ(40px)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium">Payment</p>
                      <p className="text-xs font-semibold">Received</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantage Section */}
        <section className="py-20 border-t border-zinc-800 ">
          <div className="px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative scale-95" style={{ transform: 'perspective(1000px) rotateY(4deg)', transformStyle: 'preserve-3d' }}>
                  <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-5 pb-5 border-b border-zinc-800">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      </div>
                      <div className="flex-1 bg-zinc-950 h-7 rounded-md text-[10px] text-zinc-500 flex items-center px-2.5 font-mono">
                        booknaija.com/yourname
                      </div>
                    </div>
                    <div className="text-center py-6">
                      <p className="text-zinc-500 text-sm mb-2">Your Custom Link</p>
                      <div className="text-3xl md:text-4xl font-bold tracking-tight">
                        booknaija.com/<span className="text-white">you</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
                  Sell more than just your <span className="text-white">time</span>.
                </h2>
                <p className="text-zinc-400 text-base mb-7 leading-relaxed">
                  Stop losing sales to missed DMs. Your BookNaija link is a 24/7 storefront that handles bookings, product sales, and payments automatically.
                </p>
                <ul className="space-y-3.5">
                  {['Custom business URL', 'Card & Bank Transfer Payments', 'Real-time availability', 'Sell services & products'].map(function (item) {
                    return (
                      <li key={item} className="flex items-center gap-3.5 text-sm">
                        <div className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
                One price. <br />
                <span className="text-zinc-500">No hidden fees.</span>
              </h2>
              <p className="text-zinc-400 text-base mb-10 leading-relaxed">
                For the price of a nice lunch, you get a complete booking engine and e-commerce store. We don't take a cut of your earnings.
              </p>
              <div className="grid grid-cols-2 gap-5">
                {['No commissions', 'Unlimited bookings', 'Priority WhatsApp support', 'Auto-reminders', 'Product inventory', 'Refer & Earn'].map(function (item) {
                  return (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                      <span className="font-medium text-sm text-zinc-300">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-zinc-700/20 blur-3xl rounded-full" />
              <div className="relative bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                <div className="absolute -top-4 left-6 bg-white text-zinc-900 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  All Access
                </div>
                
                <div className="pt-5">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2.5">Monthly Plan</p>
                  
                  <div className="mb-7">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-bold tracking-tighter">₦2,500</span>
                      <span className="text-zinc-500 font-medium text-sm">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3.5 mb-8 text-sm">
                    <li className="flex items-center gap-2.5 text-zinc-300">
                      <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Sell Services & Products
                    </li>
                    <li className="flex items-center gap-2.5 text-zinc-300">
                      <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Card & Bank Transfer Payments
                    </li>
                    <li className="flex items-center gap-2.5 text-zinc-300">
                      <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Google Calendar Sync
                    </li>
                    <li className="flex items-center gap-2.5 text-white font-medium">
                      Refer 3 friends = 1 Free Month
                    </li>
                  </ul>
                  
                  <Link 
                    to="/signup" 
                    className="block w-full bg-white text-zinc-900 py-3.5 font-semibold rounded-xl hover:bg-zinc-200 transition-all text-center hover:scale-[1.02] text-sm"
                  >
                    Start Your Storefront
                  </Link>
                  
                  <p className="mt-3.5 text-xs text-zinc-500 text-center">Cancel anytime. No contracts.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 border-t border-zinc-800 px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Ready in <span className="text-white">30 minutes</span></h2>
            <p className="text-zinc-400 text-base">We handle technical setup. You just handle the business.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            
            {steps.map(function (s) {
              return (
                <div key={s.n} className="relative bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                  <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 text-white rounded-xl flex items-center justify-center font-bold text-base mb-5 relative z-10 group-hover:scale-105 transition-transform">
                    {s.n}
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{s.t}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{s.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 border-y border-zinc-800 px-6 ">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Included in your plan</h2>
            <p className="text-zinc-400 text-base">Everything you need to run your business from your phone.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(function (f) {
              return (
                <div key={f.t} className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group hover:-translate-y-0.5">
                  <div className="w-10 h-10 bg-zinc-800 text-zinc-400 rounded-lg flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{f.icon}</svg>
                  </div>
                  <h4 className="text-base font-semibold mb-1.5">{f.t}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.d}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer - White background */}
      <footer className="bg-white border-t border-zinc-200 pt-16 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-14">
            <div>
              <Link to="/" className="flex items-center">
                <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-11 w-auto object-contain" />
              </Link>
            </div>
            
            <div className="flex gap-14">
              <div className="space-y-3.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</p>
                <ul className="space-y-2.5 text-sm">
                  <li><Link to="/#pricing" className="text-zinc-600 hover:text-zinc-900 transition-colors">Pricing</Link></li>
                  <li><Link to="/#features" className="text-zinc-600 hover:text-zinc-900 transition-colors">Features</Link></li>
                  <li><Link to="/signup" className="text-zinc-600 hover:text-zinc-900 transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              
              <div className="space-y-3.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Partners</p>
                <ul className="space-y-2.5 text-sm">
                  <li><Link to="/affiliate-signup" className="text-zinc-700 font-medium hover:text-zinc-900 transition-colors">Become an Affiliate</Link></li>
                </ul>
              </div>

              <div className="space-y-3.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Company</p>
                <ul className="space-y-2.5 text-sm">
                  <li><Link to="/blog" className="text-zinc-600 hover:text-zinc-900 transition-colors">Blog</Link></li>
                  <li><Link to="/privacy" className="text-zinc-600 hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-zinc-600 hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-7 border-t border-zinc-100 flex flex-col md:flex-row justify-between gap-5 items-center">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} BookNaija Technologies.
            </p>
            <div className="flex gap-5 text-sm text-zinc-500">
              <Link to="/terms" className="hover:text-zinc-700 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-zinc-700 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}