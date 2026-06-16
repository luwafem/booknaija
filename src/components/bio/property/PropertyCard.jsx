import { Link } from 'react-router-dom';

export default function PropertyCard({ property, accent, isDark, onSelect, whatsappBase }) {
  const isShortlet = property.type === 'shortlet';
  const isInspection = property.type === 'sale' || property.type === 'rent';

  const slug = window.location.pathname.split('/')[1];
  const detailLink = `/${slug}/property/${property.id}`;

  const formatPrice = (price) => {
    if (!price) return 'POA';
    return `₦${Number(price).toLocaleString()}`;
  };

  const handleCtaClick = (e) => {
    if (isInspection && whatsappBase) {
      e.preventDefault();
      e.stopPropagation();
      const message = encodeURIComponent(
        `Hello, I am interested in booking an inspection for: ${property.name} located at ${property.location || 'your listed property'}.`
      );
      window.open(`${whatsappBase}&text=${message}`, '_blank');
    }
  };

  return (
    <Link 
      to={detailLink} 
      className="group relative overflow-hidden rounded-2xl transition-all duration-500 flex flex-col hover:shadow-2xl hover:-translate-y-1"
      style={{ 
        backgroundColor: accent + '08',
        border: '1px solid ' + accent + '15',
      }}
    >
      {/* ─── IMAGE ─── */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: accent + '08' }}>
            <svg className="w-12 h-12 opacity-15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
        )}

        {/* Subtle bottom gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span 
            className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[9px] font-bold tracking-[0.15em] uppercase rounded-full shadow-sm"
            style={{ color: accent }}
          >
            {isShortlet ? 'Shortlet' : property.type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className={"font-semibold text-lg tracking-tight line-clamp-1 mb-1 " + (isDark ? 'text-white' : 'text-gray-900')}>
          {property.name}
        </h3>

        <p className={"text-xs flex items-center gap-1.5 mb-5 " + (isDark ? 'text-zinc-400' : 'text-gray-500')}>
          <span className="line-clamp-1">{property.location || 'Lagos, Nigeria'}</span>
        </p>

        {/* Features as Pills */}
        <div className="flex items-center gap-2 text-xs mb-auto">
          {property.bedrooms !== undefined && property.bedrooms !== '' && (
            <span 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-300"
              style={{ 
                backgroundColor: accent + '08', 
                border: '1px solid ' + accent + '15',
                color: accent
              }}
            >
              <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7v11M21 7v11M3 11h18M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2M7 13h4m2 0h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {property.bedrooms} Bed
            </span>
          )}
          {property.bathrooms !== undefined && property.bathrooms !== '' && (
            <span 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-300"
              style={{ 
                backgroundColor: accent + '08', 
                border: '1px solid ' + accent + '15',
                color: accent
              }}
            >
              <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16a1 1 0 011 1v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1a1 1 0 011-1zm2-2V6m0 0a2 2 0 012-2m-2 2a2 2 0 012-2m0 0h0m8 4V6m0 0a2 2 0 00-2-2m2 2a2 2 0 00-2-2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {property.bathrooms} Bath
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-6 pt-5 flex items-end justify-between" style={{ borderTop: `1px solid ${accent + '15'}` }}>
          <div>
            <p className="text-xl font-bold tracking-tight" style={{ color: accent }}>
              {formatPrice(property.price)}
            </p>
            {(isShortlet || property.type === 'rent') && (
              <span className="text-[10px] font-medium uppercase tracking-wider mt-0.5 block" style={{ color: accent, opacity: 0.6 }}>
                {isShortlet ? '/ Per Night' : '/ Per Year'}
              </span>
            )}
          </div>

          <button
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full text-white shadow-sm hover:shadow-md transition-all duration-300"
            style={{ backgroundColor: accent }}
          >
            {isInspection ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Inspect
              </>
            ) : (
              'Book Now'
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}