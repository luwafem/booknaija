import { features } from '../../data/landingData.jsx';

export default function FeaturesGrid({ T }) {
  return (
    <section className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10" data-animate>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
            EVERYTHING <span className={T.textMuted}>INCLUDED</span>
          </h2>
          <p className={`mt-4 ${T.textSub} text-base sm:text-lg max-w-xl mx-auto`}>
            Everything you need to run your business from your phone.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <div
              key={f.t}
              className={`${T.card} ${T.border} rounded-lg p-5 transition-all duration-200 hover:scale-[1.01]`}
              data-animate
              data-delay-1={i % 3 === 1 ? true : undefined}
              data-delay-2={i % 3 === 2 ? true : undefined}
              data-delay-3={i % 3 === 0 ? true : undefined}
            >
              <div className={`w-9 h-9 ${T.badgeIcon} ${T.textSub} rounded-lg flex items-center justify-center mb-3`}>
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  {f.icon}
                </svg>
              </div>
              <h4 className={`text-sm font-bold mb-1 ${T.text}`}>{f.t}</h4>
              <p className={`${T.textSub} text-sm leading-relaxed`}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}