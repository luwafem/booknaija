import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import businesses from '../data/businesses';
import BookingForm from '../components/BookingForm';
import HeroSection from '../components/bio/HeroSection';
import Gallery from '../components/bio/Gallery';
import ServiceList from '../components/bio/ServiceList';
import ProductList from '../components/bio/ProductList';

export default function BioPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const ref = params.get('reference') || params.get('trxref');
  const biz = businesses[slug];

  // State for single Service selection
  const [selectedId, setSelectedId] = useState('');
  // State for multiple Product selection (Array of IDs)
  const [selectedProducts, setSelectedProducts] = useState([]);
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
  function handleProductSelect(id) {
    setSelectedId(''); // Empty service selection
    const isAdding = !selectedProducts.includes(id);
    
    setSelectedProducts((prev) => {
      if (prev.includes(id)) return prev.filter(p => p !== id); // Remove
      return [...prev, id]; // Add
    });

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

        {biz.gallery?.length > 0 && (
          <Gallery gallery={biz.gallery} accent={accent} />
        )}

        <div className="mx-6 mt-12 border-t border-white/[0.04]" />

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

        <div ref={formRef} className="px-6 mt-8 scroll-mt-4">
          <BookingForm
            biz={biz}
            selectedId={selectedId}
            selectedProducts={selectedProducts}
            onDeselect={() => setSelectedId('')}
            onProductDeselect={(id) => id === 'all' 
              ? setSelectedProducts([]) 
              : setSelectedProducts(prev => prev.filter(p => p !== id))
            }
          />
        </div>

        <div className="px-6 pt-12 text-center">
          <p className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold">
            Secured by Paystack · Funds go directly to {biz.name}
          </p>
        </div>
      </div>
    </div>
  );
}