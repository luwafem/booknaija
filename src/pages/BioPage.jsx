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
  
  // Flatten grouped gallery objects to grab the first 4 raw URLs for Hero scroll
  const flatImages = biz.gallery?.flatMap(g => g.images) || [];
  const heroScrollImages = flatImages.slice(0, 4);

  // Toggle single service: clears any selected products
  function handleServiceSelect(id) {
    setSelectedId((prev) => (prev === id ? '' : id));
    setSelectedProducts([]); // Empty the product cart
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }

  // Toggle multiple products: clears the selected service
  function handleProductSelect(id) {
    setSelectedId(''); // Empty the service selection
    const isAdding = !selectedProducts.includes(id);
    
    setSelectedProducts((prev) => {
      if (prev.includes(id)) return prev.filter(p => p !== id); // Remove
      return [...prev, id]; // Add
    });

    // Auto-scroll to form only when adding a new product
    if (isAdding) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      <div className="max-w-md mx-auto">

        <HeroSection biz={{ ...biz, gallery: heroScrollImages }} />

        {biz.gallery?.length > 0 && (
          <Gallery gallery={biz.gallery} accent={accent} />
        )}

        <div className="mx-6 mt-8 border-t border-white/[0.04]" />

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
          <p className="text-[11px] text-stone-800 tracking-wide">
            Secured by Paystack · Funds go directly to {biz.name}
          </p>
        </div>
      </div>
    </div>
  );
}