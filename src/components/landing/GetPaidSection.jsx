import { paymentSteps, analyticsData } from '../../data/landingData.jsx';

export default function GetPaidSection({ T, d }) {
  return (
    <section id="features" className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 md:space-y-24">
        {/* Get Paid */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div data-animate>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
              NO MORE
              <br />
              <span className={T.textMuted}>"I'LL PAY</span>
              <br />
              LATER"
            </h2>
            <p className={`mt-6 ${T.textSub} text-base sm:text-lg leading-relaxed max-w-lg`}>
              Clients book and pay before arriving. No chasing transfers. No
              missed appointments. No endless DMs.
            </p>
          </div>

          <div className={`${T.card} ${T.border} rounded-xl p-5 sm:p-6 relative overflow-hidden`} data-animate data-delay-2>
            <div className={`absolute top-0 left-0 w-px h-full ${d ? 'bg-gradient-to-b from-lime-400/40 to-transparent' : 'bg-gradient-to-b from-lime-500/30 to-transparent'} ml-[1.85rem]`} />
            <div className="space-y-3">
              {paymentSteps.map((item, i) => (
                <div key={item} className={`flex items-center gap-4 ${T.page} ${T.borderSub} border rounded-lg p-3.5 sm:p-4`}>
                  <div className={`w-8 h-8 rounded-lg ${T.accentBg} ${T.textAccent} font-bold flex items-center justify-center text-xs border ${T.accentBorder} flex-shrink-0`}>
                    {i + 1}
                  </div>
                  <div className={`font-medium text-sm ${T.text}`}>{item}</div>
                  <div className={`w-2 h-2 rounded-full bg-lime-500 ml-auto flex-shrink-0`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Own Your Audience */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1" data-animate data-delay-1>
            <div className="bg-lime-400 rounded-xl p-6 sm:p-8 text-black relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">Business Analytics</div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                  {analyticsData.map(([v, l]) => (
                    <div key={l} className={`${T.analyticsBg} rounded-lg p-3 sm:p-4 border ${T.analyticsBorder}`}>
                      <div className="text-2xl sm:text-3xl font-extrabold">{v}</div>
                      <div className="mt-1 text-xs font-medium opacity-70">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2" data-animate>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
              YOUR DATA,
              <br />
              YOUR CLIENTS,
              <br />
              <span className={T.textMuted}>YOUR RULES</span>
            </h2>
            <p className={`mt-6 ${T.textSub} text-base sm:text-lg leading-relaxed max-w-lg`}>
              Social platforms can suspend pages overnight. Your page,
              payments, client data, and bookings stay fully under your control.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}