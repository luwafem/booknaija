import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBusinessWithSEO } from '../hooks/useBusinessWithSEO';
import SEO from '../hooks/useSEO';
import PropertyHeader from '../components/bio/property/PropertyHeader';
import PropertyFooter from '../components/bio/property/PropertyFooter';

export default function PropertyDetails() {
  const { slug, propertyId } = useParams();
  const navigate = useNavigate();
  const { business: biz, loading, error, seoDescription, seoImage } = useBusinessWithSEO(slug);
  
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!loading && biz?.active) {
      window.prerenderReady = true;
      document.dispatchEvent(new Event('prerender-ready'));
    }
  }, [loading, biz]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${biz?.theme === 'dark' ? 'bg-black' : 'bg-stone-50'}`}>
        <div className={`w-8 h-8 border-2 rounded-full animate-spin ${biz?.theme === 'dark' ? 'border-stone-700 border-t-stone-400' : 'border-stone-200 border-t-stone-500'}`} />
      </div>
    );
  }

  if (!biz || !biz.active) {
    return navigate(`/${slug}`);
  }

  const property = (biz.properties || []).find(p => p.id === propertyId);

  if (!property) {
    return navigate(`/${slug}`); // Fallback if property ID is invalid
  }

  const isDark = biz.theme === 'dark';
  const accent = biz.accent ?? '#c8a97e';
  const isShortlet = property.type === 'shortlet';
  const isInspection = property.type === 'sale' || property.type === 'rent';
  
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200'];

  const formatPrice = (price) => {
    if (!price) return 'Price on Application';
    return `₦${Number(price).toLocaleString()}`;
  };

  const handleBookingAction = () => {
    if (isShortlet) {
      // Save to cart and go to checkout
      try {
        const cart = JSON.parse(sessionStorage.getItem(`cart_${slug}`)) || {};
        cart.property = property.id;
        cart.service = ''; cart.products = []; cart.food = []; cart.car = null;
        sessionStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
      } catch (e) {}
      navigate(`/book/${slug}`);
    } else if (isInspection && biz.whatsapp) {
      // Open WhatsApp with pre-filled message
      const message = encodeURIComponent(
        `Hello, I am interested in booking an inspection for: ${property.name} located at ${property.location || 'your listed property'}.`
      );
      window.open(`https://wa.me/234${biz.whatsapp.replace(/^0/, '')}&text=${message}`, '_blank');
    }
  };

  const themeClasses = isDark ? {
    bg: 'bg-black', text: 'text-white', sub: 'text-zinc-500', 
    border: 'border-white/[0.06]', card: 'bg-white/[0.02]'
  } : {
    bg: 'bg-stone-50', text: 'text-stone-900', sub: 'text-stone-500', 
    border: 'border-stone-200', card: 'bg-white'
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
      <SEO
        title={`${property.name} | ${biz.name}`}
        description={property.description || `View details for ${property.name} in ${property.location || 'Lagos'}.`}
        image={images[0]}
        type="product.item"
      />

      <PropertyHeader biz={biz} accent={accent} isDark={isDark} />

      <main className="pt-24 pb-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          
          {/* Back Navigation */}
          <Link to={`/${slug}#listings`} className={`inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase mb-10 transition-colors`} style={{ color: accent }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Portfolio
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            
            {/* Left Column: Gallery */}
            <div className="lg:col-span-3">
              {/* Main Image */}
              <div className="relative aspect-[4/3] overflow-hidden border ${themeClasses.border} mb-4">
                <img 
                  src={images[activeImage]} 
                  alt={property.name} 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md text-[9px] font-bold tracking-[0.2em] uppercase text-white">
                    {isShortlet ? 'Shortlet' : property.type === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <button 
                      key={index} 
                      onClick={() => setActiveImage(index)}
                      className={`relative aspect-[4/3] overflow-hidden border-2 transition-all duration-300 ${activeImage === index ? 'border-opacity-100' : 'border-opacity-0 hover:border-opacity-50'}`}
                      style={{ borderColor: activeImage === index ? accent : 'transparent' }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-2 flex flex-col">
              
              {/* Location Micro-label */}
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-3.5 h-3.5" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className={`text-xs font-medium tracking-wide uppercase ${themeClasses.sub}`}>
                  {property.location || 'Lagos, Nigeria'}
                </span>
              </div>

              {/* Title & Price */}
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                {property.name}
              </h1>
              
              <div className="mb-8 pb-8 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e7e5e4' }}>
                <p className="text-3xl font-light tracking-wide" style={{ color: accent }}>
                  {formatPrice(property.price)}
                </p>
                {(isShortlet || property.type === 'rent') && (
                  <span className={`text-xs font-medium uppercase tracking-wider ${themeClasses.sub}`}>
                    {isShortlet ? '/ Per Night' : '/ Per Year'}
                  </span>
                )}
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e7e5e4' }}>
                {property.bedrooms !== undefined && property.bedrooms !== '' && (
                  <div className={`text-center p-4 rounded-sm ${themeClasses.card} border ${themeClasses.border}`}>
                    <p className="text-2xl font-light mb-1">{property.bedrooms}</p>
                    <p className={`text-[10px] font-bold tracking-[0.15em] uppercase ${themeClasses.sub}`}>Beds</p>
                  </div>
                )}
                {property.bathrooms !== undefined && property.bathrooms !== '' && (
                  <div className={`text-center p-4 rounded-sm ${themeClasses.card} border ${themeClasses.border}`}>
                    <p className="text-2xl font-light mb-1">{property.bathrooms}</p>
                    <p className={`text-[10px] font-bold tracking-[0.15em] uppercase ${themeClasses.sub}`}>Baths</p>
                  </div>
                )}
                {property.square_meters && (
                  <div className={`text-center p-4 rounded-sm ${themeClasses.card} border ${themeClasses.border}`}>
                    <p className="text-2xl font-light mb-1">{property.square_meters}</p>
                    <p className={`text-[10px] font-bold tracking-[0.15em] uppercase ${themeClasses.sub}`}>Sq.M</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-8 pb-8 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e7e5e4' }}>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>Description</h3>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${themeClasses.sub}`}>
                    {property.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-50" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span className={`text-sm ${themeClasses.sub}`}>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop CTA */}
              <div className="hidden lg:block mt-auto">
                <button 
                  onClick={handleBookingAction}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300"
                  style={{ 
                    backgroundColor: isInspection ? 'transparent' : accent, 
                    color: isInspection ? (isDark ? 'white' : '#1c1917') : (isDark ? '#000' : '#fff'),
                    border: isInspection ? `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#1c1917'}` : '1px solid transparent'
                  }}
                >
                  {isInspection ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Schedule Inspection
                    </>
                  ) : 'Book Now'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA Bar (Glassmorphism) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 backdrop-blur-xl border-t" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e7e5e4' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-light" style={{ color: accent }}>{formatPrice(property.price)}</p>
            <p className={`text-[10px] uppercase tracking-wider ${themeClasses.sub}`}>{isShortlet ? '/ Night' : property.type === 'rent' ? '/ Year' : 'Total'}</p>
          </div>
          <button 
            onClick={handleBookingAction}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ backgroundColor: isInspection ? 'transparent' : accent, color: isInspection ? (isDark ? 'white' : '#1c1917') : (isDark ? '#000' : '#fff'), border: isInspection ? `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : '#1c1917'}` : 'none' }}
          >
            {isInspection ? 'Inspect' : 'Book Now'}
          </button>
        </div>
      </div>

      <PropertyFooter biz={biz} accent={accent} isDark={isDark} />
    </div>
  );
}