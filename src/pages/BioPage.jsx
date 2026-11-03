// src/pages/BioPage.jsx
import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBusinessWithSEO } from '../hooks/useBusinessWithSEO';
import { usePaginatedItems } from '../hooks/usePaginatedItems';
import { useLocalAds } from '../hooks/useLocalAds';   // 👈 NEW
import SEO from '../hooks/useSEO';
// 👇 LAYOUT_MAP is used to check whether the resolved layout is a
// property-template so we can pick the right props branch. It's NOT
// used for the ad logic anymore — each layout handles its own ad slots.
import { getLayoutComponent, LAYOUT_MAP } from '../data/layouts';

// 👇 REMOVED: inline GoogleAd, ReferralLink, SectionHeading, useRef.
// 👇 REMOVED: StickyAd + AD_SLOT_STICKY_MOBILE imports.
//    Reason: DefaultLayout already renders <StickyAd> internally, and
//    the previous comment claiming StickyAd "self-dedupes" was wrong —
//    `dismissed` is component-local state, so two instances render two
//    stacked banners. Rendering it here caused a double-sticky bug on
//    every Default-layout page. The property templates also render their
//    own <StickyAd>, so both branches are covered without BioPage's help.

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

  // ─── LOCAL ADS ───────────────────────────────────────────────
  // Fetches active partner ads matching this business's type. The
  // hook caches per businessType for 5 min (same TTL as the server's
  // Cache-Control header on get-local-ads.cjs), so navigating between
  // pages of the same type doesn't refetch.
  //
  // When biz is still loading, biz?.businessType is undefined and the
  // hook is called with '' — which returns only 'all'-targeted ads.
  // That's harmless: DefaultLayout won't render anything because
  // `loading` short-circuits below. Once biz resolves, the hook
  // re-runs with the real businessType and picks up type-targeted ads.
  const { ads: localAds } = useLocalAds(biz?.businessType || '');

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

  // Get the layout component from the map (handles fallback internally)
  const LayoutComponent = getLayoutComponent(businessType, template);

  // Decide the props branch by comparing against the ACTUAL resolved
  // component, not by guessing from business type. A non-property
  // business with `propertiesEnabled = true` will still get DefaultLayout
  // back from the resolver — this comparison keeps the props correct.
  const usePropertyLayout = LayoutComponent === LAYOUT_MAP.property.default;

  // ─── Ad gating for DefaultLayout ────────────────────────────
  // These three flags are the SINGLE SOURCE OF TRUTH for the Default
  // layout's ad visibility. Previously DefaultLayout *also* computed its
  // own `adsEnabled` from `biz.adsEnabled !== false`, which meant two
  // gates that happened to agree today but would drift the moment
  // anyone added a per-slot rule. That local computation has now been
  // removed from DefaultLayout — it reads only these three props.
  //
  // Property templates ignore these three props entirely; they compute
  // their own `adsEnabled` internally and render their own slots.
  const adsAllowedForBusiness = biz.adsEnabled !== false && !usePropertyLayout;
  const totalItems = isSearchActive
    ? filteredServices.length + filteredProducts.length + filteredFood.length + filteredCars.length
    : servicesTotal + productsTotal + foodTotal + carsTotal;
  const hasAnyContent = showServices || showProducts || showFood || showCars;

  const showPrimaryAd = adsAllowedForBusiness && hasAnyContent && !isSearchActive;
  const showSecondaryAd = adsAllowedForBusiness && hasAnyContent && !isSearchActive && totalItems >= 6;
  const showFooterAd = adsAllowedForBusiness && hasAnyContent && !isSearchActive && totalItems >= 4;

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
  //
  // Both branches render their own <StickyAd> internally:
  //   • DefaultLayout  — has <StickyAd> at its root
  //   • Property layouts (PropertyLayout, EstateoLayout, HavenlyLayout)
  //     — each has <StickyAd> at its root
  //
  // BioPage deliberately does NOT render a <StickyAd> of its own.
  // An earlier version did, as a "fallback", but StickyAd's `dismissed`
  // flag is component-local state, so two instances stacked instead of
  // deduplicating. That produced a visible double-banner on mobile and
  // risked an AdSense policy flag for multiple sticky units.
  //
  if (usePropertyLayout) {
    // Property layout – pass property‑specific handler.
    // No `localAds` here: property templates don't render a partner
    // banner (they only render AdSense slots). If you later want
    // local ads on property pages, add a <LocalAdBanner> call to
    // PropertyLayout / EstateoLayout / HavenlyLayout and thread
    // `localAds` through `commonProps` here.
    return (
      <LayoutComponent
        {...commonProps}
        onSelectProperty={handlePropertySelect}
      />
    );
  }

  // Default (non‑property) layout – pass all the handlers and data.
  // 👇 NEW: `localAds` is threaded through so DefaultLayout can render
  //    <LocalAdBanner> between the search bar and the accent divider.
  return (
    <LayoutComponent
      {...commonProps}
      ui={ui}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
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
      localAds={localAds}                         // 👈 NEW
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