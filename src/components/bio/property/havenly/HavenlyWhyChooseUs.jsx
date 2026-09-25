// src/components/bio/property/havenly/HavenlyWhyChooseUs.jsx
import { HAVENLY_BG, HAVENLY_BORDER } from './HavenlyLayout';

// Static design copy — generic value propositions shown to every visitor.
// If you ever want these per-business editable, that's a new dashboard
// field, but the whole point of this template is to avoid that.
const STATIC_CARDS = [
  {
    tag: 'COMFORT',
    title: 'Everything In One Place',
    desc: 'From browsing to booking, manage your entire property journey from one simple link.',
    variant: 'light',
  },
  {
    tag: 'Trust',
    title: "We're With You Every Step",
    desc: 'Verified listings, honest guidance, and a team that actually answers the phone.',
    variant: 'light',
    image: true,
  },
  {
    tag: 'SIMPLICITY',
    title: 'Stress-Free, Made Simple',
    desc: 'No endless paperwork, no uncertainty. Just clean, straightforward listings.',
    variant: 'dark',
  },
];

export default function HavenlyWhyChooseUs({ biz, accent }) {
  const propertyCount = (biz.properties || []).length;
  const hasStats = biz.stats && biz.stats.length > 0;
  const firstStat = hasStats ? biz.stats[0] : null;

  // Use gallery images for the two light cards if available
  const galleryImages = (() => {
    if (!biz.gallery || biz.gallery.length === 0) return [];
    if (typeof biz.gallery[0] === 'string') return biz.gallery;
    return biz.gallery.flatMap((g) => g.images || []);
  })();

  const cardImage1 = galleryImages[0] || biz.hero ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
  const cardImage2 = galleryImages[1] ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

  return (
    <section className="relative py-20 lg:py-28" style={{ backgroundColor: HAVENLY_BG }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1a1a] mb-4">
            Why Choose {biz.name}?
          </h2>
          <p className="text-sm sm:text-base text-[#6b6b6b] leading-relaxed">
            {firstStat
              ? `${firstStat.value} ${firstStat.label.toLowerCase()}. ${biz.tagline || 'We make property simple.'}`
              : `Because we made renting and buying as easy as it should be. No endless paperwork, no uncertainty, and with the support of a team that's with you every step of the way.`}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STATIC_CARDS.map((card, i) => {
            const image = i === 0 ? cardImage1 : i === 1 ? cardImage2 : null;
            const isDark = card.variant === 'dark';

            return (
              <div
                key={card.tag}
                className="relative rounded-2xl overflow-hidden min-h-[280px] flex flex-col justify-end p-6 shadow-lg transition-transform duration-500 hover:-translate-y-1"
                style={{
                  backgroundColor: isDark ? '#0e0e0e' : '#ffffff',
                  border: isDark ? 'none' : `1px solid ${HAVENLY_BORDER}`,
                }}
              >
                {/* Image (for light cards) */}
                {image && !isDark && (
                  <>
                    <div className="absolute inset-0">
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(255,255,255,0.98) 30%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.2) 100%)',
                      }}
                    />
                  </>
                )}

                {/* Dark card subtle pattern */}
                {isDark && (
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-1/3 translate-x-1/4"
                    style={{ backgroundColor: accent }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10">
                  
                  <h3
                    className="text-xl font-bold leading-tight mb-2"
                    style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#6b6b6b' }}
                  >
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom mini-stat row if stats exist */}
        {hasStats && biz.stats.length > 1 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {biz.stats.slice(0, 4).map((s, i) => (
              <div key={i} className="text-center">
                <p
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1"
                  style={{ color: i === 0 ? accent : '#1a1a1a' }}
                >
                  {s.value}
                </p>
                <p className="text-[10px] sm:text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.15em]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}