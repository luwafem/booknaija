import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Signup() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // NEW: Check for referral code in URL (e.g., yoursite.com/signup?ref=glamour-lash)
  const [params] = useSearchParams();
  const referralParam = params.get('ref');

  // Function to handle form submission via Formspree
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const data = new FormData(form);

    // REPLACE 'YOUR_FORMSPREE_FORM_ID' WITH YOUR ACTUAL FORM ID
    try {
      const response = await fetch("https://formspree.io/f/YOUR_FORMSPREE_FORM_ID", {
        method: "POST",
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setDone(true);
      } else {
        // Optional: Handle errors here (e.g., show an alert)
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("An error occurred", error);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 relative">
        
        {/* Success Card */}
        <div className="relative z-10 text-center max-w-sm bg-white border border-zinc-200 p-10 rounded-2xl">
          
          {/* Success Icon */}
          <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 mb-2">You're on the list!</h2>
          <p className="text-zinc-500 leading-relaxed">
            We've received your details. We'll reach out within 24 hours to set up your page.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center justify-center mt-8 text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 relative">
      
      {/* Form Container */}
      <form 
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm bg-white border border-zinc-200 p-8 rounded-2xl"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">List your business</h2>
          <p className="text-zinc-500 text-sm mt-2">Join other Nigerian professionals.</p>
        </div>

        <div className="space-y-5">
          
          {/* Business Name Input */}
          <div>
            <input 
              required 
              name="business_name"
              placeholder="Business name" 
              className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all duration-200"
            />
          </div>

          {/* Email Input */}
          <div>
            <input 
              required 
              type="email" 
              name="email"
              placeholder="Email address" 
              className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all duration-200"
            />
          </div>

          {/* Phone Input */}
          <div>
            <input 
              required 
              name="phone"
              placeholder="Phone number (e.g. 0801...)" 
              className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all duration-200"
            />
          </div>

          {/* Custom Select */}
          <div className="relative">
            <select 
              required
              name="business_type"
              className="w-full appearance-none bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-purple-600 transition-all duration-200 cursor-pointer"
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
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* NEW: Referral Code Input */}
          <div>
             <input 
               // Not required, but optional
               name="referral_code"
               placeholder="Referral Code (Optional)" 
               // NEW: Auto-fill if passed in URL
               defaultValue={referralParam}
               className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all duration-200 uppercase"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Get Started"}
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}