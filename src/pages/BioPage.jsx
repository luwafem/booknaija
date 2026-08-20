// src/pages/BioPage.jsx
import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useBusinessWithSEO } from '../hooks/useBusinessWithSEO';
import { usePaginatedItems } from '../hooks/usePaginatedItems';
import SEO from '../hooks/useSEO';
import { getLayoutComponent } from '../data/layouts';

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
  const slug = useParams().slug;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get('reference') || params.get('trxref');
  const codeParam = params.get('code') || '';

  // ─── Use the hook with the URL slug ───
  const { 
    business: biz, 
    loading, 
    error, 
    seoDescription, 
    seoImage, 
    structuredData 
  } = useBusinessWithSEO(slug);

  const [searchQuery, setSearchQuery] = useState(codeParam);
  const [isSearchActive, setIsSearchActive] = useState(!!codeParam);

  const [activeService, setActiveService] = useState('');
  const [activeProducts, setActiveProducts] = useState([]);
  const [activeFood, setActiveFood] = useState([]);
  const [activeCar, setActiveCar] = useState(null);

  // ─── Pagination hooks ───
  const ITEMS_PER_PAGE = 12;
  const {
    items: paginatedServices,
    loading: servicesLoading,
    hasMore: servicesHasMore,
    loadMore: loadMoreServices,
    total: servicesTotal,
  } = usePaginatedItems(slug, 'services', ITEMS_PER_PAGE);

  const {
    items: paginatedProducts,
    loading: productsLoading,
    hasMore: productsHasMore,
    loadMore: loadMoreProducts,
    total: productsTotal,
  } = usePaginatedItems(slug, 'products', ITEMS_PER_PAGE);

  const {
    items: paginatedFood,
    loading: foodLoading,
    hasMore: foodHasMore,
    loadMore: loadMoreFood,
    total: foodTotal,
  } = usePaginatedItems(slug, 'food', ITEMS_PER_PAGE);

  const {
    items: paginatedCars,
    loading: carsLoading,
    hasMore: carsHasMore,
    loadMore: loadMoreCars,
    total: carsTotal,
  } = usePaginatedItems(slug, 'cars', ITEMS_PER_PAGE);

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
    return <Navigate to={`/book/${slug}?reference=${ref}`} replace />;
  }

  function getCart() {
    try { return JSON.parse(sessionStorage.getItem(`cart_${slug}`)) || {}; }
    catch { return {}; }
  }

  function saveCart(cart) {
    sessionStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    setActiveService(cart.service || '');
    setActiveProducts(cart.products || []);
    setActiveFood(cart.food || []);
    setActiveCar(cart.car || null);
  }

  // ─── Loading state ───
  if (loading) {
    const accent = '#c8a97e'; // fallback
    const ui = { bg: 'bg-white' }; // fallback
    return (
      <div className={`min-h-screen flex items-center justify-center ${ui.bg}`} role="status">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: accent + '15', borderTopColor: accent }} />
      </div>
    );
  }

  // ─── Guard: if biz is still undefined ───
  if (!biz) {
    const accent = '#c8a97e';
    const ui = { bg: 'bg-white' };
    return (
      <div className={`min-h-screen flex items-center justify-center ${ui.bg}`} role="status">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: accent + '15', borderTopColor: accent }} />
      </div>
    );
  }

  // ─── Now biz is defined ───
  const theme = biz.theme || 'light';
  const isDark = theme === 'dark';
  const accent = biz.accent ?? '#c8a97e';

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

  // ─── Filtered lists (for search) ───
  const filteredProducts = searchQuery
    ? (biz.products || []).filter(p =>
        (p.product_code && p.product_code.toLowerCase() === searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz.products || []);

  const filteredServices = searchQuery
    ? (biz.services || []).filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz.services || []);

  const filteredFood = searchQuery
    ? (biz.food || []).filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz.food || []);

  const filteredCars = searchQuery
    ? (biz.cars || []).filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : (biz.cars || []);

  // Determine which data to display based on search
  const displayServices = isSearchActive ? filteredServices : paginatedServices;
  const displayProducts = isSearchActive ? filteredProducts : paginatedProducts;
  const displayFood = isSearchActive ? filteredFood : paginatedFood;
  const displayCars = isSearchActive ? filteredCars : paginatedCars;

  const showServices = biz.servicesEnabled && (isSearchActive ? filteredServices.length > 0 : paginatedServices.length > 0);
  const showProducts = biz.productsEnabled && (isSearchActive ? filteredProducts.length > 0 : paginatedProducts.length > 0);
  const showFood = biz.foodEnabled && (isSearchActive ? filteredFood.length > 0 : paginatedFood.length > 0);
  const showCars = biz.carsEnabled && (isSearchActive ? filteredCars.length > 0 : paginatedCars.length > 0);

  // ─── Template resolution ──────────────────────────────────────
  const businessType = biz.businessType || '';
  const template = biz.template || 'default';

  // Determine if we should use property layout (Real Estate or Shortlet)
  const isPropertyBusiness = businessType === 'Real Estate' || businessType === 'Shortlet';
  const usePropertyLayout = isPropertyBusiness || biz.propertiesEnabled;

  // Get the layout component from the map (handles fallback internally)
  const LayoutComponent = getLayoutComponent(businessType, template);

  // ─── Ads logic (unchanged) ──────────────────────────────────
  const adsEnabled = biz.adsEnabled !== false && !usePropertyLayout;
  const totalItems = (isSearchActive ? filteredServices.length + filteredProducts.length + filteredFood.length + filteredCars.length : servicesTotal + productsTotal + foodTotal + carsTotal);
  const hasAnyContent = showServices || showProducts || showFood || showCars;

  const showPrimaryAd = adsEnabled && hasAnyContent && !isSearchActive;
  const showSecondaryAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 6;
  const showFooterAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 4;

  // ─── Handlers ────────────────────────────────────────────────
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
    if (hasItems) navigate(`/book/${slug}`);
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
    if (hasItems) navigate(`/book/${slug}`);
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
    if (hasItems) navigate(`/book/${slug}`);
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
    if (hasItems) navigate(`/book/${slug}`);
  }

  function handlePropertySelect(id) {
    const cart = getCart();
    cart.service = ''; cart.products = []; cart.productVariants = {};
    cart.food = []; cart.foodVariants = {}; cart.car = null;
    cart.property = id;
    saveCart(cart);
    navigate(`/book/${slug}`);
  }
  
  const faqs = [
    {
      q: `How do I book with ${biz.name}?`,
      a: showServices 
        ? `Booking an appointment with ${biz.name} is simple. Browse the services listed above, select your preferred option, and you will be directed to a secure checkout page.`
        : showCars 
        ? `Scheduling a rental or viewing with ${biz.name} is easy. Browse the available vehicles, select the one you are interested in, and proceed to secure checkout.`
        : usePropertyLayout
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
      a: `Absolutely. All payments on Five9 are processed securely through Paystack, ensuring your financial information is fully protected. You will receive an instant digital receipt upon successful payment.`
    },
    {
      q: `Can I buy products from ${biz.name} online?`,
      a: showProducts 
        ? `Yes! ${biz.name} offers a selection of products that you can purchase directly through this page. Simply select the items you want and proceed to secure checkout.`
        : usePropertyLayout
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

  // ─── Common props for both layout types ─────────────────────
  const commonProps = {
    biz,
    accent,
    isDark,
  };

  // ─── Render the selected layout ─────────────────────────────
  if (usePropertyLayout) {
    // Property layout – pass property‑specific handler
    return (
      <LayoutComponent
        {...commonProps}
        onSelectProperty={handlePropertySelect}
      />
    );
  }

  // Default (non‑property) layout – pass all the handlers and data
  return (
    <LayoutComponent
      {...commonProps}
      ui={ui}
      searchQuery={searchQuery}
      isSearchActive={isSearchActive}
      activeService={activeService}
      activeProducts={activeProducts}
      activeFood={activeFood}
      activeCar={activeCar}
      handleServiceSelect={handleServiceSelect}
      handleProductSelect={handleProductSelect}
      handleFoodSelect={handleFoodSelect}
      handleCarSelect={handleCarSelect}
      showServices={showServices}
      showProducts={showProducts}
      showFood={showFood}
      showCars={showCars}
      displayServices={displayServices}
      displayProducts={displayProducts}
      displayFood={displayFood}
      displayCars={displayCars}
      servicesHasMore={servicesHasMore}
      loadMoreServices={loadMoreServices}
      servicesLoading={servicesLoading}
      productsHasMore={productsHasMore}
      loadMoreProducts={loadMoreProducts}
      productsLoading={productsLoading}
      foodHasMore={foodHasMore}
      loadMoreFood={loadMoreFood}
      foodLoading={foodLoading}
      carsHasMore={carsHasMore}
      loadMoreCars={loadMoreCars}
      carsLoading={carsLoading}
      showPrimaryAd={showPrimaryAd}
      showSecondaryAd={showSecondaryAd}
      showFooterAd={showFooterAd}
      faqs={faqs}
      faqQ={faqQ}
      faqA={faqA}
      faqBadge={faqBadge}
      handleSearch={handleSearch}
      clearSearch={clearSearch}
      getCart={getCart}
      slug={slug}
    />
  );
}