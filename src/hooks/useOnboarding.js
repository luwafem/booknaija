// hooks/useOnboarding.js
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  optimizeCloudinaryUrl,
  cleanPrice,
  CLOUD_NAME,
  UPLOAD_PRESET,
  updateNestedState,
  updateNestedAddon,
  updateNestedOption,
} from '../lib/onboardingHelpers';
import { getCsrfToken } from '../lib/csrf';

export function useOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slugFromUrl = searchParams.get('slug');

  // ─── Load business data from storage ───
  const loadBizData = () => {
    let data = null;
    if (slugFromUrl) {
      const stored = localStorage.getItem('pending_signup_' + slugFromUrl);
      if (stored) {
        try { data = JSON.parse(stored); } catch {}
      }
    }
    if (!data) {
      const sessionData = sessionStorage.getItem('pending_signup_data');
      if (sessionData) {
        try { data = JSON.parse(sessionData); } catch {}
        sessionStorage.removeItem('pending_signup_data');
      }
    }
    if (!data) {
      const localData = localStorage.getItem('pending_signup_data');
      if (localData) {
        try { data = JSON.parse(localData); } catch {}
        localStorage.removeItem('pending_signup_data');
      }
    }
    return data || {};
  };

  const bizData = loadBizData();

  // ─── State ───
  const [businessName, setBusinessName] = useState(bizData.businessName || 'New Business');
  const [businessSlug, setBusinessSlug] = useState(bizData.businessSlug || slugFromUrl || 'new-business');
  const [businessType, setBusinessType] = useState(bizData.businessType || '');
  const [brandColor, setBrandColor] = useState(bizData.brandColor || '#c8a97e');
  const [logoUrl, setLogoUrl] = useState(bizData.logoUrl || '');
  const [bio, setBio] = useState(bizData.bio || '');
  const [phone, setPhone] = useState(bizData.phone || '');
  const [whatsapp, setWhatsapp] = useState(bizData.whatsapp || '');
  const [email, setEmail] = useState(bizData.email || '');
  const [locationAddr, setLocationAddr] = useState(bizData.location || '');
  const [instagram, setInstagram] = useState(bizData.instagram || '');
  const [tiktok, setTiktok] = useState(bizData.tiktok || '');
  const [subaccountCode, setSubaccountCode] = useState(bizData.subaccountCode || 'ACCT_PENDING');
  const [referredBy, setReferredBy] = useState(bizData.referredBy || null);

  const isAutoBusiness = businessType === 'Auto' || businessType === 'Auto Dealer / Rental';
  const isFoodBusiness = businessType === 'Restaurant' || businessType === 'Restaurant / Food';
  const isPropertyBusiness = businessType === 'Real Estate' || businessType === 'Shortlet';

  const [servicesEnabled, setServicesEnabled] = useState(
    bizData.servicesEnabled !== undefined ? bizData.servicesEnabled : (!isAutoBusiness && !isFoodBusiness && !isPropertyBusiness)
  );
  const [productsEnabled, setProductsEnabled] = useState(
    bizData.productsEnabled !== undefined ? bizData.productsEnabled : (!isAutoBusiness && !isFoodBusiness && !isPropertyBusiness)
  );
  const [carsEnabled, setCarsEnabled] = useState(
    bizData.carsEnabled !== undefined ? bizData.carsEnabled : isAutoBusiness
  );
  const [foodEnabled, setFoodEnabled] = useState(
    bizData.foodEnabled !== undefined ? bizData.foodEnabled : isFoodBusiness
  );
  const [propertiesEnabled, setPropertiesEnabled] = useState(
    bizData.propertiesEnabled !== undefined ? bizData.propertiesEnabled : isPropertyBusiness
  );

  const hasProductsStep = productsEnabled && !carsEnabled && !foodEnabled && !propertiesEnabled;

  const [currentStep, setCurrentStep] = useState(1);
  const [securityCode, setSecurityCode] = useState('');
  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [accountName, setAccountName] = useState(bizData.accountName || '');
  const [accountNumber, setAccountNumber] = useState(bizData.accountNumber || '');
  const [settlementBankName, setSettlementBankName] = useState(bizData.settlementBank || '');

  const [gallery, setGallery] = useState([{ id: 'default', group: 'Gallery', images: [] }]);
  const [services, setServices] = useState([{ id: 1, name: '', duration: '', price: '', description: '', image: '', images: [] }]);
  const [products, setProducts] = useState([{ id: 1, name: '', price: '', description: '', image: '', images: [], sizes: [], colors: [] }]);
  const [cars, setCars] = useState([]);
  const [foods, setFoods] = useState([]);
  const [properties, setProperties] = useState([]);

  // ─── Steps ───
  const steps = useMemo(() => {
    if (propertiesEnabled) {
      return [
        { id: 1, title: 'Security', desc: 'Dashboard access' },
        { id: 2, title: 'Gallery', desc: 'Your photos' },
        { id: 3, title: 'Properties', desc: 'Your listings' },
        { id: 4, title: 'Review', desc: 'Final check' },
      ];
    } else if (carsEnabled || foodEnabled) {
      return [
        { id: 1, title: 'Security', desc: 'Dashboard access' },
        { id: 2, title: 'Gallery', desc: 'Your photos' },
        { id: 3, title: carsEnabled ? 'Cars' : 'Menu', desc: 'What you offer' },
        { id: 4, title: 'Review', desc: 'Final check' },
      ];
    } else if (hasProductsStep) {
      return [
        { id: 1, title: 'Security', desc: 'Dashboard access' },
        { id: 2, title: 'Gallery', desc: 'Your photos' },
        { id: 3, title: 'Services', desc: 'What you offer' },
        { id: 4, title: 'Products', desc: 'Items for sale' },
        { id: 5, title: 'Review', desc: 'Final check' },
      ];
    } else {
      return [
        { id: 1, title: 'Security', desc: 'Dashboard access' },
        { id: 2, title: 'Gallery', desc: 'Your photos' },
        { id: 3, title: 'Services', desc: 'What you offer' },
        { id: 4, title: 'Review', desc: 'Final check' },
      ];
    }
  }, [propertiesEnabled, carsEnabled, foodEnabled, hasProductsStep]);

  // ─── Cloudinary script ───
  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // ─── Image upload ───
  const uploadImage = (onSuccess, isMultiple = true, maxImages = 10) => {
    if (!window.cloudinary) {
      alert('Widget is still loading.');
      return;
    }
    const uploadedUrls = [];
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: isMultiple,
        maxFiles: maxImages,
        maxImageFileSize: 10000000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
      },
      (err, res) => {
        if (err) return;
        if (!isMultiple && res.event === 'success' && res.info?.secure_url) {
          onSuccess(optimizeCloudinaryUrl(res.info.secure_url));
        }
        if (isMultiple && res.event === 'success') {
          const u = res.info?.secure_url;
          if (u && !uploadedUrls.includes(u)) {
            uploadedUrls.push(u);
            onSuccess(optimizeCloudinaryUrl(u));
          }
        }
        if (isMultiple && res.event === 'upload-finish' && res.info?.files) {
          res.info.files.forEach(f => {
            const u2 = f.uploadInfo?.secure_url;
            if (u2 && !uploadedUrls.includes(u2)) {
              uploadedUrls.push(u2);
              onSuccess(optimizeCloudinaryUrl(u2));
            }
          });
        }
      }
    );
    widget.open();
  };

  // ─── Handlers for gallery ───
  const addGroup = () => setGallery(prev => [...prev, { id: 'g-' + Date.now(), group: '', images: [] }]);
  const removeGroup = (id) => setGallery(prev => prev.filter(g => g.id !== id));
  const updateGroupName = (id, name) =>
    setGallery(prev => prev.map(g => (g.id === id ? { ...g, group: name } : g)));
  const addGalleryImage = (groupId, url) =>
    setGallery(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, images: [...g.images, url] } : g
      )
    );
  const removeGalleryImage = (groupId, imgIdx) =>
    setGallery(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, images: g.images.filter((_, i) => i !== imgIdx) }
          : g
      )
    );

  // ─── Handlers for services ───
  const addService = () =>
    setServices(prev => [...prev, { id: Date.now(), name: '', duration: '', price: '', description: '', image: '', images: [] }]);
  const removeService = (id) => setServices(prev => prev.filter(s => s.id !== id));
  const updateService = (id, field, value) =>
    setServices(prev => updateNestedState(prev, id, { [field]: value }));
  const addServiceImage = (service) =>
    uploadImage((url) => {
      setServices(prev =>
        prev.map(s => {
          if (s.id !== service.id) return s;
          const imgs = [...(s.images || []), url];
          return { ...s, images: imgs, image: imgs[0] };
        })
      );
    }, true, 3);
  const removeServiceImage = (id, idx) =>
    setServices(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, images: s.images.filter((_, i) => i !== idx), image: s.images[0] || '' }
          : s
      )
    );

  // ─── Handlers for products ───
  const addProduct = () =>
    setProducts(prev => [...prev, { id: Date.now(), name: '', price: '', description: '', image: '', images: [], sizes: [], colors: [] }]);
  const removeProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));
  const updateProduct = (id, field, value) =>
    setProducts(prev => updateNestedState(prev, id, { [field]: value }));
  const updateProductSizes = (id, value) =>
    setProducts(prev =>
      updateNestedState(prev, id, {
        sizes: value.split(',').map(s => s.trim()).filter(Boolean),
      })
    );
  const updateProductColors = (id, value) =>
    setProducts(prev =>
      updateNestedState(prev, id, {
        colors: value.split(',').map(s => s.trim()).filter(Boolean),
      })
    );
  const addProductImage = (product) =>
    uploadImage((url) => {
      setProducts(prev =>
        prev.map(p => {
          if (p.id !== product.id) return p;
          const imgs = [...(p.images || []), url];
          return { ...p, images: imgs, image: imgs[0] };
        })
      );
    }, true, 3);
  const removeProductImage = (id, idx) =>
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, images: p.images.filter((_, i) => i !== idx), image: p.images[0] || '' }
          : p
      )
    );

  // ─── Handlers for cars ───
  const addCar = () =>
    setCars(prev => [...prev, { id: Date.now(), name: '', type: 'rent', year: '', price: '', mileage: '', transmission: '', fuel: '', description: '', images: [] }]);
  const removeCar = (id) => setCars(prev => prev.filter(c => c.id !== id));
  const updateCar = (id, field, value) =>
    setCars(prev => updateNestedState(prev, id, { [field]: value }));
  const setCarImages = (id, images) =>
    setCars(prev => updateNestedState(prev, id, { images }));
  const addCarImage = (car) =>
    uploadImage((url) => {
      setCars(prev =>
        prev.map(c => {
          if (c.id !== car.id) return c;
          const imgs = [...(c.images || []), url];
          return { ...c, images: imgs };
        })
      );
    }, true, 3);

  // ─── Handlers for food ───
  const addFood = () =>
    setFoods(prev => [...prev, { id: Date.now(), name: '', price: '', description: '', image: '', images: [], addons: [] }]);
  const removeFood = (id) => setFoods(prev => prev.filter(f => f.id !== id));
  const updateFood = (id, field, value) =>
    setFoods(prev => updateNestedState(prev, id, { [field]: value }));
  const addFoodImage = (food) =>
    uploadImage((url) => {
      setFoods(prev =>
        prev.map(f => {
          if (f.id !== food.id) return f;
          const imgs = [...(f.images || []), url];
          return { ...f, images: imgs, image: imgs[0] };
        })
      );
    }, true, 3);
  const removeFoodImage = (id, idx) =>
    setFoods(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, images: f.images.filter((_, i) => i !== idx), image: f.images[0] || '' }
          : f
      )
    );

  // ─── Food addon handlers ───
  const addAddonGroup = (foodId) => {
    setFoods(prev =>
      prev.map(f =>
        f.id === foodId
          ? { ...f, addons: [...(f.addons || []), { id: 'a-' + Date.now(), label: '', type: 'single', options: [] }] }
          : f
      )
    );
  };
  const removeAddonGroup = (foodId, addonId) => {
    setFoods(prev =>
      prev.map(f =>
        f.id === foodId
          ? { ...f, addons: (f.addons || []).filter(a => a.id !== addonId) }
          : f
      )
    );
  };
  const updateAddonGroup = (foodId, addonId, field, value) => {
    setFoods(prev => updateNestedAddon(prev, foodId, addonId, { [field]: value }));
  };
  const addAddonOption = (foodId, addonId) => {
    setFoods(prev =>
      prev.map(f => {
        if (f.id !== foodId) return f;
        return {
          ...f,
          addons: (f.addons || []).map(a =>
            a.id === addonId
              ? { ...a, options: [...(a.options || []), { id: 'opt-' + Date.now(), name: '', price: 0 }] }
              : a
          ),
        };
      })
    );
  };
  const removeAddonOption = (foodId, addonId, optId) => {
    setFoods(prev =>
      prev.map(f => {
        if (f.id !== foodId) return f;
        return {
          ...f,
          addons: (f.addons || []).map(a =>
            a.id === addonId
              ? { ...a, options: (a.options || []).filter(o => o.id !== optId) }
              : a
          ),
        };
      })
    );
  };
  const updateAddonOption = (foodId, addonId, optId, field, value) => {
    setFoods(prev =>
      prev.map(f => {
        if (f.id !== foodId) return f;
        return {
          ...f,
          addons: (f.addons || []).map(a =>
            a.id === addonId
              ? {
                  ...a,
                  options: (a.options || []).map(o =>
                    o.id === optId ? { ...o, [field]: value } : o
                  ),
                }
              : a
          ),
        };
      })
    );
  };

  // ─── Handlers for properties ───
  const addProperty = () =>
    setProperties(prev => [...prev, { id: Date.now(), name: '', type: businessType === 'Shortlet' ? 'shortlet' : 'sale', price: '', location: '', bedrooms: '', bathrooms: '', description: '', images: [] }]);
  const removeProperty = (id) => setProperties(prev => prev.filter(p => p.id !== id));
  const updateProperty = (id, field, value) =>
    setProperties(prev => updateNestedState(prev, id, { [field]: value }));
  const addPropertyImage = (property) =>
    uploadImage((url) => {
      setProperties(prev =>
        prev.map(p => {
          if (p.id !== property.id) return p;
          const imgs = [...(p.images || []), url];
          return { ...p, images: imgs };
        })
      );
    }, true, 5);
  const removePropertyImage = (id, idx) =>
    setProperties(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, images: p.images.filter((_, i) => i !== idx) }
          : p
      )
    );

  // ─── Navigation ───
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(c => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(c => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (securityCode.length !== 4) {
      setError('Please set a valid 4-digit security code.');
      setLoading(false);
      return;
    }
    if (!securityQuestion1 || !securityAnswer1.trim() || !securityQuestion2 || !securityAnswer2.trim()) {
      setError('Please select and answer both security questions.');
      setLoading(false);
      return;
    }

    const honeypot = document.getElementById('formspree_gotcha');
    if (honeypot && honeypot.value) {
      setLoading(false);
      return;
    }

    // Build data
    const servicesData = services.filter(s => s.name).map(s => ({
      id: businessSlug + '-' + s.id,
      name: s.name,
      duration: s.duration,
      price: cleanPrice(s.price),
      image: s.image || '',
      images: s.images || [],
      showDetails: true,
      description: s.description || '',
    }));

    const productsData = products.filter(p => p.name).map(p => ({
      id: businessSlug + '-' + p.id,
      name: p.name,
      price: cleanPrice(p.price),
      image: p.image || '',
      images: p.images || [],
      sizes: p.sizes || [],
      colors: p.colors || [],
      showDetails: true,
      description: p.description || '',
    }));

    const carsData = (carsEnabled ? cars : []).filter(c => c.name).map(c => ({
      id: businessSlug + '-' + c.id,
      type: c.type,
      name: c.name,
      year: parseInt(c.year) || new Date().getFullYear(),
      price: cleanPrice(c.price),
      mileage: c.mileage || '',
      transmission: c.transmission || '',
      fuel: c.fuel || '',
      description: c.description || '',
      image: (c.images || [])[0] || '',
      images: c.images || [],
    }));

    const foodsData = (foodEnabled ? foods : []).filter(f => f.name).map(f => {
      const cleanAddons = (f.addons || [])
        .filter(a => a.label && a.label.trim())
        .map(a => ({
          id: a.id,
          label: a.label.trim(),
          type: a.type,
          options: (a.options || [])
            .filter(o => o.name && o.name.trim())
            .map(o => ({ name: o.name.trim(), price: cleanPrice(o.price) })),
        }))
        .filter(a => a.options.length > 0);
      return {
        id: businessSlug + '-' + f.id,
        name: f.name,
        price: cleanPrice(f.price),
        image: f.image || '',
        description: f.description || '',
        addons: cleanAddons,
      };
    });

    const propertiesData = (propertiesEnabled ? properties : []).filter(p => p.name).map(p => ({
      id: businessSlug + '-' + p.id,
      name: p.name,
      type: p.type,
      price: cleanPrice(p.price),
      location: p.location || '',
      bedrooms: p.bedrooms || '',
      bathrooms: p.bathrooms || '',
      description: p.description || '',
      images: p.images || [],
    }));

    const galleryData = gallery
      .filter(g => g.group.trim() && g.images.length > 0)
      .map(g => ({ group: g.group.trim(), images: g.images }));

    const finalGallery = galleryData.length > 0 ? galleryData : [{ group: 'Gallery', images: [] }];

    // ─── UPDATED PAYLOAD WITH SNAKE_CASE KEYS ───
    const payload = {
      slug: businessSlug,
      name: businessName,
      logo: logoUrl,
      tagline: 'A professional ' + businessType + ' in Lagos',
      bio,
      phone,
      referredBy, // Keep camelCase; backend uses `d.referredBy`
      whatsapp,
      email,
      location: locationAddr,
      hours: 'Mon–Sun, 9 AM – 6 PM',
      accent: brandColor,
      hero: 'https://picsum.photos/seed/' + businessSlug + '/800/600',
      socials: { instagram, tiktok },
      subaccount_code: subaccountCode,          // ✅ snake_case
      calendar_id: email,                       // ✅ snake_case
      ads_enabled: !propertiesEnabled,          // ✅ snake_case
      business_type: businessType,              // ✅ snake_case
      services_enabled: servicesEnabled,        // ✅ snake_case
      products_enabled: productsEnabled,        // ✅ snake_case
      cars_enabled: carsEnabled,                // ✅ snake_case
      food_enabled: foodEnabled,                // ✅ snake_case
      properties_enabled: propertiesEnabled,    // ✅ snake_case
      security_code: securityCode,              // ✅ snake_case
      security_question_1: securityQuestion1,   // ✅ snake_case
      security_answer_1: securityAnswer1.trim().toLowerCase(),
      security_question_2: securityQuestion2,   // ✅ snake_case
      security_answer_2: securityAnswer2.trim().toLowerCase(),
      account_name: accountName,
      account_number: accountNumber,
      settlement_bank: settlementBankName,
      gallery: finalGallery,
      services: servicesData,
      products: productsData,
      cars: carsData,
      food: foodsData,
      properties: propertiesData,
    };

    const formData = new FormData();
    formData.append('_subject', 'New Business Setup: ' + businessName);
    formData.append('_replyto', email);
    formData.append('_gotcha', '');
    formData.append('business_name', businessName);
    formData.append('business_slug', businessSlug);
    formData.append('business_type', businessType);
    formData.append('business_email', email);
    formData.append('business_phone', phone);
    formData.append('business_whatsapp', whatsapp);
    formData.append('business_location', locationAddr);
    formData.append('subaccount_code', subaccountCode);
    formData.append('services_count', String(servicesData.length));
    formData.append('products_count', String(productsData.length));
    formData.append('cars_count', String(carsData.length));
    formData.append('food_count', String(foodsData.length));
    formData.append('properties_count', String(propertiesData.length));

    try {
      // 1. Send to Formspree (no CSRF needed)
      await fetch('https://formspree.io/f/xyklbbqy', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      }).catch(() => ({ ok: true }));

      // 2. Save to Supabase with CSRF protection
      const saveRes = await fetch('/.netlify/functions/save-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      const saveData = await saveRes.json();

      if (!saveData.ok) {
        throw new Error(saveData.error || 'Failed to save business.');
      }

      // Clean up storage
      localStorage.removeItem('pending_signup_' + businessSlug);
      localStorage.removeItem('pending_signup_data');
      sessionStorage.removeItem('pending_signup_data');

      sessionStorage.setItem('new_biz_slug', businessSlug);
      sessionStorage.setItem('new_biz_name', businessName);

      navigate('/onboarding-success', {
        state: { businessName, businessSlug },
      });
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers for UI ───
  const totalGalleryImages = gallery.reduce((acc, g) => acc + g.images.length, 0);
  const isProductsStep = hasProductsStep && currentStep === 4;
  const isReviewStep = currentStep === steps.length;

  // ─── Return all state and handlers ───
  return {
    // State
    businessName,
    businessSlug,
    businessType,
    brandColor,
    logoUrl,
    bio,
    phone,
    whatsapp,
    email,
    locationAddr,
    instagram,
    tiktok,
    subaccountCode,
    referredBy,
    servicesEnabled,
    productsEnabled,
    carsEnabled,
    foodEnabled,
    propertiesEnabled,
    hasProductsStep,
    currentStep,
    setCurrentStep,
    securityCode,
    setSecurityCode,
    securityQuestion1,
    setSecurityQuestion1,
    securityAnswer1,
    setSecurityAnswer1,
    securityQuestion2,
    setSecurityQuestion2,
    securityAnswer2,
    setSecurityAnswer2,
    loading,
    error,
    accountName,
    setAccountName,
    accountNumber,
    setAccountNumber,
    settlementBankName,
    setSettlementBankName,
    gallery,
    services,
    products,
    cars,
    foods,
    properties,
    steps,
    totalGalleryImages,
    isProductsStep,
    isReviewStep,

    // Handlers
    uploadImage,
    addGroup,
    removeGroup,
    updateGroupName,
    addGalleryImage,
    removeGalleryImage,
    addService,
    removeService,
    updateService,
    addServiceImage,
    removeServiceImage,
    addProduct,
    removeProduct,
    updateProduct,
    updateProductSizes,
    updateProductColors,
    addProductImage,
    removeProductImage,
    addCar,
    removeCar,
    updateCar,
    setCarImages,
    addCarImage,
    addFood,
    removeFood,
    updateFood,
    addFoodImage,
    removeFoodImage,
    addAddonGroup,
    removeAddonGroup,
    updateAddonGroup,
    addAddonOption,
    removeAddonOption,
    updateAddonOption,
    addProperty,
    removeProperty,
    updateProperty,
    addPropertyImage,
    removePropertyImage,
    nextStep,
    prevStep,
    handleSubmit,
  };
}