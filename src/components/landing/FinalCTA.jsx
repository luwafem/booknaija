import { Link } from 'react-router-dom';

export default function FinalCTA({ T }) {
  return (
    <section className={`relative py-16 md:py-24 lg:py-32 border-t ${T.sectionBorder} overflow-hidden z-10`}>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center" data-animate>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.04em] leading-[0.95] ${T.text}`}>
          BUILD A BUSINESS
          <br />
          <span className={T.textMuted}>THAT SELLS</span>
          <br />
          WITHOUT YOU
        </h2>
        <p className={`mt-6 ${T.textSub} text-base sm:text-lg max-w-2xl mx-auto leading-relaxed`}>
          Your page stays online. Your payments keep working. Your business keeps growing even when you're away.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className="bg-lime-400 text-black px-8 py-4 rounded-xl text-sm sm:text-base font-bold hover:bg-lime-300 transition-all inline-flex items-center justify-center gap-2"
          >
            Get Started
            
          </Link>
          <button
            className={`border ${T.border} ${T.card} transition-all px-8 py-4 rounded-xl text-sm sm:text-base font-semibold ${T.textSub} inline-flex items-center justify-center gap-2`}
          >
            See Demo
          </button>
        </div>
        <p className={`mt-4 text-xs sm:text-sm ${T.textMuted}`}>
          No contracts. Cancel anytime. Refer 3 friends = 1 free month.
        </p>
      </div>
    </section>
  );
}