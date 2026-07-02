import { Link } from 'react-router-dom';
import { pricingFeatures } from '../../data/landingData.jsx';

export default function PricingSection({ T }) {
  return (
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
              {['Unlimited Bookings', 'Card Payments', 'Bank Transfers', 'WhatsApp Reminders', 'Product Sales', 'Custom Page'].map((item) => (
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
                  {pricingFeatures.map((item) => (
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
                  Start Your Page
                </Link>
                <p className={`mt-2.5 text-xs ${T.textMuted} text-center`}>Cancel anytime. No contracts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}