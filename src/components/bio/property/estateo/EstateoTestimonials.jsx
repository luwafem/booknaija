import { EGREEN } from './EstateoLayout';

const DEFAULT_TESTIMONIALS = [
  {
    text: 'The team helped me find my dream home in Lagos in under a month. Their knowledge of the market is unmatched and they made the whole process stress-free.',
    name: 'Adaeze Okonkwo',
    role: 'Homeowner, Lekki',
  },
  {
    text: 'I have worked with many agents but none as professional as this team. They truly understand what their clients need and deliver beyond expectations.',
    name: 'Chinedu Nwosu',
    role: 'Property Investor, Abuja',
  },
  {
    text: 'From the first call to the final handover, everything was seamless. I would recommend them to anyone looking for a reliable real estate partner.',
    name: 'Funke Adebayo',
    role: 'First-time Buyer, Ikoyi',
  },
];

export default function EstateoTestimonials({ biz, accent }) {
  // If biz.testimonials exists use it, else fallback
  const testimonials = (biz.testimonials && biz.testimonials.length > 0)
    ? biz.testimonials
    : DEFAULT_TESTIMONIALS;

  return (
    <section className="bg-[#f8f7f4] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="text-[11px] font-bold tracking-[0.22em] uppercase mb-4 inline-flex items-center gap-2"
            style={{ color: accent }}
          >
            <span className="w-8 h-px" style={{ backgroundColor: accent }} />
            Testimonials
            <span className="w-8 h-px" style={{ backgroundColor: accent }} />
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-gray-900 max-w-2xl mx-auto">
            What Clients Say About Us
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t, i) => {
            const initials = t.name
              ? t.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : '?';

            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg
                      key={n}
                      className="w-4 h-4"
                      viewBox="0 0 20 20"
                      fill={accent}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: EGREEN }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}