import { Link } from 'react-router-dom';

export default function AnnouncementBar() {
  return (
    <div className="bg-lime-400 text-black text-center py-2 px-4 text-xs sm:text-sm font-bold">
      <div className="flex items-center justify-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black" />
        </span>
        <span className="hidden sm:inline">Meta took down your page?</span>
        <span className="sm:hidden">Meta took your page?</span>
        &nbsp;Your BookNaija link never goes down.
        <Link to="/signup" className="underline underline-offset-2 font-extrabold hover:text-lime-900 transition-colors ml-1">
          Get protected →
        </Link>
      </div>
    </div>
  );
}