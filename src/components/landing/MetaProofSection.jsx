import { Link } from 'react-router-dom';

export default function MetaProofSection({ T }) {
  return (
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
              <span className={`font-semibold ${T.text}`}>Not with Five9.</span>
            </p>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-lime-400 text-black px-6 py-3 text-sm font-bold rounded-xl hover:bg-lime-300 transition-all mt-6"
            >
              Protect Your Business
              
            </Link>
          </div>

          <div className="space-y-4" data-animate data-delay-2>
            {/* Without Five9 */}
            <div className={`${T.card} ${T.border} rounded-xl p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 ${T.badgeIcon} rounded-lg flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${T.redIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className={`font-bold text-sm ${T.text}`}>Without Five9</p>
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

            {/* With Five9 */}
            <div className={`${T.cardAlt} ${T.border} rounded-xl p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 ${T.accentBg} rounded-lg flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${T.textAccent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-bold text-sm ${T.text}`}>With Five9</p>
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
  );
}