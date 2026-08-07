// src/components/landing/FinalCTA.jsx
import { Link } from 'react-router-dom';

export default function FinalCTA({ T }) {
  return (
    <section className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
          Ready to take payments <br />the smart way?
        </h2>
        <p className="mt-4 text-zinc-400 text-base max-w-lg mx-auto">
          Join hundreds of businesses already using Five9.
        </p>
        <div className="mt-8">
          <Link
            to="/signup"
            className="bg-lime-400 text-black px-10 py-4 font-bold hover:bg-lime-300 transition-all inline-flex items-center justify-center gap-2 rounded-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}