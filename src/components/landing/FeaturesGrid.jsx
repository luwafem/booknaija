// src/components/landing/FeaturesGrid.jsx
import { features } from '../../data/landingData.jsx';

export default function FeaturesGrid({ T }) {
  return (
    <section className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center sm:text-left mb-16" data-animate>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            Why Five9
          </h2>
          <div className="w-16 h-1 bg-lime-400 mt-4 mx-auto sm:mx-0" />
        </div>

        {/* All features in a 2‑col grid with border-left style */}
        <div className="grid sm:grid-cols-2 gap-6" data-animate data-delay-1>
          {features.map((f, index) => (
            <div
              key={f.t}
              className="border-l-2 border-lime-400/30 pl-6 py-2"
              data-animate
              data-delay-1={index % 2 === 0 ? true : undefined}
              data-delay-2={index % 2 === 1 ? true : undefined}
            >
              <h4 className="text-lg font-bold text-white">{f.t}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed mt-1">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}