import { EGREEN, buildWhatsAppLink } from './EstateoLayout';

// Placeholder avatars for the "happy customers" bubble.
// These are decorative design elements, not business data.
const DEFAULT_AVATARS = ['AO', 'CN', 'EK', 'TB'];

export default function EstateoHero({ biz, accent }) {
  const heroImage =
    (biz.heroSlides && biz.heroSlides[0]?.image) ||
    biz.hero ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600';

  // 👇 Pull hero badge data from the dashboard "Stats" editor (biz.stats).
  //    Falls back to sensible defaults if the owner hasn't added any stats yet.
  const happyCount = biz.stats?.[0]?.value || '12K+';
  const happyLabel = biz.stats?.[0]?.label || 'Happy Customers';

  // 👇 Hero headline now driven by the dashboard "Tagline" field.
  //    Splits on the first comma so we can two‑tone it (line 1 plain, line 2 green)
  //    while still working if the tagline has no comma.
  const rawTagline = biz.tagline || 'Find Your Best Dream Property';
  const [headlineLead, ...headlineRestParts] = rawTagline.split(',');
  const headlineHighlight = headlineRestParts.join(',').trim() || headlineLead;

  const waLink = buildWhatsAppLink(
    biz.whatsapp,
    `Hi ${biz.name}, I'd like to enquire about your properties.`
  );

  return (
    <section className="relative bg-gradient-to-b from-[#f8f7f4] to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-10 lg:pt-16 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ─── LEFT: Text ─── */}
          <div className="lg:col-span-6 relative z-10">
            <p
              className="text-[11px] font-bold tracking-[0.22em] uppercase mb-5 flex items-center gap-2"
              style={{ color: accent }}
            >
              <span className="w-8 h-px" style={{ backgroundColor: accent }} />
              Discover Your Perfect Home
            </p>

            {/* 👇 Headline driven by biz.tagline */}
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-gray-900 mb-6">
              {headlineLead}
              {headlineRestParts.length > 0 && (
                <>
                  <br />
                  <span style={{ color: EGREEN }}>{headlineHighlight}</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
              {biz.bio ||
                `We help you find the perfect property that matches your lifestyle and budget with ease.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <a
                href="#properties"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: EGREEN }}
              >
                Explore Properties
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-gray-900 rounded-full border border-gray-300 hover:border-gray-900 transition-all duration-300 group"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: EGREEN }}
                  >
                    <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  Watch Video
                </a>
              )}
            </div>

            {/* Contact strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              {biz.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" style={{ color: EGREEN }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="font-medium">{biz.location}</span>
                </div>
              )}
              {biz.hours && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" style={{ color: EGREEN }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{biz.hours}</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Hero image + floating cards ─── */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt={biz.name}
                className="w-full aspect-[4/3] lg:aspect-[5/5.5] object-cover"
                loading="eager"
                fetchPriority="high"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
            </div>

            {/* Floating "Happy Customers" card — driven by biz.stats[0] */}
            <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:left-6 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-gray-100">
              <div className="flex -space-x-2">
                {DEFAULT_AVATARS.map((initials, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                    style={{
                      backgroundColor: i % 2 === 0 ? EGREEN : accent,
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="pr-1">
                <p className="text-sm font-extrabold text-gray-900 leading-tight">{happyCount}</p>
                <p className="text-[11px] text-gray-500 font-medium">{happyLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}