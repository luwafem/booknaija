import { EGREEN, buildWhatsAppLink } from './EstateoLayout';

export default function EstateoAbout({ biz, accent }) {
  // Stats row — pulled from the dashboard "Stats" editor (biz.stats).
  // Falls back to generic numbers if the owner hasn't added any yet.
  const stats = biz.stats && biz.stats.length > 0
    ? biz.stats.slice(0, 3)
    : [
        { value: '5K+', label: 'Properties Listed' },
        { value: '10+', label: 'Years of Experience' },
        { value: '98%', label: 'Happy Customers' },
      ];

  // Two overlapping images — uses hero image + first two gallery images.
  // Same fields the Default template reads, so editing in the dashboard
  // updates both templates simultaneously.
  const img1 =
    biz.hero ||
    (biz.gallery && biz.gallery[0] && biz.gallery[0].images?.[0]) ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
  const img2 =
    (biz.gallery && biz.gallery[1] && biz.gallery[1].images?.[0]) ||
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800';

  const waLink = buildWhatsAppLink(
    biz.whatsapp,
    `Hi ${biz.name}, I'd like to learn more.`
  );

  // 👇 Heading now reads from biz.name (same pattern as DefaultLayout's About section).
  //    Personalised per business, no duplication with the hero tagline,
  //    no new dashboard inputs needed.
  const aboutHeading = biz.name || 'Our Business';

  // 👇 CTA logic: WhatsApp if available, else a phone call, else jump to listings.
  const hasWhatsApp = !!waLink;
  const hasPhone = !!biz.phone;

  return (
    <section id="about" className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ─── LEFT: Overlapping images ─── */}
          <div className="relative">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={img1}
                  alt={`${biz.name} — feature image`}
                  className="w-full aspect-[3/4] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="col-span-2 self-end rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={img2}
                  alt={`${biz.name} — gallery image`}
                  className="w-full aspect-[3/4] object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Accent blob behind */}
            <div
              className="absolute -z-10 -top-6 -left-6 w-40 h-40 rounded-full opacity-20 blur-2xl"
              style={{ backgroundColor: accent }}
            />
          </div>

          {/* ─── RIGHT: Copy + stats ─── */}
          <div>

            {/* 👇 Now driven by biz.name — matches the Default template pattern */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-gray-900 mb-5">
              About{' '}
              <span style={{ color: EGREEN }}>{aboutHeading}</span>
            </h2>

            <p className="text-base text-gray-600 leading-relaxed mb-8">
              {biz.bio ||
                `With years of experience in the Nigerian market, ${biz.name} is committed to helping you find what fits your lifestyle and budget.`}
            </p>

            {/* Stats row — already driven by biz.stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-100 mb-8">
              {stats.map((s, i) => (
                <div key={i}>
                  <p
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1"
                    style={{ color: i === 1 ? accent : EGREEN }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* 👇 CTA now does something meaningful instead of "Read More" */}
            {hasWhatsApp && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: EGREEN }}
              >
                Chat With Us
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}

            {!hasWhatsApp && hasPhone && (
              <a
                href={`tel:${biz.phone}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: EGREEN }}
              >
                Call Us
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </a>
            )}

            {!hasWhatsApp && !hasPhone && (
              <a
                href="#properties"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: EGREEN }}
              >
                View Properties
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}