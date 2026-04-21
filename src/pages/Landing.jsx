import { Link } from 'react-router-dom';

const steps = [
  { 
    n: '1', 
    t: 'Create Your Storefront', 
    d: 'Add your business name and services. Your professional link will be live within 24 hours.' 
  },
  { 
    n: '2', 
    t: 'Set Your Availability', 
    d: 'Define your working hours so clients know exactly when you are free.' 
  },
  { 
    n: '3', 
    t: 'Add to Your Bio', 
    d: 'Paste your unique booknaija.com/yourname link into your Instagram or TikTok bio.' 
  },
];

const features = [
  { t: 'Upfront Payments', d: 'Stop chasing money. Clients pay at the point of booking so you are guaranteed your fee.' },
  { t: 'Google Calendar Sync', d: 'Avoid double-bookings. We automatically block slots when you have personal plans.' },
  { t: 'Automated Reminders', d: 'We send WhatsApp and Email reminders to your clients so they never miss an appointment.' },
  { t: 'Bio-Link Ready', d: 'A beautiful, mobile-first page designed to look perfect inside Instagram and TikTok.' },
  { t: 'Client Management', d: 'A simple dashboard to see every client’s history, preferences, and contact details.' },
  { t: 'Instant WhatsApp Alerts', d: 'Get notified the second a booking is made. No more refreshing your email.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-purple-100">
      
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100 px-6">
        <div className="max-w-7xl mx-auto py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">BookNaija</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/signup" 
              className="bg-purple-600 text-white px-5 py-2.5 text-sm font-bold rounded-full hover:bg-purple-700 transition-all active:scale-95"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* Hero Section */}
        <section className="pt-16 pb-24 md:pt-24 md:pb-32 grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-zinc-950 mb-6">
              Your business <br /> in <span className="text-purple-600">one link.</span>
            </h1>
            
            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10 font-medium">
              Transform your Instagram bio into a professional storefront. Let clients book and pay you upfront—without a single WhatsApp message.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center lg:justify-start">
              <Link 
                to="/signup"
                className="w-full sm:w-auto bg-purple-600 text-white px-10 py-4 text-base font-bold rounded-full hover:bg-purple-700 transition-all text-center active:scale-95"
              >
                Claim Your Link
              </Link>
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google" className="w-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-900 font-bold tracking-tight">Google Calendar</p>
                  <p className="text-xs text-zinc-400 font-medium italic leading-none">Instant Sync</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Mockup */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative mx-auto w-[300px]">
              <div className="bg-zinc-900 rounded-[3rem] p-3 border-[8px] border-zinc-800">
                <div className="bg-white rounded-[2.2rem] h-[550px] overflow-hidden flex flex-col">
                  <div className="pt-10 pb-6 px-6 text-center border-b border-zinc-50">
                    <div className="w-20 h-20 bg-zinc-100 rounded-full mx-auto mb-4 border-4 border-white" />
                    <h3 className="font-bold text-lg">Braid Gallery Lagos</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Certified Hair Stylist</p>
                  </div>
                  
                  <div className="p-4 space-y-3 overflow-y-auto">
                    <div className="p-3 border border-zinc-100 rounded-xl flex justify-between items-center bg-zinc-50/50">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Knotless Braids</p>
                        <p className="text-[10px] text-zinc-500">3 hours • ₦25,000</p>
                      </div>
                      <button className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Book</button>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-3" alt="" />
                        <span className="text-[9px] font-bold text-emerald-700">Calendar Synced</span>
                    </div>

                    <div className="p-3 border border-zinc-100 rounded-xl flex justify-between items-center bg-zinc-50/50">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Wig Installation</p>
                        <p className="text-[10px] text-zinc-500">1 hour • ₦10,000</p>
                      </div>
                      <button className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Book</button>
                    </div>
                  </div>

                  <div className="mt-auto p-4 bg-zinc-50 text-center">
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Powered by BookNaija</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 bg-white border border-zinc-100 p-4 rounded-2xl max-w-[160px] shadow-sm">
                <p className="text-[10px] font-bold text-purple-600 mb-1 italic">Instagram Bio:</p>
                <p className="text-xs font-bold text-zinc-800 italic">booknaija.com/braids</p>
              </div>
            </div>
          </div>
        </section>

        {/* Advantage Section */}
        <section className="py-32 border-t border-zinc-100">
           <div className="grid md:grid-cols-2 gap-20 items-center">
             <div>
               <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-950 mb-6">
                 Turn followers into <span className="text-purple-600 italic">customers.</span>
               </h2>
               <p className="text-zinc-600 text-lg font-medium mb-8">
                 Instead of "DM for price," give your clients a professional experience. Your BookNaija link is a complete storefront that works while you sleep.
               </p>
               <ul className="space-y-4">
                 {['Custom business URL', 'Mobile-first storefront', 'Integrated with Paystack', 'Real-time calendar'].map((item) => (
                   <li key={item} className="flex items-center gap-3 font-bold text-sm text-zinc-800">
                     <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                       <div className="w-2 h-2 bg-purple-600 rounded-full" />
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
             </div>
             <div className="relative">
               <div className="bg-white rounded-3xl border-2 border-zinc-100 p-10 text-center">
                  <p className="text-xs font-black text-zinc-400 mb-6 uppercase tracking-widest">Your New Bio Link</p>
                  <div className="bg-zinc-50 border-2 border-dashed border-purple-200 p-8 rounded-2xl">
                     <span className="text-xl md:text-3xl font-black text-purple-600">booknaija.com/</span>
                     <span className="text-xl md:text-3xl font-black text-zinc-300">business</span>
                  </div>
               </div>
             </div>
           </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 border-t border-zinc-100">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="bg-white p-12 rounded-[2.5rem] border-2 border-purple-100 text-center shadow-xl shadow-purple-50/50">
                <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">Flat Monthly Fee</p>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-6xl font-black text-zinc-950">₦2,000</span>
                  <span className="text-zinc-400 font-bold">/mo</span>
                </div>
                <Link 
                  to="/signup" 
                  className="block w-full bg-purple-600 text-white py-5 font-bold rounded-2xl hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-200"
                >
                  Start Your Storefront
                </Link>
                <p className="mt-6 text-[11px] text-zinc-400 font-bold uppercase tracking-tighter">Cancel anytime • 100% earnings are yours</p>
              </div>
              <div className="absolute -top-4 -left-4 bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-black -rotate-12">
                0% FEES
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-950 mb-6">
                One simple plan for <span className="text-purple-600 italic">everyone.</span>
              </h2>
              <p className="text-zinc-600 text-lg font-medium mb-8">
                No tiers, no hidden commissions. For the price of a lunch meal, you get every single feature we offer. 
              </p>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {['No commissions', 'Unlimited bookings', 'Priority support', 'WhatsApp alerts'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-bold text-zinc-800">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 border-t border-zinc-100">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-950 mb-4">How to Get Started</h2>
            <p className="text-zinc-500 font-medium italic">We handle the technical setup for you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="p-8 rounded-3xl bg-white border border-zinc-100 hover:border-purple-200 transition-all group">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-xl font-black text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    {s.n}
                </div>
                <h4 className="text-xl font-bold mb-3">{s.t}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features List - REDESIGNED GRID */}
        <section className="py-32 border-t border-zinc-100 mb-12">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-950 mb-4 tracking-tight">Everything You Get</h2>
            <p className="text-zinc-500 text-lg font-medium">One subscription. Complete control over your business.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.t} className="p-8 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                 <div className="w-10 h-10 bg-white shadow-sm border border-zinc-100 rounded-xl flex items-center justify-center mb-6">
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                 </div>
                 <h4 className="text-lg font-bold mb-3 text-zinc-900 tracking-tight">{f.t}</h4>
                 <p className="text-zinc-500 text-sm font-medium leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer - CLEAN & MINIMAL */}
      <footer className="border-t border-zinc-100 pt-24 pb-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-bold text-xl tracking-tight">BookNaija</span>
              </div>
              <p className="text-zinc-500 text-sm font-medium max-w-xs">
                Empowering Nigerian service businesses with world-class booking tools.
              </p>
            </div>
            
            <div className="flex gap-12">
              <div className="space-y-4">
                <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">Platform</p>
                <ul className="space-y-3 text-sm font-bold text-zinc-500">
                  <li><a href="#" className="hover:text-purple-600 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-purple-600 transition-colors">Features</a></li>
                  <li><Link to="/signup" className="hover:text-purple-600 transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">Connect</p>
                <ul className="space-y-3 text-sm font-bold text-zinc-500">
                  <li><a href="#" className="hover:text-purple-600 transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-purple-600 transition-colors">WhatsApp</a></li>
                  <li><a href="#" className="hover:text-purple-600 transition-colors">Email Support</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between gap-6">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-tight">
              © {new Date().getFullYear()} BookNaija Technologies
            </p>
            <div className="flex gap-6 text-xs font-bold text-zinc-400 uppercase tracking-tight">
              <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}