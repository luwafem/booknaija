import { Link } from 'react-router-dom';

const steps = [
  { n: '01', t: 'Set up in 2 minutes', d: 'Add your services, prices, and connect your Paystack key.' },
  { n: '02', t: 'Share your link', d: 'Send clients your unique, mobile-friendly booking page URL.' },
  { n: '03', t: 'Get booked & paid', d: 'Clients pick a time, pay instantly. Money hits your account.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      
      {/* Background depth effects */}
      <div className="absolute top-[-10rem] right-[-10rem] w-[40rem] h-[40rem] bg-purple-600/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10rem] left-[-10rem] w-[30rem] h-[30rem] bg-violet-600/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-5 flex justify-between items-center max-w-4xl mx-auto border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-purple-600/30">
            B
          </div>
          <span className="font-bold text-lg tracking-tight">BookNaija</span>
        </div>
        
        <Link 
          to="/signup" 
          className="text-sm text-purple-300 border border-purple-500/30 rounded-lg px-4 py-2 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-200 font-medium"
        >
          List your business
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 max-w-4xl mx-auto pt-24 pb-32">
        
        {/* Hero Section */}
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-stone-400 font-medium">Free for Nigerian businesses</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
            Book clients online.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500">
              Get paid directly.
            </span>
          </h1>
          
          <p className="mt-6 text-stone-400 text-lg leading-relaxed max-w-lg">
            Beautiful booking pages for lash artists, nail techs, and stylists. 
            No monthly fees. Payments go straight to your Paystack.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link 
              to="/signup"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xl shadow-purple-600/20 hover:shadow-purple-500/30 active:scale-[0.98] group"
            >
              Create your page
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <span className="text-xs text-stone-600 font-medium">No credit card required</span>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mt-24 max-w-xl">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-[0.2em] mb-6 px-1">
            How it works
          </h3>
          
          <div className="space-y-3">
            {steps.map((s, index) => (
              <div 
                key={s.n} 
                className="flex gap-5 p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center text-xs font-bold tracking-widest shrink-0 group-hover:bg-purple-600/20 transition-colors duration-300">
                  {s.n}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-semibold text-stone-100 tracking-tight">{s.t}</p>
                  <p className="text-stone-500 text-sm mt-1 leading-relaxed">{s.d}</p>
                </div>
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute left-[2.75rem] top-[4.5rem] w-px h-6 bg-white/[0.05]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof / Micro-copy */}
        <div className="mt-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-xl border-t border-white/[0.05] pt-8">
          <p className="text-sm text-stone-500">
            Trusted by lash artists, nail techs, tutors, and cleaners across Lagos.
          </p>
          <div className="flex -space-x-2">
            {/* Fake avatar stack for visual flair */}
            {['bg-purple-700', 'bg-violet-600', 'bg-fuchsia-600', 'bg-pink-600'].map((color, i) => (
              <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-white/80`}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-stone-800 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-stone-400">
              +
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}