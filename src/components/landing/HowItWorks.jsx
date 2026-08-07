// src/components/landing/HowItWorks.jsx
import { steps } from '../../data/landingData.jsx';

export default function HowItWorks({ T }) {
  return (
    <section className="py-16 md:py-24 border-t border-b" style={{ borderColor: T.borderSub }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12" data-animate>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${T.text}`}>
            How it works
          </h2>
          <p className={`mt-3 ${T.textSub} text-sm sm:text-base max-w-xl mx-auto`}>
            Get your page live in minutes, not days.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`${T.card} p-6 rounded-xl border ${T.border} transition-all hover:shadow-lg`}
              data-animate
              data-delay-1={i === 0 ? true : undefined}
              data-delay-2={i === 1 ? true : undefined}
              data-delay-3={i === 2 ? true : undefined}
            >
              <div className={`w-10 h-10 rounded-full ${T.accentBg} ${T.textAccent} flex items-center justify-center font-extrabold text-base mb-4`}>
                {s.n}
              </div>
              <h4 className={`text-base font-bold mb-2 ${T.text}`}>{s.t}</h4>
              <p className={`${T.textSub} text-sm leading-relaxed`}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}