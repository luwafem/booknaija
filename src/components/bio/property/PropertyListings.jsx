import PropertyCard from './PropertyCard';

export default function PropertyListings({ biz, accent, isDark, onSelectProperty }) {
  const isShortletBusiness = biz.businessType === 'Shortlet';
  
  // Construct the base WhatsApp link to pass down to PropertyCard
  const whatsappBase = biz.whatsapp ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}` : null;

  const themeClasses = isDark 
    ? {
        bg: 'bg-black',
        text: 'text-white',
        sub: 'text-zinc-500',
        emptyBorder: 'border-white/[0.06]',
        emptyBg: 'bg-white/[0.02]',
      }
    : {
        bg: 'bg-stone-50',
        text: 'text-stone-900',
        sub: 'text-stone-400',
        emptyBorder: 'border-stone-200',
        emptyBg: 'bg-white',
      };

  const properties = biz.properties || [];

  return (
    <section id="listings" className={`py-24 md:py-32 ${themeClasses.bg}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        
        {/* Architectural Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="block text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: accent }}>
            {isShortletBusiness ? 'Premium Stays' : 'Exclusive Portfolio'}
          </span>
          <h2 className={`text-3xl md:text-5xl font-light tracking-tight ${themeClasses.text}`}>
            {isShortletBusiness ? 'Available Shortlets' : 'Our Properties'}
          </h2>
          <p className={`text-sm mt-5 max-w-lg mx-auto leading-relaxed ${themeClasses.sub}`}>
            {isShortletBusiness 
              ? 'Browse our handpicked selection of premium short-stay properties. Book instantly online.' 
              : 'Discover our curated collection of premium real estate. Schedule a private inspection via WhatsApp.'}
          </p>
        </div>

        {/* Property Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                accent={accent} 
                isDark={isDark}
                onSelect={onSelectProperty}
                whatsappBase={whatsappBase} // Pass down the WhatsApp link for "Book Inspection"
              />
            ))}
          </div>
        ) : (
          /* Luxury Empty State */
          <div className={`text-center py-24 border ${themeClasses.emptyBorder} rounded-none ${themeClasses.emptyBg}`}>
            <svg className={`w-12 h-12 mx-auto mb-4 opacity-20 ${themeClasses.sub}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className={`text-sm font-medium ${themeClasses.sub}`}>
              No properties listed yet.
            </p>
            <p className={`text-xs mt-1 ${themeClasses.sub} opacity-60`}>
              Check back soon for new additions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}