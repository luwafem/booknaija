// src/components/landing/PricingSection.jsx
import { Link } from 'react-router-dom';

export default function PricingSection({ T }) {
  const freeFeatures = [
    'Up to 5 Products & Services',
    'Secure Card & Bank Transfer Payments',
    'Your Own Five9 Link',
    'Basic Page Customization',
    'Google Maps Pin & Directions',
  ];

  const premiumFeatures = [
    'Unlimited Products & Services',
    'Everything in Free',
    'Priority Support',
    'Advanced Page Analytics',
    'Boosted Visibility on Google',
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16" data-animate>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            Start Free, Grow When You're Ready
          </h2>
          <p className="mt-4 text-zinc-400 text-base max-w-lg mx-auto">
            No credit card required to start. Upgrade to Premium for ₦2,500/month when you need more.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE TIER */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl flex flex-col" data-animate data-delay-1>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Free Plan</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-white">₦0</span>
              <span className="text-zinc-500 text-sm">/forever</span>
            </div>
            <ul className="mt-8 space-y-3 text-sm text-zinc-300 flex-1">
              {freeFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="mt-8 block w-full bg-lime-400 text-black py-4 font-bold hover:bg-lime-300 transition-all text-center rounded-lg"
            >
              Start for Free
            </Link>
          </div>

          {/* PREMIUM TIER */}
          <div className="bg-lime-400/5 border-2 border-lime-400/20 p-8 rounded-2xl flex flex-col" data-animate data-delay-2>
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-wider text-lime-400">Premium Plan</p>
              <span className="text-[10px] font-bold text-black bg-lime-400 px-2 py-0.5 rounded-full">MOST POPULAR</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-white">₦2,500</span>
              <span className="text-zinc-500 text-sm">/month</span>
            </div>
            <ul className="mt-8 space-y-3 text-sm text-zinc-300 flex-1">
              {premiumFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="mt-8 block w-full bg-white text-black py-4 font-bold hover:bg-zinc-200 transition-all text-center rounded-lg"
            >
              Choose Premium
            </Link>
          </div>
        </div>

        <div className="max-w-md mx-auto text-center mt-12 text-zinc-500 text-xs space-y-2" data-animate data-delay-3>
            <p>Cancel anytime. No contracts.</p>
            <p>Refer 3 friends = 1 free month of Premium.</p>
        </div>
      </div>
    </section>
  );
}