import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useBusinessWithSEO } from '../hooks/useBusinessWithSEO';
import SEO from '../hooks/useSEO';
// REMOVED: BookingForm import
import HeroSection from '../components/bio/HeroSection';
import Gallery from '../components/bio/Gallery';
import ServiceList from '../components/bio/ServiceList';
import ProductList from '../components/bio/ProductList';
import FoodList from '../components/bio/FoodList';
import CarList from '../components/bio/CarList';

// --- ADSENSE CONFIGURATION (GLOBAL) ---
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
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

const ReferralLink = ({ slug, accent, theme }) => {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${window.location.origin}/signup?ref=${slug}`;
  const isDark = theme === 'dark';

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
    <div className="mt-8 mb-4 px-4">
      <div className="flex flex-col items-center justify-center gap-3">
        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
          Share your link <br /> Refer 3 friends = 1 Free Month
        </span>
        <button
          onClick={handleCopy}
          className={`group relative flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300 ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10' : 'bg-stone-100 border-stone-200 hover:bg-stone-200 hover:border-stone-300'}`}
          aria-label="Copy referral link"
        >
          <span className={`text-xs font-medium truncate max-w-[180px] transition-colors ${isDark ? 'text-stone-400 group-hover:text-stone-200' : 'text-stone-600 group-hover:text-stone-900'}`}>
            {referralUrl.replace(/^https?:\/\//, '')}
          </span>
          <div className={`h-4 w-px ${isDark ? 'bg-white/10' : 'bg-stone-300'}`} aria-hidden="true" />
          <span
            className="text-[11px] font-semibold transition-colors"
            style={{ color: copied ? accent : (isDark ? '#a8a29e' : '#78716c') }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default function BioPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get('reference') || params.get('trxref');
  const codeParam = params.get('code') || '';

  const { business: biz, loading, error, seoDescription, seoImage, structuredData } = useBusinessWithSEO(slug);

  const [searchQuery, setSearchQuery] = useState(codeParam);
  const [isSearchActive, setIsSearchActive] = useState(!!codeParam);

  // ── All selection state REMOVED ──
  // No more: selectedId, selectedProducts, selectedProductVariants,
  //          selectedFood, selectedFoodVariants, selectedCar,
  //          formRef, scrollTimeoutRef, scrollToForm

  useEffect(() => {
    if (!loading && biz?.active) {
      window.dispatchEvent(new Event('prerender-ready'));
    }
  }, [loading, biz]);

  // ── Handle Paystack callback redirect ──
  // Paystack currently redirects to /:slug?reference=xxx
  // We forward to /book/:slug?reference=xxx so BookingForm can verify
  if (ref) {
    return <Navigate to={`/book/${slug}?reference=${ref}`} replace />;
  }

  // ── Search filtering (kept) ──
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

  const theme = biz?.theme || 'light';
  const isDark = theme === 'dark';

  // ── Loading State ──
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'}`} role="status" aria-label="Loading business page">
        <div className="text-center">
          <div className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-stone-700 border-t-stone-400' : 'border-stone-200 border-t-stone-500'}`} aria-hidden="true"></div>
          <p className={`text-sm font-medium ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Inactive/Not Found State ──
  if (!biz || !biz.active) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'}`} role="alert">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl ${isDark ? 'bg-stone-900 border border-stone-800 text-stone-600' : 'bg-white border border-stone-200 text-stone-500'}`} aria-hidden="true">!</div>
          <h1 className={`text-sm font-medium ${isDark ? 'text-stone-500' : 'text-stone-700'}`}>Page Unavailable</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-stone-700' : 'text-stone-500'}`}>This link is currently inactive.</p>
          <a
            href="/"
            className={`inline-block mt-6 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark ? 'text-stone-400 hover:text-white bg-white/5 hover:bg-white/10' : 'text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200'}`}
          >
            Go to BookNaija
          </a>
        </div>
      </div>
    );
  }

  // ── Derived state ──
  const accent = biz.accent || '#c8a97e';
  const showServices = biz.servicesEnabled && filteredServices.length > 0;
  const showProducts = biz.productsEnabled && filteredProducts.length > 0;
  const showFood = biz.foodEnabled && filteredFood.length > 0;
  const showCars = biz.carsEnabled && filteredCars.length > 0;

  const adsEnabled = biz.adsEnabled !== false;
  const totalItems = filteredServices.length + filteredProducts.length + filteredFood.length + filteredCars.length;
  const hasAnyContent = showServices || showProducts || showFood || showCars;

  const showPrimaryAd = adsEnabled && hasAnyContent && !isSearchActive;
  const showSecondaryAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 6;
  const showFooterAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 4;

  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  let heroImages = [];
  if (isGrouped) {
    heroImages = biz.gallery.flatMap(function(g) { return g.images; }).slice(0, 4);
  } else if (biz.gallery) {
    heroImages = biz.gallery.slice(0, 4);
  }

  // ── Search handlers (kept) ──
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchActive(true);
    } else {
      setIsSearchActive(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  // ── NAVIGATION HANDLERS (replace old selection handlers) ──
  function handleServiceSelect(id) {
    navigate(`/book/${slug}?service=${id}`);
  }

  function handleProductSelect(id, size, color) {
    if (size || color) {
      sessionStorage.setItem(`bv_${slug}_product_${id}`, JSON.stringify({ size, color }));
    }
    navigate(`/book/${slug}?product=${id}`);
  }

  function handleFoodSelect(id, variant) {
    if (variant) {
      sessionStorage.setItem(`bv_${slug}_food_${id}`, JSON.stringify(variant));
    }
    navigate(`/book/${slug}?food=${id}`);
  }

  function handleCarSelect(car) {
    navigate(`/book/${slug}?car=${car.id}`);
  }

  // ── RENDER ──
  return (
    <div
      className={`min-h-screen pb-12 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-stone-50 text-stone-900'}`}
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
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

      <div className="max-w-lg mx-auto">

        <HeroSection biz={{
          logo: biz.logo, name: biz.name, slug: biz.slug, tagline: biz.tagline, bio: biz.bio, phone: biz.phone, whatsapp: biz.whatsapp, location: biz.location, hours: biz.hours, accent: biz.accent, avatar: biz.avatar, hero: biz.hero, gallery: biz.gallery, socials: biz.socials, theme: biz.theme
        }} />

        {biz.gallery && biz.gallery.length > 0 && (
          <div itemScope itemType="https://schema.org/ImageGallery" aria-label="Photo gallery">
            <meta itemProp="name" content={`${biz.name} Gallery`} />
            <Gallery
              gallery={biz.gallery}
              accent={accent}
              location={biz.location}
              theme={theme}
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="px-6 mt-6">
          <form onSubmit={handleSearch} className="relative" role="search" aria-label="Search services and products">
            <label htmlFor="business-search" className="sr-only">Search by name, code, or description</label>
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none`} aria-hidden="true">
              <svg className={`w-4 h-4 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="business-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, or description..."
              className={`w-full rounded-xl pl-11 pr-10 py-3 text-sm placeholder-stone-400 focus:outline-none transition-colors ${isDark ? 'bg-white/[0.03] border border-white/10 text-white focus:border-white/30' : 'bg-white border border-stone-200 text-stone-900 focus:border-stone-400'}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${isDark ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-700'}`}
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>

          {isSearchActive && searchQuery && (
            <div className="mt-2 flex items-center justify-between" role="status" aria-live="polite">
              <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                Showing results for "{searchQuery}"
              </p>
              <button
                onClick={clearSearch}
                className={`text-[11px] transition-colors ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className={`mx-6 mt-6 border-t ${isDark ? 'border-white/[0.04]' : 'border-stone-200'}`} aria-hidden="true" />

        {/* ── PRIMARY AD ── */}
        {showPrimaryAd && (
          <div className="mx-6 mt-6">
            <div className={`rounded-xl border p-4 flex flex-col items-center ${isDark ? 'bg-stone-900/50 border-white/5' : 'bg-white border-stone-200'}`}>
              <span className={`text-[10px] uppercase tracking-widest mb-2 font-semibold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Sponsored</span>
              <GoogleAd slot={AD_SLOT_PRIMARY} />
            </div>
          </div>
        )}

        {/* ── NO RESULTS ── */}
        {isSearchActive && !hasAnyContent && (
          <div className="px-6 mt-8 text-center" role="status">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-stone-900 border border-stone-800' : 'bg-stone-100 border border-stone-200'}`} aria-hidden="true">
              <svg className={`w-6 h-6 ${isDark ? 'text-stone-600' : 'text-stone-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-stone-400' : 'text-stone-700'}`}>No results found</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-stone-600' : 'text-stone-500'}`}>Try a different search term</p>
            <button
              onClick={clearSearch}
              className={`mt-4 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark ? 'text-stone-400 hover:text-white bg-white/5 hover:bg-white/10' : 'text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200'}`}
            >
              View all items
            </button>
          </div>
        )}

        {/* ── SERVICE LIST ── Clicking now navigates to booking page */}
        {showServices && (
          <section itemScope itemType="https://schema.org/ItemList" aria-label="Services">
            <meta itemProp="name" content={`${biz.name} Services`} />
            <meta itemProp="numberOfItems" content={filteredServices.length} />
            <ServiceList
              services={filteredServices}
              selectedId=""
              onSelect={handleServiceSelect}
              accent={accent}
              location={biz.location}
              theme={theme}
            />
          </section>
        )}

        {/* ── PRODUCT LIST ── Clicking now navigates to booking page */}
        {showProducts && (
          <section itemScope itemType="https://schema.org/ItemList" aria-label={showServices ? 'Products' : 'Shop'}>
            <meta itemProp="name" content={`${biz.name} Products`} />
            <meta itemProp="numberOfItems" content={filteredProducts.length} />
            <ProductList
              products={filteredProducts}
              selectedProducts={[]}
              onSelect={handleProductSelect}
              accent={accent}
              label={showServices ? 'Products' : 'Shop'}
              location={biz.location}
              theme={theme}
            />
          </section>
        )}

        {/* ── FOOD LIST ── "Add to Order" in modal now navigates to booking page */}
        {showFood && (
          <section itemScope itemType="https://schema.org/ItemList" aria-label="Menu">
            <meta itemProp="name" content={`${biz.name} Menu`} />
            <meta itemProp="numberOfItems" content={filteredFood.length} />
            <FoodList
              food={filteredFood}
              selectedFood={[]}
              foodVariants={{}}
              onSelect={handleFoodSelect}
              accent={accent}
              location={biz.location}
              theme={theme}
            />
          </section>
        )}

        {/* ── CAR LIST ── "Proceed to Book" in modal now navigates to booking page */}
        {showCars && (
          <section itemScope itemType="https://schema.org/ItemList" aria-label="Vehicles">
            <meta itemProp="name" content={`${biz.name} Vehicles`} />
            <meta itemProp="numberOfItems" content={filteredCars.length} />
            <CarList
              cars={filteredCars}
              selectedCar={null}
              onSelect={handleCarSelect}
              accent={accent}
              location={biz.location}
              theme={theme}
            />
          </section>
        )}

        {/* ── SECONDARY AD ── */}
        {showSecondaryAd && (
          <div className="mx-6 mt-8 mb-6">
            <div className={`rounded-xl border p-4 flex flex-col items-center ${isDark ? 'bg-stone-900/50 border-white/5' : 'bg-white border-stone-200'}`}>
              <span className={`text-[10px] uppercase tracking-widest mb-2 font-semibold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Sponsored</span>
              <GoogleAd slot={AD_SLOT_SECONDARY} />
            </div>
          </div>
        )}

        {/* ── BOOKING FORM SECTION REMOVED ── */}
        {/* Users now click items above → they get navigated to /book/:slug */}

        {/* ── FOOTER AD ── */}
        {showFooterAd && (
          <div className={`mt-8 border-t pt-6 ${isDark ? 'border-white/[0.04]' : 'border-stone-200'}`}>
            <GoogleAd slot={AD_SLOT_FOOTER} />
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="px-6 pt-12 pb-8 text-center">
          <ReferralLink slug={biz.slug} accent={accent} theme={theme} />

          <nav className="flex justify-center gap-6 mb-6" aria-label="Legal links">
            <a href="/privacy" className={`text-[11px] underline underline-offset-4 transition-colors ${isDark ? 'text-stone-500 hover:text-stone-300 decoration-stone-700 hover:decoration-stone-500' : 'text-stone-600 hover:text-stone-900 decoration-stone-300 hover:decoration-stone-500'}`}>
              Privacy Policy
            </a>
            <a href="/terms" className={`text-[11px] underline underline-offset-4 transition-colors ${isDark ? 'text-stone-500 hover:text-stone-300 decoration-stone-700 hover:decoration-stone-500' : 'text-stone-600 hover:text-stone-900 decoration-stone-300 hover:decoration-stone-500'}`}>
              Terms of Service
            </a>
          </nav>

          <p className={`text-[11px] uppercase tracking-widest font-semibold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
            Secured by Paystack
          </p>
        </footer>
      </div>
    </div>
  );
}