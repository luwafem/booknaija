// src/components/landing/PricingSection.jsx
import { Link } from 'react-router-dom';

export default function PricingSection({ T }) {
  const pricingFeatures = [
    'Sell Services & Products',
    'Card & Bank Transfer Payments',
    'Google Calendar Sync',
    'Listings for any business type',
    'Meta-proof page',
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16" data-animate>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            Simple pricing
          </h2>
          <div className="w-16 h-1 bg-lime-400 mt-4 mx-auto" />
        </div>
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto border-2 border-white/10 p-8 sm:p-10 md:p-12 rounded-2xl" data-animate data-delay-1>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Monthly plan</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-white">₦2,500</span>
            <span className="text-zinc-500 text-sm">/month</span>
          </div>
          <ul className="mt-6 space-y-2.5 text-sm sm:text-base">
            {pricingFeatures.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-zinc-300">
                <svg className="w-4 h-4 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-white font-semibold pt-1">
              <svg className="w-4 h-4 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Refer 3 friends = 1 free month
            </li>
          </ul>
          <Link
            to="/signup"
            className="mt-8 block w-full bg-lime-400 text-black py-4 font-bold hover:bg-lime-300 transition-all text-center rounded-lg"
          >
            Start your page
          </Link>
          <p className="mt-3 text-xs text-zinc-500 text-center">Cancel anytime. No contracts.</p>
        </div>
      </div>
    </section>
  );
}