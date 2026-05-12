import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBusinessWithSEO } from '../hooks/useBusinessWithSEO';
import SEO from '../hooks/useSEO';
import BookingForm from '../components/BookingForm';

export default function BookingPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();

  const reference = params.get('reference') || params.get('trxref');
  const serviceId = params.get('service') || '';
  const productId = params.get('product') || '';
  const foodId = params.get('food') || '';
  const carId = params.get('car') || '';

  const { business: biz, loading } = useBusinessWithSEO(slug);

  // Booking selection state
  const [selectedId, setSelectedId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductVariants, setSelectedProductVariants] = useState({});
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedFoodVariants, setSelectedFoodVariants] = useState({});
  const [selectedCar, setSelectedCar] = useState(null);

  // Initialize selection from URL params + sessionStorage
  useEffect(() => {
    if (!biz || !biz.active) return;

    if (serviceId) {
      const exists = biz.services?.some(s => s.id === serviceId);
      if (exists) setSelectedId(serviceId);
    }

    if (productId) {
      const product = biz.products?.find(p => p.id === productId);
      if (product) {
        setSelectedProducts([productId]);
        const stored = sessionStorage.getItem(`bv_${slug}_product_${productId}`);
        if (stored) {
          try { setSelectedProductVariants({ [productId]: JSON.parse(stored) }); }
          catch { setDefaultProductVariant(product); }
        } else {
          setDefaultProductVariant(product);
        }
        sessionStorage.removeItem(`bv_${slug}_product_${productId}`);
      }
    }

    if (foodId) {
      const foodItem = biz.food?.find(f => f.id === foodId);
      if (foodItem) {
        setSelectedFood([foodId]);
        const stored = sessionStorage.getItem(`bv_${slug}_food_${foodId}`);
        if (stored) {
          try { setSelectedFoodVariants({ [foodId]: JSON.parse(stored) }); }
          catch { setSelectedFoodVariants({ [foodId]: { quantity: 1, addons: {}, finalPrice: foodItem.price } }); }
        } else {
          setSelectedFoodVariants({ [foodId]: { quantity: 1, addons: {}, finalPrice: foodItem.price } });
        }
        sessionStorage.removeItem(`bv_${slug}_food_${foodId}`);
      }
    }

    if (carId) {
      const car = biz.cars?.find(c => c.id === carId);
      if (car) setSelectedCar(car);
    }
  }, [biz, serviceId, productId, foodId, carId, slug]);

  function setDefaultProductVariant(product) {
    const variant = {};
    if (product.sizes?.length) variant.size = product.sizes[0];
    if (product.colors?.length) variant.color = product.colors[0];
    if (Object.keys(variant).length) setSelectedProductVariants({ [product.id]: variant });
  }

  const theme = biz?.theme || 'light';
  const isDark = theme === 'dark';
  const accent = biz?.accent || '#c8a97e';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'}`}>
        <div className="text-center">
          <div className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-stone-700 border-t-stone-400' : 'border-stone-200 border-t-stone-500'}`} />
          <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!biz || !biz.active) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-stone-50'}`}>
        <div className="text-center">
          <p className={`text-sm ${isDark ? 'text-stone-500' : 'text-stone-700'}`}>Business not found</p>
          <a href="/" className="mt-4 inline-block text-sm font-medium text-purple-600">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-12 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-stone-50 text-stone-900'}`}>
      <SEO
        title={`Book ${biz.name}`}
        description={`Complete your booking with ${biz.name}`}
        noIndex={true}
      />

      <div className="max-w-lg mx-auto px-6 pt-6">

        {/* Header with back link */}
        <div className="flex items-center gap-3 mb-8">
          <a
            href={`/${slug}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors shrink-0 ${isDark ? 'border-white/10 hover:bg-white/5 text-stone-400 hover:text-white' : 'border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900'}`}
            aria-label="Back to business page"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex items-center gap-3 min-w-0">
            {biz.logo ? (
              <img src={biz.logo} alt="" className="w-10 h-10 rounded-lg object-contain shrink-0" />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: accent }}
              >
                {biz.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-stone-900'}`}>{biz.name}</h1>
              <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>Complete your booking</p>
            </div>
          </div>
        </div>

        {/* The actual BookingForm */}
        <BookingForm
          biz={biz}
          selectedId={selectedId}
          selectedProducts={selectedProducts}
          productVariants={selectedProductVariants}
          selectedFood={selectedFood}
          foodVariants={selectedFoodVariants}
          onDeselect={() => setSelectedId('')}
          onProductDeselect={(id) => {
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
          }}
          onFoodDeselect={(id) => {
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
          }}
          selectedCar={selectedCar}
          onCarDeselect={() => setSelectedCar(null)}
          reference={reference}
        />

        {/* Back link at bottom */}
        <div className="mt-8 text-center">
          <a
            href={`/${slug}`}
            className={`text-xs transition-colors ${isDark ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'}`}
          >
            ← Back to {biz.name}
          </a>
        </div>
      </div>
    </div>
  );
}