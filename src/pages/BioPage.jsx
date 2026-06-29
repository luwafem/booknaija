import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useBusinessWithSEO } from '../hooks/useBusinessWithSEO';
import SEO from '../hooks/useSEO';
import HeroSection from '../components/bio/HeroSection';
import Gallery from '../components/bio/Gallery';
import ServiceList from '../components/bio/ServiceList';
import ProductList from '../components/bio/ProductList';
import FoodList from '../components/bio/FoodList';
import CarList from '../components/bio/CarList';
import PropertyLayout from '../components/bio/property/PropertyLayout';

// --- ADSENSE CONFIGURATION (GLOBAL) ---
const ADSENSE_CLIENT = 'ca-pub-1898000452698308';
const AD_SLOT_PRIMARY = '1234567890';
const AD_SLOT_SECONDARY = '1111111111';
const AD_SLOT_FOOTER = '0987654321';

let adsenseScriptLoaded = false;
let adsenseScriptLoading = false;

const GoogleAd = ({ slot, className = '' }) => {
  const adRef = useRef(null);
  const hasPushed = useRef(false);

  useEffect(() => {
    if (hasPushed.current) return;
    hasPushed.current = true;

    const pushAd = () => {
      if (!adRef.current) return;
      try {
        if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
          window.adsbygoogle.push({});
        }
      } catch (e) {}
    };

    if (adsenseScriptLoaded) {
      const timer = setTimeout(pushAd, 150);
      return () => clearTimeout(timer);
    }

    if (adsenseScriptLoading) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (adsenseScriptLoaded || attempts > 20) {
          clearInterval(interval);
          if (adsenseScriptLoaded) pushAd();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    adsenseScriptLoading = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

    script.onload = () => {
      adsenseScriptLoaded = true;
      adsenseScriptLoading = false;
      const timer = setTimeout(pushAd, 100);
      script._timerCleanup = () => clearTimeout(timer);
    };

    script.onerror = () => {
      adsenseScriptLoading = false;
    };

    document.head.appendChild(script);

    return () => {
      if (script._timerCleanup) script._timerCleanup();
    };
  }, [slot]);

  return (
    <div className={`w-full flex justify-center overflow-hidden ${className}`} aria-hidden="true">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-ad-test="on"
      />
    </div>
  );
};

const ReferralLink = ({ slug, accent = '#c8a97e' }) => {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${window.location.origin}/signup?ref=${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-center mb-4" style={{ color: accent }}>
        Refer 3 friends = 1 Free Month
      </p>
      <div className="flex justify-center">
        <button
          onClick={handleCopy}
          className="group flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-300"
          style={{ 
            backgroundColor: accent + '08',
            borderColor: accent + '15',
          }}
          aria-label="Copy referral link"
        >
          <span className="text-xs font-medium truncate max-w-[160px] sm:max-w-[200px]" style={{ color: accent }}>
            {referralUrl.replace(/^https?:\/\//, '')}
          </span>
          <div className="h-4 w-px" style={{ backgroundColor: accent + '18' }} aria-hidden="true" />
          <span className="text-xs font-semibold transition-all duration-300" style={{ color: accent }}>
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
    </div>
  );
};

const SectionHeading = ({ children, accent, id }) => (
  <div className="flex items-center gap-4 mb-8 md:mb-10">
    <div className="h-px flex-1" style={{ backgroundColor: accent + '15' }} />
    <h2 id={id} className="text-2xl md:text-3xl font-medium tracking-tight whitespace-nowrap text-black">
      {children}
    </h2>
    <div className="h-px flex-1" style={{ backgroundColor: accent + '15' }} />
  </div>
);

function isLight(hex) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

export default function BioPage() {
  const urlSlug = useParams().slug;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get('reference') || params.get('trxref');
  const codeParam = params.get('code') || '';

  // ─── Handle pre‑injected data from server (custom domain) ───
  const [initialData, setInitialData] = useState(null);
  const [effectiveSlug, setEffectiveSlug] = useState(urlSlug);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__BUSINESS_DATA__) {
      const data = window.__BUSINESS_DATA__;
      setInitialData(data);
      // If we have data, use its slug (useful for custom domains where URL path is root)
      if (data.slug) {
        setEffectiveSlug(data.slug);
      }
      // Clear to free memory
      delete window.__BUSINESS_DATA__;
    }
  }, []);

  // ─── Use the hook with optional initialData ───
  const { 
    business: biz, 
    loading, 
    error, 
    seoDescription, 
    seoImage, 
    structuredData 
  } = useBusinessWithSEO(effectiveSlug, { initialData });

  const [searchQuery, setSearchQuery] = useState(codeParam);
  const [isSearchActive, setIsSearchActive] = useState(!!codeParam);

  const [activeService, setActiveService] = useState('');
  const [activeProducts, setActiveProducts] = useState([]);
  const [activeFood, setActiveFood] = useState([]);
  const [activeCar, setActiveCar] = useState(null);

  useEffect(() => {
    if (!loading && biz?.active) {
      window.prerenderReady = true;
      document.dispatchEvent(new Event('prerender-ready'));
      const cart = getCart();
      setActiveService(cart.service || '');
      setActiveProducts(cart.products || []);
      setActiveFood(cart.food || []);
      setActiveCar(cart.car || null);
    }
  }, [loading, biz]);

  if (ref) {
    return <Navigate to={`/book/${effectiveSlug}?reference=${ref}`} replace />;
  }

  function getCart() {
    try { return JSON.parse(sessionStorage.getItem(`cart_${effectiveSlug}`)) || {}; }
    catch { return {}; }
  }

  function saveCart(cart) {
    sessionStorage.setItem(`cart_${effectiveSlug}`, JSON.stringify(cart));
    setActiveService(cart.service || '');
    setActiveProducts(cart.products || []);
    setActiveFood(cart.food || []);
    setActiveCar(cart.car || null);
  }

  const theme = biz?.theme || 'light';
  const isDark = theme === 'dark';
  const accent = biz?.accent ?? '#c8a97e';

  const ui = isDark
    ? {
        bg: 'bg-black',
        text: 'text-white',
        sub: 'text-zinc-300',
        muted: 'text-zinc-500',
        card: 'bg-white/[0.03]',
        pill: 'bg-white/[0.06]',
        border: 'border-white/[0.06]',
      }
    : {
        bg: 'bg-white',
        text: 'text-black',
        sub: 'text-gray-600',
        muted: 'text-gray-400',
        card: 'bg-gray-50',
        pill: 'bg-gray-100',
        border: 'border-gray-100',
      };

  const filteredProducts = searchQuery
    ? (biz?.products || []).filter(p =>
        (p.product_code && p.product_code.toLowerCase() === searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz?.products || []);

  const filteredServices = searchQuery
    ? (biz?.services || []).filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz?.services || []);

  const filteredFood = searchQuery
    ? (biz?.food || []).filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz?.food || []);

  const filteredCars = searchQuery
    ? (biz?.cars || []).filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz?.cars || []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${ui.bg}`} role="status">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: accent + '15', borderTopColor: accent }} />
      </div>
    );
  }

  if (!biz || !biz.active) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${ui.bg}`} role="alert">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-xl border" style={{ backgroundColor: accent + '08', borderColor: accent + '15', color: accent }}>!</div>
          <h1 className={`text-sm font-medium ${ui.sub}`}>Page Unavailable</h1>
          <p className={`text-xs mt-1 ${ui.muted}`}>This link is currently inactive.</p>
          <a href="/" className="inline-block mt-6 px-5 py-2.5 text-xs font-semibold tracking-wide rounded-full transition-all duration-300 hover:opacity-80" style={{ backgroundColor: accent + '08', color: accent }}>
            Go to BookNaija
          </a>
        </div>
      </div>
    );
  }

  const showServices = biz.servicesEnabled && filteredServices.length > 0;
  const showProducts = biz.productsEnabled && filteredProducts.length > 0;
  const showFood = biz.foodEnabled && filteredFood.length > 0;
  const showCars = biz.carsEnabled && filteredCars.length > 0;
  const isPropertyWebsite = biz.propertiesEnabled && (biz.properties || []).length > 0;

  const adsEnabled = biz.adsEnabled !== false && !isPropertyWebsite;
  const totalItems = filteredServices.length + filteredProducts.length + filteredFood.length + filteredCars.length;
  const hasAnyContent = showServices || showProducts || showFood || showCars;

  const showPrimaryAd = adsEnabled && hasAnyContent && !isSearchActive;
  const showSecondaryAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 6;
  const showFooterAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 4;

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearchActive(!!searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  function handleServiceSelect(id) {
    const cart = getCart();
    if (cart.service === id) { cart.service = ''; } 
    else {
      cart.service = id; cart.products = []; cart.productVariants = {};
      cart.food = []; cart.foodVariants = {}; cart.car = null; cart.property = null;
    }
    saveCart(cart);
    const hasItems = cart.service || cart.products?.length || cart.food?.length || cart.car;
    if (hasItems) navigate(`/book/${effectiveSlug}`);
  }

  function handleProductSelect(id, size, color) {
    const cart = getCart();
    cart.service = ''; cart.food = []; cart.foodVariants = {}; cart.car = null; cart.property = null;
    if (!cart.products) cart.products = [];
    if (!cart.productVariants) cart.productVariants = {};
    if (cart.products.includes(id)) {
      cart.products = cart.products.filter(p => p !== id);
      delete cart.productVariants[id];
    } else {
      cart.products.push(id);
      const variant = {};
      if (size) variant.size = size;
      if (color) variant.color = color;
      if (Object.keys(variant).length) cart.productVariants[id] = variant;
    }
    saveCart(cart);
    const hasItems = cart.products.length > 0;
    if (hasItems) navigate(`/book/${effectiveSlug}`);
  }

  function handleFoodSelect(id, variant) {
    const cart = getCart();
    cart.service = ''; cart.products = []; cart.productVariants = {}; cart.car = null; cart.property = null;
    if (!cart.food) cart.food = [];
    if (!cart.foodVariants) cart.foodVariants = {};
    if (cart.food.includes(id)) {
      cart.food = cart.food.filter(f => f !== id);
      delete cart.foodVariants[id];
    } else {
      cart.food.push(id);
      if (variant) cart.foodVariants[id] = variant;
    }
    saveCart(cart);
    const hasItems = cart.food.length > 0;
    if (hasItems) navigate(`/book/${effectiveSlug}`);
  }

  function handleCarSelect(car) {
    const cart = getCart();
    if (cart.car === car.id) { cart.car = null; } 
    else {
      cart.service = ''; cart.products = []; cart.productVariants = {};
      cart.food = []; cart.foodVariants = {}; cart.car = car.id; cart.property = null;
    }
    saveCart(cart);
    const hasItems = cart.car;
    if (hasItems) navigate(`/book/${effectiveSlug}`);
  }

  function handlePropertySelect(id) {
    const cart = getCart();
    cart.service = ''; cart.products = []; cart.productVariants = {};
    cart.food = []; cart.foodVariants = {}; cart.car = null;
    cart.property = id;
    saveCart(cart);
    navigate(`/book/${effectiveSlug}`);
  }
  
  const faqs = [
    {
      q: `How do I book with ${biz.name}?`,
      a: showServices 
        ? `Booking an appointment with ${biz.name} is simple. Browse the services listed above, select your preferred option, and you will be directed to a secure checkout page.`
        : showCars 
        ? `Scheduling a rental or viewing with ${biz.name} is easy. Browse the available vehicles, select the one you are interested in, and proceed to secure checkout.`
        : isPropertyWebsite
        ? `Booking a viewing or securing a property with ${biz.name} is easy. Browse the available listings, select the property you are interested in, and proceed to secure checkout.`
        : showFood
        ? `Placing an order with ${biz.name} is straightforward. Browse their menu, customize your items, and proceed to secure checkout.`
        : `Booking or purchasing from ${biz.name} is simple. Browse the listings above, select your preferred option, and proceed to secure checkout.`
    },
    {
      q: `Where is ${biz.name} located?`,      
      a: biz.location 
        ? `${biz.name} is located in ${biz.location}. You can find more details and contact them directly through this page.` 
        : `You can find location details and contact information for ${biz.name} on this page.`
    },
    {
      q: `Is my payment secure?`,
      a: `Absolutely. All payments on BookNaija are processed securely through Paystack, ensuring your financial information is fully protected. You will receive an instant digital receipt upon successful payment.`
    },
    {
      q: `Can I buy products from ${biz.name} online?`,
      a: showProducts 
        ? `Yes! ${biz.name} offers a selection of products that you can purchase directly through this page. Simply select the items you want and proceed to secure checkout.`
        : isPropertyWebsite
        ? `Yes, you can secure a property rental, lease, or purchase online directly through this page with safe, upfront payments.`
        : showFood 
        ? `Yes! ${biz.name} offers online ordering for their menu items with secure checkout and delivery options.`
        : showCars
        ? `Yes, you can secure a vehicle rental or schedule a viewing online directly through this page with safe, upfront payments.`
        : `Yes, you can book services and make purchases directly through this page with secure online payments.`
    }
  ];

  const faqOnLight = isLight(accent);
  const faqQ = faqOnLight ? '#000' : '#fff';
  const faqA = faqOnLight ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.8)';
  const faqBadge = faqOnLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';

  return (
    <div
      className={`min-h-screen ${ui.bg} ${ui.text} transition-colors duration-500`}
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <style>{`body, body * { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }`}</style>

      <SEO
        title={biz.name}
        description={seoDescription}
        image={seoImage}
        type="business.business"
        noIndex={!biz.active}
        structuredData={structuredData}
        location={biz.location}
      />

      <meta itemProp="url" content={`${window.location.origin}/${biz.slug}`} />
      <meta itemProp="name" content={biz.name} />
      {biz.phone && <meta itemProp="telephone" content={biz.phone} />}
      {biz.location && <meta itemProp="address" content={biz.location} />}

      {isPropertyWebsite ? (
        <PropertyLayout 
          biz={biz} 
          accent={accent} 
          isDark={isDark} 
          onSelectProperty={handlePropertySelect} 
        />
      ) : (
        <>
          <style>{`
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
          `}</style>

          <div className="flex flex-col xl:flex-row xl:h-screen overflow-hidden">
      
            <aside className="xl:sticky xl:top-0 h-screen xl:overflow-y-auto xl:overflow-x-hidden scrollbar-hide xl:shrink-0 xl:w-[35%]">
              <HeroSection biz={{
                logo: biz.logo, name: biz.name, slug: biz.slug, tagline: biz.tagline,
                bio: biz.bio, phone: biz.phone, whatsapp: biz.whatsapp, location: biz.location,
                hours: biz.hours, accent: biz.accent, avatar: biz.avatar, hero: biz.hero,
                gallery: biz.gallery, socials: biz.socials, theme: biz.theme
              }} />
            </aside>

            <main className={`flex-1 xl:w-[65%] xl:min-w-0 xl:overflow-y-auto ${ui.bg}`}>
              <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 pb-12 xl:pb-16">

                {biz.gallery && biz.gallery.length > 0 && (
                  <div itemScope itemType="https://schema.org/ImageGallery" aria-label="Photo gallery" className="pt-10 lg:pt-14">
                    <meta itemProp="name" content={`${biz.name} Gallery`} />
                    <Gallery gallery={biz.gallery} accent={accent} location={biz.location} theme={theme} />
                  </div>
                )}

                {/* ── SEARCH BAR ── */}
                <section className="mt-12 lg:mt-16" aria-label="Search">
                  <form onSubmit={handleSearch} className="relative" role="search" aria-label="Search services and products">
                    <label htmlFor="business-search" className="sr-only">Search by name, code, or description</label>
                    <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none" aria-hidden="true">
                      <svg className="w-4 h-4 transition-colors duration-300" style={{ color: searchQuery ? accent : accent + '40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                      id="business-search" 
                      type="search" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      placeholder="Search by name, code, or description..." 
                      className="w-full rounded-xl pl-6 pr-10 py-3 text-sm border focus:outline-none transition-all duration-300"
                      style={{ 
                        backgroundColor: accent + '08',
                        borderColor: searchQuery ? accent : accent + '15',
                        color: isDark ? '#fff' : '#000',
                      }}
                      onFocus={(e) => { if (!searchQuery) e.target.style.borderColor = accent; }}
                      onBlur={(e) => { if (!searchQuery) e.target.style.borderColor = accent + '15'; }}
                    />
                    {searchQuery && (
                      <button type="button" onClick={clearSearch} className="absolute inset-y-0 right-0 pr-4 flex items-center transition-opacity hover:opacity-70" style={{ color: accent }} aria-label="Clear search">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </form>
                  {isSearchActive && searchQuery && (
                    <div className="mt-3 flex items-center justify-between" role="status" aria-live="polite">
                      <p className="text-xs font-medium" style={{ color: accent }}>Showing results for "{searchQuery}"</p>
                      <button onClick={clearSearch} className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: accent }}>Clear</button>
                    </div>
                  )}
                </section>

                {/* ── ACCENT DIVIDER ── */}
                <div className="mt-12 lg:mt-16 flex items-center gap-3" aria-hidden="true">
                  <div className="flex-1 h-px" style={{ backgroundColor: accent + '15' }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                  <div className="flex-1 h-px" style={{ backgroundColor: accent + '15' }} />
                </div>

                {showPrimaryAd && (
                  <div className="mt-12 lg:mt-16">
                    <div className="rounded-2xl p-6 lg:p-8 flex flex-col items-center" style={{ backgroundColor: accent + '08', borderColor: accent + '15', borderWidth: '1px' }}>
                      <span className="text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold text-center block" style={{ color: accent }}>Sponsored</span>
                      <GoogleAd slot={AD_SLOT_PRIMARY} className="w-full max-w-md" />
                    </div>
                  </div>
                )}

                {/* ── ABOUT ── */}
                {biz.bio && (
                  <section className="mt-16 lg:mt-24" aria-label="About business">
                    <div className="border-l-2 pl-6 md:pl-8" style={{ borderColor: accent }}>
                      <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
                        About {biz.name}
                      </h2>
                      <p className={`text-sm leading-[1.9] ${ui.sub}`}>
                        {biz.bio}
                      </p>
                    </div>
                  </section>
                )}

                {isSearchActive && !hasAnyContent && (
                  <div className="mt-16 lg:mt-24 text-center" role="status">
                    <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: accent + '08', boxShadow: `0 0 0 1px ${accent + '15'}` }}>
                      <svg className="w-6 h-6" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <p className={`text-sm font-medium ${ui.sub}`}>No results found</p>
                    <button onClick={clearSearch} className="mt-4 px-5 py-2 text-xs font-semibold tracking-wide rounded-full transition-all duration-300 hover:opacity-80" style={{ backgroundColor: accent + '08', color: accent }}>
                      View All
                    </button>
                  </div>
                )}

                {/* ── SERVICES ── */}
                {showServices && (
                  <section itemScope itemType="https://schema.org/ItemList" aria-label="Services" className="mt-16 lg:mt-24">
                    <meta itemProp="name" content={`${biz.name} Services`} />
                    <meta itemProp="numberOfItems" content={filteredServices.length} />
                    <SectionHeading accent={accent} id="services">Services</SectionHeading>
                    <ServiceList services={filteredServices} selectedId={activeService} onSelect={handleServiceSelect} accent={accent} location={biz.location} theme={theme} />
                  </section>
                )}

                {/* ── PRODUCTS ── */}
                {showProducts && (
                  <section itemScope itemType="https://schema.org/ItemList" aria-label={showServices ? 'Products' : 'Shop'} className="mt-16 lg:mt-24">
                    <meta itemProp="name" content={`${biz.name} Products`} />
                    <meta itemProp="numberOfItems" content={filteredProducts.length} />
                    <SectionHeading accent={accent} id="products">{showServices ? 'Products' : 'Shop'}</SectionHeading>
                    <ProductList products={filteredProducts} selectedProducts={activeProducts} onSelect={handleProductSelect} accent={accent} label={showServices ? 'Products' : 'Shop'} location={biz.location} theme={theme} />
                  </section>
                )}

                {/* ── FOOD ── */}
                {showFood && (
                  <section itemScope itemType="https://schema.org/ItemList" aria-label="Menu" className="mt-16 lg:mt-24">
                    <meta itemProp="name" content={`${biz.name} Menu`} />
                    <meta itemProp="numberOfItems" content={filteredFood.length} />
                    <SectionHeading accent={accent} id="menu">Menu</SectionHeading>
                    <FoodList food={filteredFood} selectedFood={activeFood} foodVariants={getCart().foodVariants || {}} onSelect={handleFoodSelect} accent={accent} location={biz.location} theme={theme} />
                  </section>
                )}

                {/* ── CARS ── */}
                {showCars && (
                  <section itemScope itemType="https://schema.org/ItemList" aria-label="Vehicles" className="mt-16 lg:mt-24">
                    <meta itemProp="name" content={`${biz.name} Vehicles`} />
                    <meta itemProp="numberOfItems" content={filteredCars.length} />
                    <SectionHeading accent={accent} id="vehicles">Vehicles</SectionHeading>
                    <CarList cars={filteredCars} selectedCar={activeCar ? biz.cars.find(c => c.id === activeCar) : null} onSelect={handleCarSelect} accent={accent} location={biz.location} theme={theme} />
                  </section>
                )}

                {showSecondaryAd && (
                  <div className="mt-16 lg:mt-24">
                    <div className="rounded-2xl p-6 lg:p-8 flex flex-col items-center" style={{ backgroundColor: accent + '08', borderColor: accent + '15', borderWidth: '1px' }}>
                      <span className="text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold text-center block" style={{ color: accent }}>Sponsored</span>
                      <GoogleAd slot={AD_SLOT_SECONDARY} className="w-full max-w-md" />
                    </div>
                  </div>
                )}

                {/* ── FAQ ── */}
                <section className="mt-16 lg:mt-24" aria-label="Frequently Asked Questions">
                  <SectionHeading accent={accent} id="faq">FAQs</SectionHeading>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="rounded-2xl transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5"
                        style={{ backgroundColor: accent }}
                      >
                        <div className="p-5 md:p-6">
                          <div className="flex items-start gap-4">
                            <span 
                              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5" 
                              style={{ backgroundColor: faqBadge, color: '#fff' }}
                            >
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold mb-2.5" style={{ color: faqQ }}>
                                {faq.q}
                              </h3>
                              <p className="text-sm leading-relaxed" style={{ color: faqA }}>
                                {faq.a}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {showFooterAd && (
                  <div className="mt-16 lg:mt-24 pt-16" style={{ borderTop: `1px solid ${accent + '15'}` }}>
                    <div className="rounded-2xl p-6 lg:p-8 flex flex-col items-center" style={{ backgroundColor: accent + '08', borderColor: accent + '15', borderWidth: '1px' }}>
                      <span className="text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold text-center block" style={{ color: accent }}>Sponsored</span>
                      <GoogleAd slot={AD_SLOT_FOOTER} className="w-full max-w-md mx-auto" />
                    </div>
                  </div>
                )}

                {/* ── FOOTER ── */}
                <footer className="mt-16 lg:mt-24 pt-10" style={{ borderTop: `1px solid ${accent + '15'}` }}>
                  <div className="flex flex-col items-center text-center">
                    
                    <ReferralLink slug={biz.slug} accent={accent} />

                    <nav className="flex items-center gap-2 mb-8" aria-label="Legal links">
                      <a href="/privacy" className="px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 rounded-full" style={{ color: accent, backgroundColor: accent + '08' }}>
                        Privacy
                      </a>
                      <a href="/terms" className="px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 rounded-full" style={{ color: accent, backgroundColor: accent + '08' }}>
                        Terms
                      </a>
                    </nav>

                    <div className="flex items-center gap-6">
                      <span className="text-[10px] uppercase tracking-widest flex items-center gap-2 font-semibold" style={{ color: accent }}>
                        Secured by Paystack
                      </span>
                      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: accent }}>
                        Powered by BookNaija
                      </span>
                    </div>
                  </div>
                </footer>

              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}