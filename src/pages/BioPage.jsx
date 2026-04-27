import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import businesses from '../data/businesses';
import BookingForm from '../components/BookingForm';
import HeroSection from '../components/bio/HeroSection';
import Gallery from '../components/bio/Gallery';
import ServiceList from '../components/bio/ServiceList';
import ProductList from '../components/bio/ProductList';
import FoodList from '../components/bio/FoodList'; 
import CarList from '../components/bio/CarList';

// --- ADSENSE CONFIGURATION (GLOBAL) ---
// IMPORTANT: Replace these with your actual IDs from Google AdSense
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
const AD_SLOT_PRIMARY = '1234567890';
const AD_SLOT_SECONDARY = '1111111111';
const AD_SLOT_FOOTER = '0987654321';

// --- Track if AdSense script has been loaded globally ---
let adsenseScriptLoaded = false;
let adsenseScriptLoading = false;

// --- GOOGLE ADSENSE COMPONENT (IMPROVED) ---
const GoogleAd = ({ slot, className = '' }) => {
  const adRef = useRef(null);
  const hasPushed = useRef(false);

  useEffect(() => {
    // Prevent duplicate pushes for same slot
    if (hasPushed.current) return;
    hasPushed.current = true;

    const pushAd = () => {
      if (!adRef.current) return;
      
      try {
        // Only push if adsbygoogle is available (not blocked)
        if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
          window.adsbygoogle.push({});
        }
      } catch (e) {
        // Silently fail - ad blockers or invalid slots cause this
      }
    };

    // If script already loaded, just push the ad
    if (adsenseScriptLoaded) {
      const timer = setTimeout(pushAd, 150);
      return () => clearTimeout(timer);
    }

    // If script is currently loading, wait for it
    if (adsenseScriptLoading) {
      // Poll until loaded (max 2 seconds)
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (adsenseScriptLoaded || attempts > 20) {
          clearInterval(interval);
          if (adsenseScriptLoaded) {
            pushAd();
          }
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Load the script
    adsenseScriptLoading = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

    script.onload = () => {
      adsenseScriptLoaded = true;
      adsenseScriptLoading = false;
      const timer = setTimeout(pushAd, 100);
      // Store cleanup for the timer
      script._timerCleanup = () => clearTimeout(timer);
    };

    // ✅ SILENTLY handle ad blocker blocking - no console error
    script.onerror = () => {
      adsenseScriptLoading = false;
      // Do nothing - ad blocker blocked the request, this is expected
    };

    document.head.appendChild(script);

    return () => {
      if (script._timerCleanup) {
        script._timerCleanup();
      }
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
        // REMOVE 'data-ad-test' when going live to show real ads
        data-ad-test="on"
      />
    </div>
  );
};

// --- REFERRAL LINK COMPONENT ---
const ReferralLink = ({ slug, accent }) => {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${window.location.origin}/signup?ref=${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
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
  const biz = businesses[slug];

  const [selectedId, setSelectedId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductVariants, setSelectedProductVariants] = useState({});
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedFoodVariants, setSelectedFoodVariants] = useState({});
  const [selectedCar, setSelectedCar] = useState(null);
  
  const formRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const scrollToForm = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const el = formRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isVisible = rect.top >= 0 && rect.bottom <= windowHeight;

        if (!isVisible) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

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
  const showServices = biz.servicesEnabled && biz.services?.length > 0;
  const showProducts = biz.productsEnabled && biz.products?.length > 0;
  const showFood = biz.foodEnabled && biz.food?.length > 0;
  const showCars = biz.carsEnabled && biz.cars?.length > 0;
  
  // AdSense policy compliance
  const adsEnabled = biz.adsEnabled !== false;
  const totalItems = (biz.services?.length || 0) + (biz.products?.length || 0) + (biz.food?.length || 0) + (biz.cars?.length || 0);
  const hasAnyContent = showServices || showProducts || showFood || showCars;
  const hasEnoughContent = totalItems >= 4;

  const showAds = adsEnabled && hasAnyContent;
  const showPrimaryAd = showAds;
  const showSecondaryAd = showAds && hasEnoughContent;
  const showFooterAd = showAds;

  // Handle both Flat and Grouped gallery structures
  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  let heroImages = [];
  if (isGrouped) {
    heroImages = biz.gallery.flatMap(g => g.images).slice(0, 4);
  } else if (biz.gallery) {
    heroImages = biz.gallery.slice(0, 4);
  }

  function handleServiceSelect(id) {
    setSelectedId((prev) => {
      if (prev !== id) {
        scrollToForm();
      }
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
    const isAdding = !selectedProducts.includes(id);
    
    setSelectedProducts((prev) => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      return [...prev, id];
    });

    if (isAdding && (size || color)) {
      setSelectedProductVariants(prev => ({
        ...prev,
        [id]: { size, color }
      }));
    } else if (!isAdding) {
      setSelectedProductVariants(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }

    if (isAdding) {
      scrollToForm();
    }
  }

  function handleFoodSelect(id, variant) {
    setSelectedId('');
    setSelectedProducts([]);
    setSelectedCar(null);
    
    const exists = selectedFood.includes(id);
    
    if (exists) {
      setSelectedFoodVariants(prev => ({ ...prev, [id]: variant }));
    } else {
      setSelectedFood(prev => [...prev, id]);
      setSelectedFoodVariants(prev => ({ ...prev, [id]: variant }));
    }
    scrollToForm();
  }

  function handleProductDeselect(id) {
    if (id === 'all') {
      setSelectedProducts([]);
      setSelectedProductVariants({});
    } else {
      setSelectedProducts(prev => prev.filter(p => p !== id));
      setSelectedProductVariants(prev => { 
        const next = { ...prev }; 
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
      setSelectedFood(prev => prev.filter(f => f !== id));
      setSelectedFoodVariants(prev => {
        const next = { ...prev };
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

        <HeroSection biz={{ ...biz, logo: biz.logo }} />

        {biz.gallery?.length > 0 && (
          <Gallery gallery={biz.gallery} accent={accent} />
        )}

        <div className="mx-6 mt-12 border-t border-white/[0.04]" />

        {/* AD PLACEMENT 1: THE BRIDGE */}
        {showPrimaryAd && (
          <div className="mx-6 mt-6">
            <div className="rounded-xl bg-stone-900/50 border border-white/5 p-4 flex flex-col items-center">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-2 font-semibold">Sponsored</span>
              <GoogleAd slot={AD_SLOT_PRIMARY} />
            </div>
          </div>
        )}

        {showServices && (
          <ServiceList
            services={biz.services}
            selectedId={selectedId}
            onSelect={handleServiceSelect}
            accent={accent}
          />
        )}

        {showProducts && (
          <ProductList
            products={biz.products}
            selectedProducts={selectedProducts}
            onSelect={handleProductSelect}
            accent={accent}
            label={showServices ? 'Products' : 'Shop'}
          />
        )}

        {showFood && (
          <FoodList
            food={biz.food}
            selectedFood={selectedFood}
            foodVariants={selectedFoodVariants}
            onSelect={handleFoodSelect}
            accent={accent}
          />
        )}

        {showCars && (
          <CarList
            cars={biz.cars}
            selectedCar={selectedCar}
            onSelect={handleCarSelect}
            accent={accent}
          />
        )}

        {/* AD PLACEMENT 2: PRE-BOOKING */}
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
            onDeselect={() => setSelectedId('')}
            onProductDeselect={handleProductDeselect}
            onFoodDeselect={handleFoodDeselect}
            selectedCar={selectedCar}
            onCarDeselect={handleCarDeselect}
          />
        </div>

        {/* AD PLACEMENT 3: FOOTER */}
        {showFooterAd && (
          <div className="mt-8 border-t border-white/[0.04] pt-6">
            <GoogleAd slot={AD_SLOT_FOOTER} />
          </div>
        )}

        {/* LEGAL & COMPLIANCE FOOTER */}
        <div className="px-6 pt-12 pb-8 text-center">
          <ReferralLink slug={biz.slug} accent={accent} />

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