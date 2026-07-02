import { businessCategories, moreCategories } from '../../data/landingData.jsx';

export default function ShowcaseSection({ T, activeCategory, setActiveCategory, active }) {
  return (
    <section id="showcase" className={`py-16 md:py-24 border-t ${T.sectionBorder} relative z-10`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10" data-animate>
          <div>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] font-extrabold ${T.text}`}>
              NOT JUST FOR
              <br />
              <span className={T.textMuted}>BEAUTY BRANDS</span>
            </h2>
          </div>
          <p className={`${T.textSub} text-base sm:text-lg max-w-md leading-relaxed`}>
            Hairstylists, realtors, restaurants, shortlets, auto dealers, tutors: one page adapts to every business.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide" data-animate data-delay-1>
          {businessCategories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 rounded-lg whitespace-nowrap transition-all text-xs sm:text-sm font-semibold ${
                activeCategory === i
                  ? 'bg-lime-400 text-black'
                  : T.catInactive
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                {cat.icon}
              </svg>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Showcase Layout */}
        <div className="mt-8 grid lg:grid-cols-2 gap-6 items-start" data-animate data-delay-2>
          {/* Info Card */}
          <div className={`${T.cardAlt} ${T.border} rounded-xl p-6 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-lime-400" />
            <div className={`${T.textMuted} uppercase tracking-[0.2em] text-[10px] font-semibold`}>Live Business Page</div>
            <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 ${T.text}`}>{active.name}</div>
            <div className={`mt-4 ${T.textSub} leading-relaxed text-sm sm:text-base`}>
              Accept bookings, collect payments, sell products, and run your business from one mobile first page.
            </div>
            <div className="mt-6 space-y-3">
              {active.items.map((item) => (
                <div key={item} className={`flex items-center gap-3 p-3 ${T.card} ${T.borderSub} border rounded-lg`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0`} />
                  <div className={`text-sm font-medium ${T.text}`}>{item}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Mockup */}
          <div className={`${T.cardAlt} ${T.border} rounded-xl overflow-hidden`}>
            <div className={`flex items-center gap-1.5 px-4 py-3 border-b ${T.borderSub} ${T.urlBar}`}>
              <div className="flex gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${T.dot}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${T.dot}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${T.dot}`} />
              </div>
              <div className={`ml-3 ${T.mockScreen} rounded px-3 py-1 text-[10px] ${T.textMuted} border ${T.borderSub} font-mono flex-1 text-center`}>
                {active.example}
              </div>
            </div>

            <div className={`p-4 sm:p-6 ${T.page}`}>
              <div className={`rounded-xl overflow-hidden ${T.card} ${T.border}`}>
                <div className={`h-28 sm:h-36 ${T.accentBgSub} relative`}>
                  <div className={`absolute inset-0 ${T.textMuted} flex items-center justify-center text-xs font-medium`}>
                    Cover Image
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={`text-lg sm:text-xl font-extrabold ${T.text}`}>{active.name}</div>
                      <div className={`${T.textMuted} mt-0.5 text-xs sm:text-sm`}>Lagos, Nigeria</div>
                    </div>
                    <button className="bg-lime-400 text-black px-4 py-2 rounded-lg font-bold text-xs flex-shrink-0">
                      Book Now
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {active.items.map((item) => (
                      <div key={item} className={`${T.card} ${T.borderSub} border rounded-lg p-3`}>
                        <div className={`h-14 rounded ${T.card} ${T.borderSub} border mb-2`} />
                        <div className={`font-semibold text-xs ${T.text}`}>{item}</div>
                        <div className={`text-[10px] ${T.textMuted} mt-0.5`}>Available now</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Categories */}
        <div className="mt-10 text-center" data-animate data-delay-3>
          <p className={`text-[10px] font-semibold ${T.textMuted} uppercase tracking-widest mb-3`}>Also perfect for</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {moreCategories.map((cat) => (
              <span key={cat} className={`px-3 py-1.5 ${T.card} ${T.border} rounded-md text-xs ${T.textSub}`}>
                {cat}
              </span>
            ))}
            <span className={`px-3 py-1.5 ${T.card} ${T.border} rounded-md text-xs ${T.textSub}`}>
              &amp; more
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}