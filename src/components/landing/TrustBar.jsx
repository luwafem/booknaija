// src/components/landing/TrustBar.jsx
import { metrics } from '../../data/landingData.jsx';

export default function TrustBar({ T }) {
  return (
    <div className="border-y border-white/5 py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {metrics.map((item) => (
            <div key={item.label}>
              <div className="font-display text-3xl sm:text-4xl font-bold text-lime-400">{item.value}</div>
              <div className="text-sm text-zinc-400 mt-1 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
        </div>
      </div>
    </div>
  );
}