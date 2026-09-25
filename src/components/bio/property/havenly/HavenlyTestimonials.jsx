// src/components/bio/property/havenly/HavenlyTestimonials.jsx
import { HAVENLY_DARK } from './HavenlyLayout';

// Default placeholder testimonials shown when biz.testimonials is empty.
// These are static design copy — see the note in EstateoTestimonials.jsx
// for why we deliberately don't wire this to a dashboard field.
const DEFAULT_TESTIMONIALS = [
  {
    text: "We found my dream apartment incredibly fast. The entire process was smooth, from browsing to signing the lease.",
    name: 'Adaeze Okonkwo',
    role: 'Homeowner, Lekki',
  },
  {
    text: 'The team guided us through every step. Their knowledge of the market made all the difference.',
    name: 'Chinedu Nwosu',
    role: 'Investor, Abuja',
  },
  {
    text: 'From the first call to the final handover, everything was seamless. Highly recommended.',
    name: 'Funke Adebayo',
    role: 'First-time Buyer, Ikoyi',
  },
];

export default function HavenlyTestimonials({ biz, accent }) {
  const testimonials =
    biz.testimonials && biz.testimonials.length > 0
      ? biz.testimonials
      : DEFAULT_TESTIMONIALS;

  const primary = testimonials[0];

  // Right-side image — prefer a gallery shot
  const galleryImages = (() => {
    if (!biz.gallery || biz.gallery.length === 0) return [];
    if (typeof biz.gallery[0] === 'string') return biz.gallery;
    return biz.gallery.flatMap((g) => g.images || []);
  })();
  const sideImage = galleryImages[4] || biz.hero ||
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900';

  const initials = primary.name
    ? primary.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  return (
    <section
      className="py-20 lg:py-28"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1a1a] mb-4">
            Hear From Our Happy Customers
          </h2>
          <p className="text-sm text-[#6b6b6b]">
            Thousands of satisfied clients have found their properties through {biz.name}.
          </p>
        </div>

        {/* Main card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Testimonial card */}
          <div
            className="lg:col-span-7 rounded-3xl p-8 lg:p-10 flex flex-col justify-between"
            style={{ backgroundColor: '#f8f7f4' }}
          >
            <div>
              {/* Stars */}
              

              <p className="text-base lg:text-lg text-[#1a1a1a] leading-relaxed mb-8">
                {primary.text}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#a3a3a3] mb-4">
                Testimonial
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: HAVENLY_DARK }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{primary.name}</p>
                  <p className="text-xs text-[#6b6b6b]">{primary.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image card */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[300px] lg:min-h-full">
            <img
              src={sideImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 inline-flex items-center gap-2 shadow-lg">
                
                <span className="text-[11px] font-semibold text-[#1a1a1a]">
                  Verified Review
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}