// src/components/bio/property/havenly/HavenlyHero.jsx
import { HAVENLY_BG, HAVENLY_BORDER, buildWhatsAppLink } from './HavenlyLayout';

export default function HavenlyHero({ biz, accent }) {
  const heroImage =
    (biz.heroSlides && biz.heroSlides[0]?.image) ||
    biz.hero ||
    (biz.gallery && biz.gallery[0] && biz.gallery[0].images && biz.gallery[0].images[0]) ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600';

  // Big faded word — first clean word of the tagline, else "Smart"
  const bigWord = (biz.tagline?.split(/[ ,.]/)[0] || 'Smart').replace(/[^a-zA-Z]/g, '') || 'Smart';

  // Hero heading — the tagline is the h1
  const heroHeading = biz.tagline || 'Living Starts Here.';

  // Hero sub — first 1–2 sentences of bio, else generic
  const heroSub = biz.bio
    ? (() => {
        const parts = biz.bio.split('.').map((s) => s.trim()).filter(Boolean);
        return parts.slice(0, 2).join('. ') + (parts.length > 0 ? '.' : '');
      })()
    : `Find verified properties with expert guidance, and move in with ease — all in one seamless experience.`;

  const waLink = buildWhatsAppLink(
    biz.whatsapp,
    `Hi ${biz.name}, I'd like to enquire about your properties.`
  );

  const propertyCount = (biz.properties || []).length;

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: HAVENLY_BG }}>
      {/* Giant faded word behind everything */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <h2 className="text-[34vw] md:text-[24vw] lg:text-[20vw] font-black leading-[0.8] tracking-[-0.06em] text-black/[0.04] pl-3 md:pl-8 lg:pl-12 -mt-6 md:-mt-10 lg:-mt-14">
          {bigWord}
        </h2>
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-6 md:pt-10 lg:pt-14 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: Text */}
          <div className="lg:col-span-5 relative z-10 pt-4 md:pt-8 lg:pt-20">
            <h1 className="text-[2.25rem] sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.02] tracking-[-0.03em] text-[#1a1a1a] mb-5">
              {heroHeading}
            </h1>
            <p className="text-sm sm:text-base text-[#6b6b6b] leading-relaxed max-w-md mb-8">
              {heroSub}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#havenly-properties"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                Explore Properties
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-[#1a1a1a] bg-white transition-all duration-300 hover:border-[#1a1a1a]"
                  style={{ border: `1px solid ${HAVENLY_BORDER}` }}
                >
                  Contact Us
                </a>
              )}
            </div>

            {propertyCount > 0 && (
              <div className="hidden lg:flex items-center gap-2 mt-10">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                <span className="text-xs font-semibold text-[#6b6b6b]">
                  {propertyCount} {propertyCount === 1 ? 'property' : 'properties'} available now
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Image + floating search card */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-[1.75rem] overflow-hidden aspect-[4/3] md:aspect-[16/11] shadow-2xl">
              <img
                src={heroImage}
                alt={biz.name}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>

            {/* Floating Search card */}
            <div className="relative -mt-14 md:absolute md:right-6 md:top-10 md:mt-0 md:w-[340px] mx-5 sm:mx-10 md:mx-0 z-10">
              <div className="bg-white rounded-2xl shadow-2xl p-5" style={{ border: `1px solid #f0eee8` }}>
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">Start Your Search Today</h3>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-[#f4f2ec] rounded-full mb-4">
                  <button
                    type="button"
                    className="flex-1 py-1.5 text-[11px] font-bold text-white rounded-full"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-1.5 text-[11px] font-semibold text-[#6b6b6b] rounded-full hover:text-[#1a1a1a] transition-colors"
                  >
                    Rent
                  </button>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#faf9f6] rounded-lg"
                    style={{ border: `1px solid ${HAVENLY_BORDER}` }}
                  >
                    <svg className="w-3.5 h-3.5 text-[#a3a3a3] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[11px] text-[#6b6b6b] truncate">
                      {biz.location || 'Enter location'}
                    </span>
                  </div>
                </div>

                {/* Type + Bedrooms */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {['Type', 'Bedrooms'].map((label) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-3 py-2.5 bg-[#faf9f6] rounded-lg"
                      style={{ border: `1px solid ${HAVENLY_BORDER}` }}
                    >
                      <span className="text-[11px] text-[#6b6b6b]">{label}</span>
                      <svg className="w-3 h-3 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* Price range slider (visual only) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-2">
                    <span style={{ color: accent }}>₦0</span>
                    <span className="text-[#a3a3a3]">₦100M</span>
                  </div>
                  <div className="relative h-1 bg-[#f0eee8] rounded-full">
                    <div className="absolute left-0 top-0 h-full w-1/2 rounded-full" style={{ backgroundColor: '#1a1a1a' }} />
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-4 h-4 rounded-full bg-white shadow-sm"
                      style={{ border: '2px solid #1a1a1a' }}
                    />
                  </div>
                </div>

                {/* Search button */}
                <a
                  href="#havenly-properties"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  Search
                </a>

                {/* Popular searches */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f0eee8' }}>
                  <p className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-widest mb-2">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Apartment', 'Furnished', 'Pool'].map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-semibold text-[#6b6b6b] bg-[#f4f2ec] px-2 py-1 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}