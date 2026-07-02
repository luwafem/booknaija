import { steps } from '../../data/landingData.jsx';

export default function StepsSection({ T }) {
  return (
    <section className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 max-w-xl mx-auto" data-animate>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${T.text}`}>
            Ready in <span className={T.textAccent}>30 minutes</span>
          </h2>
          <p className={`mt-3 ${T.textSub} text-sm sm:text-base`}>We handle technical setup. You just handle the business.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 relative">
          <div className={`hidden sm:block absolute top-8 left-[16%] right-[16%] h-px ${T.borderSub}`} />
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`relative ${T.card} p-5 sm:p-6 rounded-xl ${T.border} ${T.borderHover} transition-all`}
              data-animate
              data-delay-1={i === 0 ? true : undefined}
              data-delay-2={i === 1 ? true : undefined}
              data-delay-3={i === 2 ? true : undefined}
            >
              <div className={`w-10 h-10 ${T.accentBg} ${T.textAccent} rounded-lg flex items-center justify-center font-extrabold text-base mb-4`}>
                {s.n}
              </div>
              <h4 className={`text-base font-bold mb-1.5 ${T.text}`}>{s.t}</h4>
              <p className={`${T.textSub} text-sm leading-relaxed`}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}