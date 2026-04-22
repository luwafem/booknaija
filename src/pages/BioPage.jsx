import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import businesses from '../data/businesses';
import BookingForm from '../components/BookingForm';
import HeroSection from '../components/bio/HeroSection';
import Gallery from '../components/bio/Gallery';
import ServiceList from '../components/bio/ServiceList';
import ProductList from '../components/bio/ProductList';

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
const ReferralLink = ({ slug }) => {
  const [copied, setCopied] = useState(false); 
  
  const referralUrl = `${window.location.origin}/signup?ref=${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset feedback after 2s
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="mx-6 mt-4 md:mt-6">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white/5 border border-white/5 p-3 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
             <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l-4 4a4 4 0 005.656 5.656l1.1 1.1" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">Referral Link</p>
            <div className="flex items-center gap-2 text-sm">
               <span className="text-stone-300 truncate max-w-[200px]">
                 {referralUrl}
               </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-stone-300 hover:text-white whitespace-nowrap flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg"
        >
          {copied ? (
             <>
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
               </svg>
               <span>Copied!</span>
             </>
          ) : (
             <>
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 00-2-2V7a2 2 0 002 2v2M4 6H2v12a2 2 0 012-2H6a2 2 0 002-2v2M12 12h6" />
               </svg>
               <span>Copy</span>
             </>
          )}
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
  // NEW: State for Product Variants (Size & Color)
  const [selectedProductVariants, setSelectedProductVariants] = useState({});
  
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
        
        // Check if the form is already mostly visible in the viewport
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
  
  // --- ADSENSE POLICY COMPLIANCE LOGIC ---
  
  // 1. General Ad Enabled Check
  const adsEnabled = biz.adsEnabled !== false;
  
  // 2. Content Density Check (Prevent "Ad Cramming")
  const totalItems = (biz.services?.length || 0) + (biz.products?.length || 0);
  const hasEnoughContent = totalItems >= 4;
  const hasAnyContent = showServices || showProducts;

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

  // Toggle single service: clears any selected products
  function handleServiceSelect(id) {
    setSelectedId((prev) => {
      // Only trigger scroll if we are selecting something new (or toggling on)
      if (prev !== id) {
        scrollToForm();
      }
      return prev === id ? '' : id;
    });
    setSelectedProducts([]); // Empty product cart
  }

  // Toggle multiple products: clears selected service
  // UPDATED: Now handles Size and Color
  function handleProductSelect(id, size, color) {
    setSelectedId(''); // Empty service selection
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
            productVariants={selectedProductVariants} // NEW: Pass variant data
            onDeselect={() => setSelectedId('')}
            onProductDeselect={(id) => id === 'all' 
              ? (setSelectedProducts([]), setSelectedProductVariants({})) // NEW: Clear all variants
              : (setSelectedProducts(prev => prev.filter(p => p !== id)), setSelectedProductVariants(prev => { // NEW: Clear single variant
                  const next = { ...prev }; 
                  delete next[id]; 
                  return next; 
                }))
            }
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
          <ReferralLink slug={biz.slug} />

          <nav className="flex justify-center gap-6 mb-6">
            <a href="/privacy" className="text-[11px] text-stone-500 hover:text-stone-300 underline decoration-stone-700 hover:decoration-stone-500 underline-offset-4 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-[11px] text-stone-500 hover:text-stone-300 underline decoration-stone-700 hover:decoration-stone-500 underline-offset-4 transition-colors">
              Terms of Service
            </a>
          </nav>
          
          <p className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold">
            Secured by Paystack · Funds go directly to {biz.name}
          </p>
        </div>
        {/* ----------------------------------- */}
      </div>
    </div>
  );
}