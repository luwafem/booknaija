// src/components/bio/property/havenly/HavenlyShowcase.jsx
import { HAVENLY_BG, HAVENLY_BORDER, buildWhatsAppLink } from './HavenlyLayout';

// Static feature lists — generic value props.
const LISTING_FEATURES = [
  'Find the ideal tenant in less than 15 days.',
  'Professional photos for your property.',
  'High visibility on the country\u2019s main portals.',
  'Complete management within your application.',
  'Receive your rent on time every month.',
];

const APARTMENT_FEATURES = [
  'Smart matching based on your preferences.',
  'Hundreds of verified apartments to choose from.',
  'Search by location, price, and amenities.',
  'Move-in ready within days.',
  'Complete support throughout your journey.',
];

export default function HavenlyShowcase({ biz, accent }) {
  const galleryImages = (() => {
    if (!biz.gallery || biz.gallery.length === 0) return [];
    if (typeof biz.gallery[0] === 'string') return biz.gallery;
    return biz.gallery.flatMap((g) => g.images || []);
  })();

  const img1 = galleryImages[2] || galleryImages[0] || biz.hero ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900';
  const img2 = galleryImages[3] || galleryImages[1] ||
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900';

  const waLink = buildWhatsAppLink(
    biz.whatsapp,
    `Hi ${biz.name}, I'd like to learn more about your listings.`
  );

  return (
    <section
      id="havenly-about"
      className="py-20 lg:py-28"
      style={{ backgroundColor: HAVENLY_BG }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-8 lg:space-y-10">
        {/* ─── Row 1: Listing Made Simple ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Image card */}
          <div className="relative rounded-3xl overflow-hidden min-h-[340px] lg:min-h-[420px] order-2 lg:order-1">
            <img
              src={img1}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <p className="text-white text-lg lg:text-xl font-bold leading-tight max-w-xs">
                Your property, perfectly managed.
              </p>
            </div>
          </div>

          {/* Copy card */}
          <div
            className="rounded-3xl p-7 lg:p-10 flex flex-col justify-center order-1 lg:order-2 bg-white"
            style={{ border: `1px solid ${HAVENLY_BORDER}` }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a] mb-5">
              Listing Made Simple And Stress-Free
            </h3>
            <ul className="space-y-3 mb-6">
              {LISTING_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[#6b6b6b] leading-relaxed">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    <svg className="w-3 h-3" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#havenly-contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-[0.1em] uppercase transition-all hover:brightness-110 w-full sm:w-auto self-start"
              style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
            >
              List My Property
            </a>
          </div>
        </div>

        {/* ─── Row 2: Find The Perfect Apartment ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Copy card */}
          <div
            className="rounded-3xl p-7 lg:p-10 flex flex-col justify-center bg-white"
            style={{ border: `1px solid ${HAVENLY_BORDER}` }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a] mb-5">
              Find The Perfect Property for Your Lifestyle
            </h3>
            <ul className="space-y-3 mb-6">
              {APARTMENT_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[#6b6b6b] leading-relaxed">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    <svg className="w-3 h-3" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#havenly-properties"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-[0.1em] uppercase transition-all hover:brightness-110 w-full sm:w-auto self-start"
              style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
            >
              View Properties
            </a>
          </div>

          {/* Image card */}
          <div className="relative rounded-3xl overflow-hidden min-h-[340px] lg:min-h-[420px]">
            <img
              src={img2}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <p className="text-white text-lg lg:text-xl font-bold leading-tight max-w-xs">
                Browse verified properties that match you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}