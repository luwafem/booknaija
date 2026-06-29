import { Link } from 'react-router-dom';

export default function PropertyShowcase({ property, accent, isDark, index, whatsappBase }) {
  const isEven = index % 2 === 0;
  const slug = window.location.pathname.split('/')[1];
  const detailLink = `/${slug}/property/${property.id}`;

  const formatPrice = (price) => {
    if (!price) return 'POA';
    return `₦${Number(price).toLocaleString()}`;
  };

  const theme = isDark ? {
    bg: 'bg-black', text: 'text-white', sub: 'text-zinc-500', border: 'border-white/[0.06]',
    btnOutline: 'border-white/15 text-white hover:border-white/40 hover:bg-white/[0.04]'
  } : {
    bg: 'bg-white', text: 'text-stone-900', sub: 'text-stone-500', border: 'border-stone-200',
    btnOutline: 'border-stone-200 text-stone-900 hover:border-stone-400 hover:bg-stone-50'
  };

  return (
    <div className={`group grid grid-cols-1 lg:grid-cols-12 gap-0 border-t ${theme.border} transition-colors duration-500`}>
      {/* Image Side */}
      <div className={`relative aspect-[4/3] lg:aspect-auto lg:min-h-[600px] overflow-hidden ${isEven ? 'lg:col-span-7' : 'lg:col-span-7 lg:order-2'}`}>
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={property.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`absolute inset-0 ${isDark ? 'bg-zinc-900' : 'bg-stone-100'}`} />
        )}
        <div className="absolute top-6 left-6 z-10">
          <span className="px-3 py-1.5 bg-black/80 backdrop-blur-md text-[9px] font-bold tracking-[0.2em] uppercase text-white">
            {property.type === 'shortlet' ? 'Shortlet' : property.type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      {/* Details Side */}
      <div className={`lg:col-span-5 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 ${isEven ? 'lg:order-2' : ''}`}>
        <p className={`text-[9px] font-bold tracking-[0.3em] uppercase mb-4 ${theme.sub}`}>
          {property.location || 'Lagos, Nigeria'}
        </p>
        <h3 className={`text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6 ${theme.text} leading-[1.1]`}>
          {property.name}
        </h3>
        
        <div className={`flex items-center gap-6 mb-8 text-sm ${theme.sub}`}>
          {property.bedrooms !== undefined && property.bedrooms !== '' && <span>{property.bedrooms} Beds</span>}
          {property.bathrooms !== undefined && property.bathrooms !== '' && <span>{property.bathrooms} Baths</span>}
        </div>

        {property.description && (
          <p className={`text-base leading-relaxed mb-10 ${theme.sub} line-clamp-4`}>
            {property.description}
          </p>
        )}

        <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className={`text-[9px] font-bold tracking-[0.3em] uppercase mb-2 ${theme.sub}`}>Starting from</p>
            <p className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: accent }}>
              {formatPrice(property.price)}
            </p>
          </div>
          
          <Link to={detailLink} className={`inline-flex items-center gap-3 px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase border transition-all duration-300 ${theme.btnOutline}`}>
            View Property
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}