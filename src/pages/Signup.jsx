import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 relative overflow-hidden">
        
        {/* Subtle background grid to match Landing */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 text-center max-w-md bg-[#0a0a0a] border border-white/5 p-10 rounded-2xl">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">You're on the list!</h2>
          <p className="text-zinc-400 leading-relaxed">
            We've received your details. We'll reach out within 24 hours to set up your page.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center justify-center mt-8 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 relative">
      
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <form 
        onSubmit={(e) => { e.preventDefault(); setDone(true); }}
        className="relative z-10 w-full max-w-sm bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl shadow-2xl shadow-black/50"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">List your business</h2>
          <p className="text-zinc-500 text-sm mt-2">Join other Nigerian professionals.</p>
        </div>

        <div className="space-y-5">
          
          {/* Business Name Input */}
          <div>
            <input 
              required 
              placeholder="Business name" 
              className="w-full bg-[#121212] border border-white/10 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
            />
          </div>

          {/* Email Input */}
          <div>
            <input 
              required 
              type="email" 
              placeholder="Email address" 
              className="w-full bg-[#121212] border border-white/10 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
            />
          </div>

          {/* Phone Input */}
          <div>
            <input 
              required 
              placeholder="Phone number (e.g. 0801...)" 
              className="w-full bg-[#121212] border border-white/10 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
            />
          </div>

          {/* Custom Select */}
          <div className="relative">
            <select 
              required
              className="w-full appearance-none bg-[#121212] border border-white/10 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 cursor-pointer"
            >
              <option value="" className="text-zinc-500">Business type</option>
              <option className="text-black">Lash Artist</option>
              <option className="text-black">Cleaner</option>
              <option className="text-black">Tutor</option>
              <option className="text-black">Hair Stylist</option>
              <option className="text-black">Makeup Artist</option>
              <option className="text-black">Other</option>
            </select>
            {/* Custom Chevron Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-900/20 active:scale-[0.98] mt-2"
          >
            Get Started
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}