// src/components/landing/Categories.jsx
import { businessCategories } from '../../data/landingData.jsx';

export default function Categories({ T }) {
  return (
    <section className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center sm:text-left mb-12" data-animate>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            Built for any business
          </h2>
          <div className="w-16 h-1 bg-lime-400 mt-4 mx-auto sm:mx-0" />
        </div>
        <div className="flex flex-wrap justify-center sm:justify-start gap-3" data-animate data-delay-1>
          {businessCategories.map((cat) => (
            <span
              key={cat}
              className="px-4 py-2 rounded-full border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}