import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import businesses from '../data/businesses';
import BookingForm from '../components/BookingForm';
import HeroSection from '../components/bio/HeroSection';
import Gallery from '../components/bio/Gallery';
import ServiceList from '../components/bio/ServiceList';
import ProductList from '../components/bio/ProductList';
import FoodList from '../components/bio/FoodList'; // NEW: Import FoodList

// --- ADSENSE CONFIGURATION (GLOBAL) ---
// IMPORTANT: Replace these with your actual IDs from Google AdSense
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // Your Publisher ID
const AD_SLOT_PRIMARY = '1234567890';             // Your "Top/Bridge" Ad Unit ID
const AD_SLOT_SECONDARY = '1111111111';           // Your "Pre-Booking" Ad Unit ID
const AD_SLOT_FOOTER = '0987654321';              // Your "Footer" Ad Unit ID

// --- GOOGLE ADSENSE COMPONENT ---
const GoogleAd = ({ slot, className = '' }) => {
  useEffect(() => {
    // 1. Load AdSense script if not present
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    } else {
      // 2. Push ad immediately if script exists
      pushAd();
    }

    const pushAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(pushAd, 100);

    return () => clearTimeout(timer);
  }, [slot]);

  return (
    <div className={`w-full flex justify-center overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        // REMOVE 'data-ad-test' when going live to show real ads
        data-ad-test="on"
      ></ins>
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
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="mt-8 mb-4 px-4">
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Label */}
        <span className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold">
          Share your link <br /> Refer 3 friends = 1 Free Month
        </span>

        {/* Interaction Areas */}
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

  // State for single Service selection
  const [selectedId, setSelectedId] = useState('');
  // State for multiple Product selection (Array of IDs)
  const [selectedProducts, setSelectedProducts] = useState([]);
  // State for Product Variants (Size & Color)
  const [selectedProductVariants, setSelectedProductVariants] = useState({});
  
  // NEW: State for Food Selection
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedFoodVariants, setSelectedFoodVariants] = useState({});
  
  const formRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // --- SMART SCROLL LOGIC (Prevents Glitching) ---
  const scrollToForm = () => {
    // Clear any pending scroll from a previous click
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Small delay to allow React to re-render selection state
    scrollTimeoutRef.current = setTimeout(() => {
      const el = formRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Check if form is already mostly visible in viewport
        const isVisible = rect.top >= 0 && rect.bottom <= windowHeight;

        // Only scroll if the form is NOT currently visible
        if (!isVisible) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };
  // -----------------------------

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

  // Paystack redirect -> Let form handle verification alone
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
  // NEW: Check for Food
  const showFood = biz.foodEnabled && biz.food?.length > 0;
  
  // --- ADSENSE POLICY COMPLIANCE LOGIC ---
  
  // 1. General Ad Enabled Check
  const adsEnabled = biz.adsEnabled !== false;
  
  // 2. Content Density Check (Prevent "Ad Cramming")
  // UPDATED: Include food in totalItems count
  const totalItems = (biz.services?.length || 0) + (biz.products?.length || 0) + (biz.food?.length || 0);
  
  // UPDATED: Include food in content check
  const hasAnyContent = showServices || showProducts || showFood;
  
  // FIX: Define hasEnoughContent before using it
  const hasEnoughContent = totalItems >= 4;

  const showAds = adsEnabled && hasAnyContent;
  const showPrimaryAd = showAds; 
  const showSecondaryAd = showAds && hasEnoughContent; 
  const showFooterAd = showAds;

  // FIX: Handle both Flat (legacy) and Grouped (new) gallery structures
  const isGrouped = biz.gallery?.length > 0 && typeof biz.gallery[0] === 'object' && biz.gallery[0].images;
  let heroImages = [];
  if (isGrouped) {
      // Flatten grouped structure to get just image strings
      heroImages = biz.gallery.flatMap(g => g.images).slice(0, 4);
  } else if (biz.gallery) {
      // Use flat structure directly
      heroImages = biz.gallery.slice(0, 4);
  }

  // Toggle single service: clears any selected products AND food
  function handleServiceSelect(id) {
    setSelectedId((prev) => {
      // Only trigger scroll if we are selecting something new (or toggling on)
      if (prev !== id) {
        scrollToForm();
      }
      return prev === id ? '' : id;
    });
    setSelectedProducts([]); // Empty product cart
    setSelectedFood([]);    // NEW: Empty food cart
  }

  // Toggle multiple products: clears selected service AND food
  // UPDATED: Now handles Size and Color
  function handleProductSelect(id, size, color) {
    setSelectedId(''); // Empty service selection
    setSelectedFood([]); // NEW: Empty food selection
    const isAdding = !selectedProducts.includes(id);
    
    // 1. Manage Product IDs (Cart)
    setSelectedProducts((prev) => {
      if (prev.includes(id)) return prev.filter(p => p !== id); // Remove
      return [...prev, id]; // Add
    });

    // 2. Manage Product Variants (Size & Color)
    if (isAdding && (size || color)) {
      setSelectedProductVariants(prev => ({
        ...prev,
        [id]: { size, color } // Save the variant selection
      }));
    } else if (!isAdding) {
      // If removing item, remove variant info too
      setSelectedProductVariants(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }

    // Auto-scroll to form only when adding a new product
    if (isAdding) {
      scrollToForm();
    }
  }

  // NEW: Handler for Food Selection (Addons & Quantity)
  function handleFoodSelect(id, variant) {
    setSelectedId(''); // Clear service
    setSelectedProducts([]); // Clear products
    
    // Check if item already exists
    const exists = selectedFood.includes(id);
    
    if (exists) {
      // If exists, just update the variant (e.g. user changed quantity or addons)
      setSelectedFoodVariants(prev => ({ ...prev, [id]: variant }));
    } else {
      // Add new
      setSelectedFood(prev => [...prev, id]);
      setSelectedFoodVariants(prev => ({ ...prev, [id]: variant }));
    }
    scrollToForm();
  }

  // FIX: Extracted handler for Product Deselect to fix parsing errors
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

  // NEW: Handler for Food Deselect
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      <div className="max-w-lg mx-auto">

        {/* UPDATE: Pass logo prop */}
        <HeroSection biz={{ ...biz, logo: biz.logo }} />

        {/* --- NEW: REFERRAL LINK --- */}
        {/* Moved here based on request */}
        {/* ----------------------------------- */}

        {biz.gallery?.length > 0 && (
          <Gallery gallery={biz.gallery} accent={accent} />
        )}

        <div className="mx-6 mt-12 border-t border-white/[0.04]" />

        {/* --- ADSENSE PLACEMENT 1: THE BRIDGE --- */}
        {showPrimaryAd && (
          <div className="mx-6 mt-6">
            <div className="rounded-xl bg-stone-900/50 border border-white/5 p-4 flex flex-col items-center">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-2 font-semibold">Sponsored</span>
              <GoogleAd slot={AD_SLOT_PRIMARY} />
            </div>
          </div>
        )}
        {/* ------------------------------------ */}

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

        {/* --- NEW: FOOD LIST --- */}
        {showFood && (
          <FoodList
            food={biz.food}
            selectedFood={selectedFood}
            foodVariants={selectedFoodVariants}
            onSelect={handleFoodSelect}
            accent={accent}
          />
        )}

        {/* --- ADSENSE PLACEMENT 2: PRE-BOOKING --- */}
        {showSecondaryAd && (
          <div className="mx-6 mt-8 mb-6">
            <div className="rounded-xl bg-stone-900/50 border border-white/5 p-4 flex flex-col items-center">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-2 font-semibold">Sponsored</span>
              <GoogleAd slot={AD_SLOT_SECONDARY} />
            </div>
          </div>
        )}
        {/* ------------------------------------------ */}

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
          />
        </div>

        {/* --- ADSENSE PLACEMENT 3: FOOTER --- */}
        {showFooterAd && (
          <div className="mt-8 border-t border-white/[0.04] pt-6">
            <GoogleAd slot={AD_SLOT_FOOTER} />
          </div>
        )}
        {/* ----------------------------------- */}

        {/* --- LEGAL & COMPLIANCE FOOTER --- */}
        {/* AdSense requires Privacy Policy and Terms of Service links */}
        <div className="px-6 pt-12 pb-8 text-center">
          {/* MOVED: Referral Link now sits here, above the nav */}
          {/* MOVED: Referral Link now sits here, above the nav */}
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
        {/* ----------------------------------- */}
      </div>
    </div>
  );
}