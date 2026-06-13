// PropertyListings.jsx
import PropertyCard from './PropertyCard';

export default function PropertyListings({ biz, accent, isDark, onSelectProperty }) {
  const isShortletBusiness = biz.businessType === 'Shortlet';
  const whatsappBase = biz.whatsapp ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}` : null;

  const theme = isDark
    ? {
        bg: 'bg-black',
        text: 'text-white',
        sub: 'text-zinc-300',
        muted: 'text-zinc-400',
        emptyBg: 'bg-white/[0.02]',
      }
    : {
        bg: 'bg-white',
        text: 'text-black',
        sub: 'text-gray-600',
        muted: 'text-gray-500',
        emptyBg: 'bg-white',
      };

  const properties = biz.properties || [];

  return (
    <section id="listings" className={`transition-colors duration-500 ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-24 md:py-32 lg:py-40">

        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black">
            {isShortletBusiness ? 'Available Shortlets' : 'Our Properties'}
          </h2>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                accent={accent}
                isDark={isDark}
                onSelect={onSelectProperty}
                whatsappBase={whatsappBase}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-24 ${theme.emptyBg}`}>
            <svg className={`w-12 h-12 mx-auto mb-4 opacity-20 ${theme.sub}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className={`text-sm font-medium ${theme.sub}`}>
              No properties listed yet.
            </p>
            <p className={`text-xs mt-1 ${theme.muted}`}>
              Check back soon for new additions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}