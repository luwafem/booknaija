// src/components/landing/Testimonials.jsx
import { testimonials } from '../../data/landingData.jsx';

export default function Testimonials({ T }) {
  return (
    <section className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center sm:text-left mb-16" data-animate>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            What they say
          </h2>
          <div className="w-16 h-1 bg-lime-400 mt-4 mx-auto sm:mx-0" />
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="text-center sm:text-left"
              data-animate
              data-delay-1={i === 0 ? true : undefined}
              data-delay-2={i === 1 ? true : undefined}
              data-delay-3={i === 2 ? true : undefined}
            >
              <p className="text-white text-sm leading-relaxed">{item.text}</p>
              <div className="mt-4">
                <p className="font-bold text-white">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}