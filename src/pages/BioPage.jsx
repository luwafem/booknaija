import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import BookingForm from '../components/BookingForm';
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
    <div className={`w-full flex justify-center overflow-hidden ${className}`}>
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

const ReferralLink = ({ slug, accent }) => {
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
    <div className="mt-8 mb-4 px-4">
      <div className="flex flex-col items-center justify-center gap-3">
        <span className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold">
          Share your link <br /> Refer 3 friends = 1 Free Month
        </span>
        <button
          onClick={handleCopy}
          className="group relative flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
        >
          <span className="text-xs text-stone-400 font-medium truncate max-w-[180px] group-hover:text-stone-200 transition-colors">
            {referralUrl.replace(/^https?:\/\//, '')}
          </span>
          <div className="h-4 w-px bg-white/10" />
          <span 
            className="text-[11px] font-semibold transition-colors"
            style={{ color: copied ? accent : '#a8a29e' }}
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
  const ref = params.get('reference') || params.get('trxref');
  const codeParam = params.get('code') || '';

  const { business: biz, loading, error } = useBusiness(slug);

  const [searchQuery, setSearchQuery] = useState(codeParam);
  const [isSearchActive, setIsSearchActive] = useState(!!codeParam);
  
  const [selectedId, setSelectedId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductVariants, setSelectedProductVariants] = useState({});
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedFoodVariants, setSelectedFoodVariants] = useState({});
  const [selectedCar, setSelectedCar] = useState(null);
  
  const formRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const scrollToForm = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const el = formRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isVisible = rect.top >= 0 && rect.bottom <= windowHeight;
        if (!isVisible) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // FIXED: Added optional chaining (?.) to prevent null crash during initial load
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-stone-700 border-t-stone-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!biz || !biz.active) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 mx-auto mb-4 flex items-center justify-center text-stone-600 text-xl">!</div>
          <p className="text-stone-500 text-sm font-medium">Page Unavailable</p>
          <p className="text-stone-700 text-xs mt-1">This link is currently inactive.</p>
        </div>
      </div>
    );
  }

  if (ref) {
    return (
      <BookingForm 
        biz={biz} 
        selectedId="" 
        selectedProducts={[]} 
        onDeselect={() => {}} 
        onProductDeselect={() => {}} 
        reference={ref} 
      />
    );
  }

  const accent = biz.accent || '#c8a97e';
  const showServices = biz.servicesEnabled && filteredServices.length > 0;
  const showProducts = biz.productsEnabled && filteredProducts.length > 0;
  const showFood = biz.foodEnabled && filteredFood.length > 0;
  const showCars = biz.carsEnabled && filteredCars.length > 0;
  
  // UPDATED: Better ad-to-content ratio logic
  const adsEnabled = biz.adsEnabled !== false;
  const totalItems = filteredServices.length + filteredProducts.length + filteredFood.length + filteredCars.length;
  const hasAnyContent = showServices || showProducts || showFood || showCars;
  
  // Only show primary ad if enabled, has content, and not searching
  const showPrimaryAd = adsEnabled && hasAnyContent && !isSearchActive;
  // Only show secondary ad if enabled, has content, AND at least 6 items (so it stays far away from primary ad)
  const showSecondaryAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 6;
  // Footer ad shows if enabled, has content, and at least 4 items
  const showFooterAd = adsEnabled && hasAnyContent && !isSearchActive && totalItems >= 4;

  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  let heroImages = [];
  if (isGrouped) {
    heroImages = biz.gallery.flatMap(function(g) { return g.images; }).slice(0, 4);
  } else if (biz.gallery) {
    heroImages = biz.gallery.slice(0, 4);
  }

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

  function handleServiceSelect(id) {
    setSelectedId(function(prev) {
      if (prev !== id) scrollToForm();
      return prev === id ? '' : id;
    });
    setSelectedProducts([]);
    setSelectedFood([]);
    setSelectedCar(null);
  }

  function handleProductSelect(id, size, color) {
    setSelectedId('');
    setSelectedFood([]);
    setSelectedCar(null);
    var isAdding = !selectedProducts.includes(id);
    
    setSelectedProducts(function(prev) {
      if (prev.includes(id)) return prev.filter(function(p) { return p !== id; });
      return prev.concat([id]);
    });

    if (isAdding && (size || color)) {
      setSelectedProductVariants(function(prev) {
        var next = Object.assign({}, prev);
        next[id] = { size: size, color: color };
        return next;
      });
    } else if (!isAdding) {
      setSelectedProductVariants(function(prev) {
        var next = Object.assign({}, prev);
        delete next[id];
        return next;
      });
    }

    if (isAdding) scrollToForm();
  }

  function handleFoodSelect(id, variant) {
    setSelectedId('');
    setSelectedProducts([]);
    setSelectedCar(null);
    var exists = selectedFood.includes(id);
    
    if (exists) {
      setSelectedFoodVariants(function(prev) {
        var next = Object.assign({}, prev);
        next[id] = variant;
        return next;
      });
    } else {
      setSelectedFood(function(prev) { return prev.concat([id]); });
      setSelectedFoodVariants(function(prev) {
        var next = Object.assign({}, prev);
        next[id] = variant;
        return next;
      });
    }
    scrollToForm();
  }

  function handleProductDeselect(id) {
    if (id === 'all') {
      setSelectedProducts([]);
      setSelectedProductVariants({});
    } else {
      setSelectedProducts(function(prev) { return prev.filter(function(p) { return p !== id; }); });
      setSelectedProductVariants(function(prev) {
        var next = Object.assign({}, prev);
        delete next[id];
        return next;
      });
    }
  }

  function handleFoodDeselect(id) {
    if (id === 'all') {
      setSelectedFood([]);
      setSelectedFoodVariants({});
    } else {
      setSelectedFood(function(prev) { return prev.filter(function(f) { return f !== id; }); });
      setSelectedFoodVariants(function(prev) {
        var next = Object.assign({}, prev);
        delete next[id];
        return next;
      });
    }
  }

  function handleCarSelect(car) {
    setSelectedId('');
    setSelectedProducts([]);
    setSelectedFood([]);
    setSelectedCar(car);
    scrollToForm();
  }

  function handleCarDeselect() {
    setSelectedCar(null);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      <div className="max-w-lg mx-auto">

        <HeroSection biz={{ logo: biz.logo, name: biz.name, slug: biz.slug, tagline: biz.tagline, bio: biz.bio, phone: biz.phone, whatsapp: biz.whatsapp, location: biz.location, hours: biz.hours, accent: biz.accent, avatar: biz.avatar, hero: biz.hero, gallery: biz.gallery, socials: biz.socials }} />

        {biz.gallery && biz.gallery.length > 0 && (
          <Gallery gallery={biz.gallery} accent={accent} />
        )}

        <div className="px-6 mt-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, or description..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-white/30 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
          
          {isSearchActive && searchQuery && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-stone-500">
                Showing results for "{searchQuery}"
              </p>
              <button
                onClick={clearSearch}
                className="text-[11px] text-stone-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="mx-6 mt-6 border-t border-white/[0.04]" />

        {showPrimaryAd && (
          <div className="mx-6 mt-6">
            <div className="rounded-xl bg-stone-900/50 border border-white/5 p-4 flex flex-col items-center">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-2 font-semibold">Sponsored</span>
              <GoogleAd slot={AD_SLOT_PRIMARY} />
            </div>
          </div>
        )}

        {isSearchActive && !hasAnyContent && (
          <div className="px-6 mt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-stone-400 text-sm font-medium">No results found</p>
            <p className="text-stone-600 text-xs mt-1">Try a different search term</p>
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              View all items
            </button>
          </div>
        )}

        {showServices && (
          <ServiceList
            services={filteredServices}
            selectedId={selectedId}
            onSelect={handleServiceSelect}
            accent={accent}
          />
        )}

        {showProducts && (
          <ProductList
            products={filteredProducts}
            selectedProducts={selectedProducts}
            onSelect={handleProductSelect}
            accent={accent}
            label={showServices ? 'Products' : 'Shop'}
          />
        )}

        {showFood && (
          <FoodList
            food={filteredFood}
            selectedFood={selectedFood}
            foodVariants={selectedFoodVariants}
            onSelect={handleFoodSelect}
            accent={accent}
          />
        )}

        {showCars && (
          <CarList
            cars={filteredCars}
            selectedCar={selectedCar}
            onSelect={handleCarSelect}
            accent={accent}
          />
        )}

        {showSecondaryAd && (
          <div className="mx-6 mt-8 mb-6">
            <div className="rounded-xl bg-stone-900/50 border border-white/5 p-4 flex flex-col items-center">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-2 font-semibold">Sponsored</span>
              <GoogleAd slot={AD_SLOT_SECONDARY} />
            </div>
          </div>
        )}

        <div ref={formRef} className="px-6 mt-8 scroll-mt-4">
          <BookingForm
            biz={biz}
            selectedId={selectedId}
            selectedProducts={selectedProducts}
            productVariants={selectedProductVariants}
            selectedFood={selectedFood}
            foodVariants={selectedFoodVariants}
            onDeselect={function() { setSelectedId(''); }}
            onProductDeselect={handleProductDeselect}
            onFoodDeselect={handleFoodDeselect}
            selectedCar={selectedCar}
            onCarDeselect={handleCarDeselect}
          />
        </div>

        {showFooterAd && (
          <div className="mt-8 border-t border-white/[0.04] pt-6">
            <GoogleAd slot={AD_SLOT_FOOTER} />
          </div>
        )}

        <div className="px-6 pt-12 pb-8 text-center">
          <ReferralLink slug={biz.slug} accent={accent} />
          <a 
            href={"/dashboard/" + biz.slug} 
            className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-300 transition-colors mb-4"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-1.756.426-1.756 2.924 0 3.35a1.724 1.724 0 00-2.573 1.066c-.94 1.543.826 3.31-2.37 2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c1.756-.426 1.756-2.924 0-3.35a1.724 1.724 0 002.573-1.066c.94-1.543-.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Business
          </a>

          <nav className="flex justify-center gap-6 mb-6">
            <a href="/privacy" className="text-[11px] text-stone-500 hover:text-stone-300 underline decoration-stone-700 hover:decoration-stone-500 underline-offset-4 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-[11px] text-stone-500 hover:text-stone-300 underline decoration-stone-700 hover:decoration-stone-500 underline-offset-4 transition-colors">
              Terms of Service
            </a>
          </nav> 
          
          <p className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold">
            Secured by Paystack
          </p> 
        </div>
      </div>
    </div>
  );
}