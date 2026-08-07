import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function HeroSection({
  T,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  hasSearched,
  heroTitle = 'Your business, always online',
  heroDescription = 'Stop losing customers to broken DMs. Get a professional page that handles bookings, payments, and Google visibility — all in one link.',
  heroImage = '',
  heroLoading = false, // 👈 NEW
}) {
  return (
    <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-3 text-center sm:text-left" data-animate>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-white">
              {heroTitle}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-lg leading-relaxed mx-auto sm:mx-0">
              {heroDescription}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <Link
                to="/signup"
                className="bg-lime-400 text-black px-8 py-4 rounded-lg text-sm font-bold hover:bg-lime-300 transition-all inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Get Started
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              ₦2,500/month. Cancel anytime. Refer 3 friends = 1 free month.
            </p>

            <div className="mt-10 max-w-sm mx-auto sm:mx-0">
              <SearchBar
                T={T}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearching={isSearching}
                searchResults={searchResults}
                hasSearched={hasSearched}
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-center lg:justify-end" data-animate data-delay-2>
            {/* ─── Loading state ─── */}
            {heroLoading ? (
              <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] rounded-2xl bg-zinc-800/50 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
              </div>
            ) : heroImage ? (
              <div className="relative w-full max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                <img
                  src={heroImage}
                  alt="Hero visual"
                  className="w-full h-auto object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            ) : (
              /* ─── Phone mockup (only when no hero image and not loading) ─── */
              <div className="relative" style={{ transform: 'perspective(1200px) rotateY(-4deg) rotateX(2deg)' }}>
                <div className="relative bg-zinc-800 rounded-[2.5rem] p-2.5 border border-white/10">
                  <div className="bg-black rounded-[2rem] h-[540px] w-[280px] overflow-hidden flex flex-col">
                    <div className="h-7 flex justify-between items-center px-5 pt-1.5">
                      <div className="text-[10px] font-medium text-zinc-400">9:41</div>
                      <div className="w-16 h-4 bg-zinc-800 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5" />
                      <div className="flex gap-0.5">
                        <div className="w-2.5 h-2.5 bg-zinc-600 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-zinc-600 rounded-full" />
                      </div>
                    </div>

                    <div className="flex-1 p-4 pt-2 flex flex-col bg-black">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Business</div>
                          <div className="font-bold text-base text-white">Luxury Estates</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-extrabold text-sm">LE</div>
                      </div>

                      <div className="rounded-xl bg-lime-400 text-black p-4">
                        <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">This Month</div>
                        <div className="text-3xl font-extrabold mt-1">24</div>
                        <div className="text-xs font-semibold opacity-80 mt-1">Bookings scheduled</div>
                      </div>

                      <div className="mt-4 flex-1 space-y-2 overflow-hidden">
                        {[
                          { title: 'Knotless Braids', price: '₦25,000', tag: 'Book' },
                          { title: 'Silk Bonnet', price: '₦5,000', tag: 'Buy' },
                          { title: 'Wig Install', price: '₦10,000', tag: 'Full', disabled: true },
                        ].map((item) => (
                          <div
                            key={item.title}
                            className={`p-2.5 rounded-lg flex items-center justify-between ${item.disabled ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: item.disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)' }}
                          >
                            <div>
                              <div className={`font-medium text-xs ${item.disabled ? 'text-zinc-500' : 'text-white'}`}>{item.title}</div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">{item.price}</div>
                            </div>
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded ${item.disabled ? 'bg-zinc-800 text-zinc-500' : 'bg-lime-400 text-black'}`}>
                              {item.tag}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 bg-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-zinc-500">Today</div>
                            <div className="text-xl font-extrabold text-white">3 Viewings</div>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-lime-400 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </section>
  );
}