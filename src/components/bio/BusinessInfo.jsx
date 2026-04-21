import { MapPinIcon, ClockIcon } from '../Icons';

export default function BusinessInfo({ location, hours }) {
  if (!location && !hours) return null;

  return (
    <div className="px-6 mt-5">
      <div className="bg-[#111]/60 border border-stone-800/40 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
        {location && (
          <div className="flex items-start gap-3 text-stone-300 text-sm">
            <div className="w-8 h-8 rounded-lg bg-stone-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPinIcon className="w-4 h-4 text-stone-500" />
            </div>
            <span className="leading-relaxed">{location}</span>
          </div>
        )}
        {hours && (
          <div className="flex items-start gap-3 text-stone-300 text-sm">
            <div className="w-8 h-8 rounded-lg bg-stone-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ClockIcon className="w-4 h-4 text-stone-500" />
            </div>
            <span className="leading-relaxed">{hours}</span>
          </div>
        )}
      </div>
    </div>
  );
}