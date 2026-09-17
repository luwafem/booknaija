import { EGREEN, EGREEN_DARK, buildWhatsAppLink } from './EstateoLayout';

export default function EstateoCTA({ biz, accent }) {
  const waLink = buildWhatsAppLink(
    biz.whatsapp,
    `Hi ${biz.name}, I'd like to find my dream property.`
  );

  const heroImage =
    (biz.heroSlides && biz.heroSlides[0]?.image) ||
    biz.hero ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600';

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${EGREEN} 0%, ${EGREEN_DARK} 100%)`,
          }}
        >
          {/* Optional blurred bg image overlay */}
          <div className="absolute inset-0 opacity-[0.08]">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative grid lg:grid-cols-5 items-center gap-8 p-8 sm:p-12 lg:p-16">
            {/* Left: Text */}
            <div className="lg:col-span-3">
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase mb-4 text-white/60">
                Get Started Today
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-white mb-4 max-w-xl">
                Ready to Find Your Dream Property?
              </h2>
              <p className="text-base text-white/80 leading-relaxed max-w-lg">
                Speak with our team today and take the first step toward your next home or
                investment.
              </p>
            </div>

            {/* Right: CTA */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold bg-white text-gray-900 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Contact Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              )}
              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white border-2 border-white/30 hover:border-white/60 transition-all duration-300 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Call Us
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}