import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { metrics, mockItems } from '../../data/landingData.jsx';

export default function HeroSection({
  T,
  d,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  hasSearched,
}) {
  return (
    <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-28 lg:pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT */}
          <div className="relative z-10" data-animate>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
              LIST PROPERTIES,
              <br />
              BOOK VIEWINGS,
              <br />
              <span className={T.textAccent}>GROW YOUR PORTFOLIO</span>
            </h1>

            <p className={`mt-6 sm:mt-8 text-base sm:text-lg ${T.textSub} leading-relaxed max-w-lg`}>
              Every real estate agent and developer gets a professional website  showcase properties, manage estates, and turn visitors into qualified leads. No tech skills needed.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="bg-lime-400 text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold hover:bg-lime-300 transition-all text-center flex items-center justify-center gap-2"
              >
                List Your Properties
              </Link>
            </div>

            <div className={`mt-4 flex items-center gap-2 text-sm ${T.textMuted}`}>
              Refer 3 friends = <span className={`font-semibold ${T.textAccent}`}>1 Free Month</span>
            </div>

            {/* Search Bar */}
            <SearchBar
              T={T}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              searchResults={searchResults}
              hasSearched={hasSearched}
            />

            {/* Metrics */}
            <div className={`mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t ${T.borderSub} pt-8`}>
              {metrics.map((item) => (
                <div key={item.label}>
                  <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${T.text}`}>
                    {item.value}
                  </div>
                  <div className={`text-xs sm:text-sm ${T.textMuted} mt-1 font-medium`}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT – Desktop Phone Mockup */}
          <div className="hidden lg:flex items-center justify-center relative" data-animate data-delay-2>
            <div
              className="relative"
              style={{ transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
            >
              <div className={`relative ${T.mockFrame} rounded-[2.5rem] p-2.5 border`}>
                <div className={`${T.mockScreen} rounded-[2rem] h-[540px] w-[280px] overflow-hidden flex flex-col`}>
                  <div className={`h-7 ${T.mockScreen} flex justify-between items-center px-5 pt-1.5`}>
                    <div className={`text-[10px] font-medium ${T.textMuted}`}>9:41</div>
                    <div className={`w-16 h-4 ${T.mockBar} rounded-full absolute left-1/2 -translate-x-1/2 top-1.5`} />
                    <div className="flex gap-0.5">
                      <div className={`w-2.5 h-2.5 ${T.dot} rounded-full`} />
                      <div className={`w-2.5 h-2.5 ${T.dot} rounded-full`} />
                    </div>
                  </div>

                  <div className={`flex-1 p-4 pt-2 flex flex-col ${T.mockScreen}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className={`text-[10px] ${T.textMuted} uppercase tracking-wider font-semibold`}>Properties</div>
                        <div className={`font-bold text-base mt-0.5 ${T.text}`}>Luxury Estates</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-extrabold text-sm">
                        LE
                      </div>
                    </div>

                    <div className="rounded-xl bg-lime-400 text-black p-4">
                      <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">This Month</div>
                      <div className="text-3xl font-extrabold mt-1">24</div>
                      <div className="text-xs font-semibold opacity-80 mt-1">Viewings scheduled</div>
                    </div>

                    <div className="mt-4 flex-1 space-y-2 overflow-hidden">
                      {mockItems.map((item) => (
                        <div
                          key={item.title}
                          className={`p-2.5 rounded-lg flex items-center justify-between ${item.disabled ? T.mockCardDim + ' opacity-50' : T.mockCard}`}
                        >
                          <div>
                            <div className={`font-medium text-xs ${item.disabled ? T.textMuted : T.text}`}>{item.title}</div>
                            <div className={`text-[10px] ${T.textMuted} mt-0.5`}>{item.price}</div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2.5 py-1 rounded ${item.disabled ? T.mockDisabled : 'bg-lime-400 text-black'}`}
                          >
                            {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-2 ${T.mockCard} rounded-xl p-3`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-[10px] ${T.textMuted}`}>Today</div>
                          <div className={`text-xl font-extrabold ${T.text}`}>3 Viewings</div>
                        </div>
                        <div className={`w-9 h-9 rounded-full ${T.accentDot} border ${T.accentDotBorder} flex items-center justify-center`}>
                          <div className="w-3 h-3 rounded-full bg-lime-400 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Lead Badge */}
              <div className={`absolute -right-6 top-20 ${T.badge} p-2.5 rounded-lg shadow-lg bn-float z-10`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 ${T.accentBg2} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3.5 h-3.5 ${T.textAccent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-[9px] ${T.textMuted}`}>New Lead</p>
                    <p className={`text-[11px] font-bold ${T.textAccent}`}>2 today</p>
                  </div>
                </div>
              </div>

              {/* Floating Meta Shield Badge */}
              <div className={`absolute -left-4 bottom-28 ${T.badge} p-2.5 rounded-lg shadow-lg bn-float2 z-10`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 ${T.badgeIcon} rounded-full flex items-center justify-center`}>
                    <svg className={`w-3.5 h-3.5 ${T.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-[9px] ${T.textMuted}`}>Meta-proof</p>
                    <p className={`text-[9px] font-bold ${T.text}`}>Always live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Dashboard Preview ── */}
        <div className="lg:hidden mt-10" data-animate data-delay-2>
          <div className={`${T.badge} ${T.border} rounded-2xl p-4 overflow-hidden`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`text-[10px] ${T.textMuted} uppercase tracking-wider font-semibold`}>Properties</div>
                <div className={`font-bold text-lg ${T.text}`}>Luxury Estates</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-extrabold text-sm">
                LE
              </div>
            </div>
            <div className="rounded-xl bg-lime-400 text-black p-4">
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">This Month</div>
              <div className="text-3xl font-extrabold mt-1">24</div>
              <div className="text-xs font-semibold opacity-80 mt-1">Viewings scheduled</div>
            </div>
            <div className="mt-3 space-y-2">
              {mockItems.slice(0, 2).map((item) => (
                <div key={item.title} className={`${T.mockCard} rounded-lg p-3 flex items-center justify-between`}>
                  <div>
                    <div className={`text-sm font-medium ${T.text}`}>{item.title}</div>
                    <div className={`text-xs ${T.textMuted} mt-0.5`}>{item.price}</div>
                  </div>
                  <span className="bg-lime-400 text-black text-[10px] font-bold px-2.5 py-1 rounded-md">{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}