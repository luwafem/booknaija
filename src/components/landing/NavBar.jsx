import { Link } from 'react-router-dom';

export default function NavBar({ d, toggleTheme }) {
  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-zinc-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src="/fav-removebg.png" alt="Five9" className="h-8 w-auto transition-transform group-hover:scale-105" />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
          <a href="#showcase" className="hover:text-zinc-900 transition-colors">Showcase</a>
          <a href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/dashboard"
            className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors whitespace-nowrap"
          >
            Dashboard
          </Link>
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              d ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
            }`}
            aria-label="Toggle theme"
          >
            {d ? (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <Link
            to="/signup"
            className="bg-lime-400 text-black px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-lime-300 transition-all whitespace-nowrap"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}