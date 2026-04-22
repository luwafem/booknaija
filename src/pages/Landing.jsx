import { Link } from 'react-router-dom';

const steps = [
  { 
    n: '1', 
    t: 'Create Your Storefront', 
    d: 'Add your business name, services, and products. Your professional link will be live within 24 hours.' 
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
  { t: 'Upfront Payments', d: 'Stop chasing money. Clients pay at the point of booking so you are guaranteed your fee.', icon: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
  { t: 'Product Sales', d: 'Not just bookings. Sell wigs, care products, or merchandise directly from your storefront.', icon: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
  { t: 'Google Calendar Sync', d: 'Avoid double-bookings. We automatically block slots when you have personal plans.', icon: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
  { t: 'Automated Reminders', d: 'We send WhatsApp and Email reminders to your clients so they never miss an appointment.', icon: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
  { t: 'Referral Rewards', d: 'Refer 3 friends to BookNaija and get a free month. Unlimited earnings potential.', icon: <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /> },
  { t: 'Bio-Link Ready', d: 'A beautiful, mobile-first page designed to look perfect inside Instagram and TikTok.', icon: <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /> },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      
      {/* Header */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 text-white rounded-md flex items-center justify-center font-bold text-sm tracking-tighter">
              BN
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900">BookNaija</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/signup" 
              className="bg-zinc-900 text-white px-6 py-2.5 text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* Hero Section */}
        <section className="pt-20 pb-24 lg:pt-32 lg:pb-40 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-zinc-900 mb-6">
              Your business. <br />
              <span className="text-purple-600">One simple link.</span>
            </h1>
            
            <p className="text-zinc-500 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10 font-normal">
              Stop the  
              <span className="text-purple-600"> DM to book</span> cycle. Turn your bio into a professional storefront where clients book services, buy products, and pay upfront.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <Link 
                to="/signup"
                className="w-full sm:w-auto bg-purple-600 text-white px-8 py-4 text-base font-semibold rounded-xl hover:bg-purple-700 transition-all active:scale-95"
              >
                Start Free Trial
              </Link>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600">
               
                <span>Refer & Earn Free Months</span>
              </div>
            </div>
          </div>

          {/* Visual Mockup - Updated with Product */}
          <div className="lg:col-span-1 flex justify-center lg:justify-end">
            <div className="relative w-[300px]">
              {/* Phone Body */}
              <div className="relative bg-zinc-900 rounded-[2.5rem] p-3 border-[6px] border-zinc-200">
                {/* Screen */}
                <div className="bg-white rounded-[2rem] h-[580px] overflow-hidden flex flex-col relative">
                  {/* Status Bar */}
                  <div className="h-8 w-full bg-white z-10 flex justify-between items-center px-6 pt-2">
                    <div className="text-[10px] font-bold">9:41</div>
                    <div className="w-16 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2"></div>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-zinc-900 rounded-full opacity-20"></div>
                      <div className="w-3 h-3 bg-zinc-900 rounded-full opacity-20"></div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 p-5 pt-4 flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xl">BG</div>
                      <div>
                        <h3 className="font-bold text-zinc-900 leading-tight">Braid Gallery</h3>
                        <p className="text-xs text-zinc-500 font-medium">Lagos, Nigeria</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Service Item */}
                      <div className="p-3 border border-zinc-200 rounded-xl flex justify-between items-center bg-white hover:border-purple-300 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Knotless Braids</p>
                          <p className="text-[10px] text-zinc-500 mt-1">3h • ₦25,000</p>
                        </div>
                        <button className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg">Book</button>
                      </div>

                      {/* Product Item */}
                      <div className="p-3 border border-zinc-200 rounded-xl flex justify-between items-center bg-white hover:border-purple-300 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Silk Bonnet</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Item • ₦5,000</p>
                        </div>
                        <button className="bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-2 rounded-lg">Buy</button>
                      </div>

                      {/* Service Item */}
                      <div className="p-3 border border-zinc-200 rounded-xl flex justify-between items-center bg-white hover:border-purple-300 transition-colors opacity-60">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Wig Install</p>
                          <p className="text-[10px] text-zinc-500 mt-1">1h • ₦10,000</p>
                        </div>
                        <button className="bg-zinc-100 text-zinc-400 text-[10px] font-bold px-3 py-2 rounded-lg" disabled>Full</button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Nav simulation */}
                  <div className="h-16 border-t border-zinc-100 flex justify-around items-center px-4">
                    <div className="w-6 h-6 bg-zinc-900 rounded-full"></div>
                    <div className="w-6 h-6 bg-zinc-100 rounded-full"></div>
                    <div className="w-6 h-6 bg-zinc-100 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge - No Animation */}
              <div className="absolute -right-4 top-20 bg-white border border-zinc-200 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">Payment Received</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantage Section - Pure White */}
        <section className="py-24 border-y border-zinc-200">
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="order-2 md:order-1">
               <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                  <div className="bg-zinc-100 px-6 py-3 border-b border-zinc-200 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                    </div>
                    <div className="flex-1 bg-white h-5 rounded-md text-[10px] text-zinc-400 flex items-center px-2 font-mono">
                      booknaija.com/braids
                    </div>
                  </div>
                  <div className="p-10 text-center">
                     <p className="text-zinc-400 text-sm font-medium mb-2">Your Custom Link</p>
                     <div className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
                       booknaija.com/<span className="text-purple-600">you</span>
                     </div>
                  </div>
               </div>
             </div>
             <div className="order-1 md:order-2">
               <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-6">
                 Sell more than just your time.
               </h2>
               <p className="text-zinc-500 text-lg mb-8 leading-relaxed">
                 Stop losing sales to missed DMs. Your BookNaija link is a 24/7 storefront that handles bookings, product sales, and payments automatically.
               </p>
               <ul className="space-y-4">
                 {['Custom business URL', 'Integrated with Paystack', 'Real-time availability', 'Sell services & products'].map((item) => (
                   <li key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                     <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
             </div>
           </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-6">
                One price. <br />No hidden fees.
              </h2>
              <p className="text-zinc-500 text-lg mb-8 leading-relaxed">
                For the price of a small lunch, you get a complete booking engine and e-commerce store. We don't take a cut of your earnings.
              </p>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                {['No commissions', 'Unlimited bookings', 'Priority WhatsApp support', 'Auto-reminders', 'Product inventory', 'Refer & Earn'].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-800">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-2 lg:order-1">
              <div className="bg-white p-10 rounded-3xl border-2 border-zinc-900 relative">
                <div className="absolute -top-5 left-8 bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                  Launch Offer
                </div>
                <div className="pt-4">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">Monthly Plan</p>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-6xl font-bold text-zinc-900 tracking-tighter">₦2,500</span>
                    <span className="text-zinc-400 font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 mb-10 text-sm text-zinc-600 font-medium">
                    <li className="flex items-center gap-3"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Sell Services & Products</li>
                    <li className="flex items-center gap-3"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Automated Payments</li>
                    <li className="flex items-center gap-3"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Google Calendar Sync</li>
                    <li className="flex items-center gap-3 text-purple-600 font-bold"> Refer 3 friends = 1 Free Month</li>
                  </ul>
                  <Link 
                    to="/signup" 
                    className="block w-full bg-zinc-900 text-white py-4 font-bold rounded-xl hover:bg-zinc-800 transition-all active:scale-95 text-center"
                  >
                    Start Your Storefront
                  </Link>
                  <p className="mt-4 text-center text-xs text-zinc-400">Cancel anytime. No contracts.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 border-t border-zinc-100">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Ready in minutes, not days</h2>
            <p className="text-zinc-500 font-medium">We handle technical setup. You just handle the business.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-zinc-100 -z-10"></div>
            
            {steps.map((s) => (
              <div key={s.n} className="relative p-8 rounded-2xl bg-white border border-zinc-100 hover:border-purple-200 transition-all">
                <div className="w-10 h-10 bg-white border border-zinc-200 text-zinc-900 rounded-full flex items-center justify-center font-bold mb-6 relative z-10">
                    {s.n}
                </div>
                <h4 className="text-lg font-bold mb-3 text-zinc-900">{s.t}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid - Pure White */}
        <section className="py-24 border-y border-zinc-200">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Included in your plan</h2>
            <p className="text-zinc-500 text-lg font-medium">Everything you need to run your business from your phone.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.t} className="p-6 bg-white border border-zinc-200 rounded-2xl hover:-translate-y-1 transition-transform duration-200">
                 <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{f.icon}</svg>
                 </div>
                 <h4 className="text-base font-bold mb-2 text-zinc-900 tracking-tight">{f.t}</h4>
                 <p className="text-zinc-500 text-sm font-medium leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
            {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-zinc-900 rounded text-white flex items-center justify-center font-bold text-[10px]">BN</div>
                <span className="font-bold text-lg tracking-tight">BookNaija</span>
              </div>
              <p className="text-zinc-500 text-sm max-w-xs">
                Built for Nigerian entrepreneurs to scale their services without the technical headache.
              </p>
            </div>
            
            <div className="flex gap-16">
              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</p>
                <ul className="space-y-3 text-sm font-medium text-zinc-600">
                  <li><Link to="/#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link></li>
                  <li><Link to="/#features" className="hover:text-zinc-900 transition-colors">Features</Link></li>
                  <li><Link to="/signup" className="hover:text-zinc-900 transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Company</p>
                <ul className="space-y-3 text-sm font-medium text-zinc-600">
                  {/* Removed About/Contact as those pages don't exist in App.js yet. 
                      AdSense flags 404 pages as errors. */}
                  {/* ADSENSE FIX: Use Link component to point to actual routes */}
                  <li><Link to="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between gap-6 items-center">
            <p className="text-zinc-400 text-xs font-medium">
              © {new Date().getFullYear()} BookNaija Technologies.
            </p>
            <div className="flex gap-6 text-xs font-medium text-zinc-400">
              {/* ADSENSE FIX: Use Link component to point to actual routes */}
              <Link to="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}