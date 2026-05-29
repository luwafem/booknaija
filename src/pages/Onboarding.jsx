import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function updateNestedState(state, id, updates) {
  return state.map(function(item) {
    if (item.id === id) return Object.assign({}, item, updates);
    return item;
  });
}

function updateNestedAddon(state, foodId, addonId, updates) {
  return state.map(function(f) {
    if (f.id !== foodId) return f;
    return Object.assign({}, f, {
      addons: (f.addons || []).map(function(a) {
        if (a.id === addonId) return Object.assign({}, a, updates);
        return a;
      })
    });
  });
}

function updateNestedOption(state, foodId, addonId, optIdx, updates) {
  return state.map(function(f) {
    if (f.id !== foodId) return f;
    var newAddons = [];
    for (var i = 0; i < (f.addons || []).length; i++) {
      var a = f.addons[i];
      if (a.id === addonId) {
        var opts = (a.options || []).map(function(opt, j) {
          return j === optIdx ? Object.assign({}, opt, updates) : opt;
        });
        newAddons.push(Object.assign({}, a, { options: opts }));
      } else {
        newAddons.push(a);
      }
    }
    return Object.assign({}, f, { addons: newAddons });
  });
}

// ─── OPTIMIZE CLOUDINARY URLs FOR INSTANT LOADING ───
function optimizeCloudinaryUrl(url) {
  if (!url || url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slugFromUrl = searchParams.get('slug');

  var bizData = null;

  if (slugFromUrl) {
    var storedBySlug = localStorage.getItem('pending_signup_' + slugFromUrl);
    if (storedBySlug) {
      try { bizData = JSON.parse(storedBySlug); } catch(e) { bizData = null; }
    }
  }

  if (!bizData) {
    var sessionData = sessionStorage.getItem('pending_signup_data');
    if (sessionData) {
      try { bizData = JSON.parse(sessionData); } catch(e) { bizData = null; }
      sessionStorage.removeItem('pending_signup_data');
    }
  }

  if (!bizData) {
    var localData = localStorage.getItem('pending_signup_data');
    if (localData) {
      try { bizData = JSON.parse(localData); } catch(e) { bizData = null; }
      localStorage.removeItem('pending_signup_data');
    }
  }

  if (!bizData && !slugFromUrl) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-900/40 border border-red-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Session expired</h2>
          <p className="text-zinc-400 text-sm mb-6">Your signup data wasn't found. This can happen if the page was open too long or refreshed incorrectly.</p>
          <Link to="/signup" className="inline-flex items-center justify-center bg-white hover:bg-zinc-200 text-zinc-900 px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
            Start Over
          </Link>
        </div>
      </div>
    );
  }

  if (!bizData) bizData = {};

  var businessName = (bizData && bizData.businessName) ? bizData.businessName : 'New Business';
  var businessSlug = (bizData && bizData.businessSlug) ? bizData.businessSlug : (slugFromUrl || 'new-business');
  var businessType = (bizData && bizData.businessType) ? bizData.businessType : '';
  var brandColor = (bizData && bizData.brandColor) ? bizData.brandColor : '#c8a97e';
  var logoUrl = (bizData && bizData.logoUrl) ? bizData.logoUrl : '';
  var bio = (bizData && bizData.bio) ? bizData.bio : '';
  var phone = (bizData && bizData.phone) ? bizData.phone : '';
  var whatsapp = (bizData && bizData.whatsapp) ? bizData.whatsapp : '';
  var email = (bizData && bizData.email) ? bizData.email : '';
  var locationAddr = (bizData && bizData.location) ? bizData.location : '';
  var instagram = (bizData && bizData.instagram) ? bizData.instagram : '';
  var tiktok = (bizData && bizData.tiktok) ? bizData.tiktok : '';
  var subaccountCode = (bizData && bizData.subaccountCode) ? bizData.subaccountCode : 'ACCT_PENDING';
  var referredBy = (bizData && bizData.referredBy) ? bizData.referredBy : null;

  var isAutoBusiness = businessType === 'Auto' || businessType === 'Auto Dealer / Rental';
  var isFoodBusiness = businessType === 'Restaurant' || businessType === 'Restaurant / Food';
  var isPropertyBusiness = businessType === 'Real Estate' || businessType === 'Shortlet';

  var servicesEnabled = (bizData && bizData.servicesEnabled !== undefined) 
    ? bizData.servicesEnabled === true 
    : (!isAutoBusiness && !isFoodBusiness && !isPropertyBusiness);
  var productsEnabled = (bizData && bizData.productsEnabled !== undefined) 
    ? bizData.productsEnabled === true 
    : (!isAutoBusiness && !isFoodBusiness && !isPropertyBusiness);
  var carsEnabled = (bizData && bizData.carsEnabled !== undefined) 
    ? bizData.carsEnabled === true 
    : isAutoBusiness;
  var foodEnabled = (bizData && bizData.foodEnabled !== undefined) 
    ? bizData.foodEnabled === true 
    : isFoodBusiness;
  var propertiesEnabled = (bizData && bizData.propertiesEnabled !== undefined) 
    ? bizData.propertiesEnabled === true 
    : isPropertyBusiness;

  var hasProductsStep = productsEnabled && !carsEnabled && !foodEnabled && !propertiesEnabled;

  var [currentStep, setCurrentStep] = useState(1);
  var [securityCode, setSecurityCode] = useState('');
  var [securityQuestion1, setSecurityQuestion1] = useState('');
  var [securityAnswer1, setSecurityAnswer1] = useState('');
  var [securityQuestion2, setSecurityQuestion2] = useState('');
  var [securityAnswer2, setSecurityAnswer2] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');

  var [accountName, setAccountName] = useState((bizData && bizData.accountName) ? bizData.accountName : '');
  var [accountNumber, setAccountNumber] = useState((bizData && bizData.accountNumber) ? bizData.accountNumber : '');
  var [settlementBankName, setSettlementBankName] = useState((bizData && bizData.settlementBank) ? bizData.settlementBank : '');

  var [gallery, setGallery] = useState([{ id: 'default', group: 'Gallery', images: [] }]);
  var [services, setServices] = useState([{ id: 1, name: '', duration: '', price: '', description: '', image: '', images: [] }]);
  var [products, setProducts] = useState([{ id: 1, name: '', price: '', description: '', image: '', images: [], sizes: [], colors: [] }]);
  var [cars, setCars] = useState([]);
  var [foods, setFoods] = useState([]);
  var [properties, setProperties] = useState([]);

  var CLOUD_NAME = 'deexaiik4';
  var UPLOAD_PRESET = 'BizUploads';

  var steps;
  if (propertiesEnabled) {
    steps = [
      { id: 1, title: 'Security', desc: 'Dashboard access' },
      { id: 2, title: 'Gallery', desc: 'Your photos' },
      { id: 3, title: 'Properties', desc: 'Your listings' },
      { id: 4, title: 'Review', desc: 'Final check' }
    ];
  } else if (carsEnabled || foodEnabled) {
    steps = [
      { id: 1, title: 'Security', desc: 'Dashboard access' },
      { id: 2, title: 'Gallery', desc: 'Your photos' },
      { id: 3, title: carsEnabled ? 'Cars' : 'Menu', desc: 'What you offer' },
      { id: 4, title: 'Review', desc: 'Final check' }
    ];
  } else if (hasProductsStep) {
    steps = [
      { id: 1, title: 'Security', desc: 'Dashboard access' },
      { id: 2, title: 'Gallery', desc: 'Your photos' },
      { id: 3, title: 'Services', desc: 'What you offer' },
      { id: 4, title: 'Products', desc: 'Items for sale' },
      { id: 5, title: 'Review', desc: 'Final check' }
    ];
  } else {
    steps = [
      { id: 1, title: 'Security', desc: 'Dashboard access' },
      { id: 2, title: 'Gallery', desc: 'Your photos' },
      { id: 3, title: 'Services', desc: 'What you offer' },
      { id: 4, title: 'Review', desc: 'Final check' }
    ];
  }

  useEffect(function() {
    if (!window.cloudinary) {
      var s = document.createElement('script');
      s.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  function handleUpload(onSuccess, isMultiple, maxImages) {
    if (!window.cloudinary) {
      alert('Widget is still loading.');
      return;
    }
    if (isMultiple === undefined) isMultiple = true;
    if (!maxImages) maxImages = isMultiple ? 10 : 1;
    var uploadedUrls = [];

    var widget = window.cloudinary.createUploadWidget({
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      sources: ['local', 'url', 'camera'],
      multiple: isMultiple,
      maxFiles: maxImages,
      maxImageFileSize: 10000000,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }]
    }, function(err, res) {
      if (err) return;

      if (!isMultiple && res.event === 'success') {
        if (res.info && res.info.secure_url && typeof onSuccess === 'function') {
          onSuccess(optimizeCloudinaryUrl(res.info.secure_url));
        }
      }

      if (isMultiple && res.event === 'success') {
        var url = res.info && res.info.secure_url;
        if (url && uploadedUrls.indexOf(url) === -1) {
          uploadedUrls.push(url);
          onSuccess(optimizeCloudinaryUrl(url));
        }
      }

      if (isMultiple && res.event === 'upload-finish' && res.info && res.info.files) {
        var newUrls = [];
        for (var i = 0; i < res.info.files.length; i++) {
          var f = res.info.files[i];
          var u = f.uploadInfo && f.uploadInfo.secure_url;
          if (u && uploadedUrls.indexOf(u) === -1) {
            newUrls.push(u);
          }
        }
        if (newUrls.length > 0) {
          for (var j = 0; j < newUrls.length; j++) {
            uploadedUrls.push(newUrls[j]);
            onSuccess(optimizeCloudinaryUrl(newUrls[j]));
          }
        }
      }
    });

    widget.open();
  }

  function handleGalleryUpload(groupId) {
    handleUpload(function(url) {
      setGallery(function(p) {
        return p.map(function(g) {
          if (g.id === groupId) {
            return Object.assign({}, g, { images: g.images.concat([url]) });
          }
          return g;
        });
      });
    }, true, 10);
  }

  function addGroup() {
    setGallery(function(p) {
      return p.concat([{ id: 'g-' + Date.now(), group: '', images: [] }]);
    });
  }

  function removeGroup(groupId) {
    setGallery(function(p) {
      return p.filter(function(g) { return g.id !== groupId; });
    });
  }

  function updateGroupName(groupId, name) {
    setGallery(function(p) {
      return p.map(function(g) {
        if (g.id === groupId) return Object.assign({}, g, { group: name });
        return g;
      });
    });
  }

  function removeGalleryImage(groupId, imgIdx) {
    setGallery(function(p) {
      return p.map(function(g) {
        if (g.id === groupId) {
          var newImages = [];
          for (var i = 0; i < g.images.length; i++) {
            if (i !== imgIdx) newImages.push(g.images[i]);
          }
          return Object.assign({}, g, { images: newImages });
        }
        return g;
      });
    });
  }

  function addService() {
    setServices(function(p) {
      return p.concat([{ id: Date.now(), name: '', duration: '', price: '', description: '', image: '', images: [] }]);
    });
  }

  function removeService(id) {
    setServices(function(p) {
      return p.filter(function(s) { return s.id !== id; });
    });
  }

  function updateService(id, field, value) {
    setServices(function(p) {
      var u = {};
      u[field] = value;
      return updateNestedState(p, id, u);
    });
  }

  function handleServiceImageUpload(service) {
    handleUpload(function(url) {
      setServices(function(p) {
        return p.map(function(s) {
          if (s.id !== service.id) return s;
          var current = s.images || [];
          if (current.length >= 3) return s;
          var newImages = current.concat([url]);
          return Object.assign({}, s, { images: newImages, image: newImages[0] });
        });
      });
    }, true, 3);
  }

  function removeServiceImage(serviceId, idx) {
    setServices(function(p) {
      return p.map(function(s) {
        if (s.id !== serviceId) return s;
        var newImgs = s.images.filter(function(_, i) { return i !== idx; });
        return Object.assign({}, s, { images: newImgs, image: newImgs.length > 0 ? newImgs[0] : '' });
      });
    });
  }

  function addProduct() {
    setProducts(function(p) {
      return p.concat([{ id: Date.now(), name: '', price: '', description: '', image: '', images: [], sizes: [], colors: [] }]);
    });
  }

  function removeProduct(id) {
    setProducts(function(p) {
      return p.filter(function(x) { return x.id !== id; });
    });
  }

  function updateProduct(id, field, value) {
    setProducts(function(p) {
      var u = {};
      u[field] = value;
      return updateNestedState(p, id, u);
    });
  }

  function updateProductSizes(id, value) {
    setProducts(function(p) {
      return updateNestedState(p, id, { sizes: value.split(',').map(function(s) { return s.trim(); }).filter(Boolean) });
    });
  }

  function updateProductColors(id, value) {
    setProducts(function(p) {
      return updateNestedState(p, id, { colors: value.split(',').map(function(s) { return s.trim(); }).filter(Boolean) });
    });
  }

  function handleProductImageUpload(product) {
    handleUpload(function(url) {
      setProducts(function(p) {
        return p.map(function(pr) {
          if (pr.id !== product.id) return pr;
          var current = pr.images || [];
          if (current.length >= 3) return pr;
          var newImages = current.concat([url]);
          return Object.assign({}, pr, { images: newImages, image: newImages[0] });
        });
      });
    }, true, 3);
  }

  function removeProductImage(productId, idx) {
    setProducts(function(p) {
      return p.map(function(pr) {
        if (pr.id !== productId) return pr;
        var newImgs = pr.images.filter(function(_, i) { return i !== idx; });
        return Object.assign({}, pr, { images: newImgs, image: newImgs.length > 0 ? newImgs[0] : '' });
      });
    });
  }

  function addCar() {
    setCars(function(p) {
      return p.concat([{ id: Date.now(), name: '', type: 'rent', year: '', price: '', mileage: '', transmission: '', fuel: '', description: '', images: [] }]);
    });
  }

  function removeCar(id) {
    setCars(function(p) {
      return p.filter(function(c) { return c.id !== id; });
    });
  }

  function updateCar(id, field, value) {
    setCars(function(p) {
      var u = {};
      u[field] = value;
      return updateNestedState(p, id, u);
    });
  }

  function setCarImages(id, imgs) {
    setCars(function(p) {
      return updateNestedState(p, id, { images: imgs });
    });
  }

  function handleCarImageUpload(car) {
    handleUpload(function(url) {
      setCars(function(p) {
        return p.map(function(c) {
          if (c.id !== car.id) return c;
          var current = c.images || [];
          if (current.length >= 3) return c;
          return Object.assign({}, c, { images: current.concat([url]) });
        });
      });
    }, true, 3);
  }

  function addFood() {
    setFoods(function(p) {
      return p.concat([{ id: Date.now(), name: '', price: '', description: '', image: '', images: [], addons: [] }]);
    });
  }

  function removeFood(id) {
    setFoods(function(p) {
      return p.filter(function(f) { return f.id !== id; });
    });
  }

  function updateFood(id, field, value) {
    setFoods(function(p) {
      var u = {};
      u[field] = value;
      return updateNestedState(p, id, u);
    });
  }

  function handleFoodImageUpload(food) {
    handleUpload(function(url) {
      setFoods(function(p) {
        return p.map(function(f) {
          if (f.id !== food.id) return f;
          var current = f.images || [];
          if (current.length >= 3) return f;
          var newImages = current.concat([url]);
          return Object.assign({}, f, { images: newImages, image: newImages[0] });
        });
      });
    }, true, 3);
  }

  function removeFoodImage(foodId, idx) {
    setFoods(function(p) {
      return p.map(function(f) {
        if (f.id !== foodId) return f;
        var newImgs = f.images.filter(function(_, i) { return i !== idx; });
        return Object.assign({}, f, { images: newImgs, image: newImgs.length > 0 ? newImgs[0] : '' });
      });
    });
  }

  function addFoodAddonGroup(foodId) {
    setFoods(function(p) {
      var item = null;
      for (var i = 0; i < p.length; i++) {
        if (p[i].id === foodId) { item = p[i]; break; }
      }
      if (!item) return p;
      var newAddons = (item.addons || []).concat([{ id: 'a-' + Date.now(), label: '', type: 'single', options: [] }]);
      return updateNestedState(p, foodId, { addons: newAddons });
    });
  }

  function removeFoodAddonGroup(foodId, addonId) {
    setFoods(function(p) {
      return p.map(function(f) {
        if (f.id !== foodId) return f;
        var newAddons = (f.addons || []).filter(function(a) { return a.id !== addonId; });
        return Object.assign({}, f, { addons: newAddons });
      });
    });
  }

  function updateFoodAddonGroup(foodId, addonId, field, value) {
    setFoods(function(p) {
      var u = {};
      u[field] = value;
      return updateNestedAddon(p, foodId, addonId, u);
    });
  }

  function addFoodAddonOption(foodId, addonId) {
    setFoods(function(p) {
      var item = null;
      for (var i = 0; i < p.length; i++) {
        if (p[i].id === foodId) { item = p[i]; break; }
      }
      if (!item || !item.addons) return p;
      var currentAddon = null;
      for (var j = 0; j < item.addons.length; j++) {
        if (item.addons[j].id === addonId) { currentAddon = item.addons[j]; break; }
      }
      if (!currentAddon) return p;
      var newOptions = (currentAddon.options || []).concat([{ name: '', price: 0 }]);
      return updateNestedAddon(p, foodId, addonId, { options: newOptions });
    });
  }

  function removeFoodAddonOption(foodId, addonId, optIdx) {
    setFoods(function(p) {
      return p.map(function(f) {
        if (f.id !== foodId) return f;
        return Object.assign({}, f, {
          addons: (f.addons || []).map(function(a) {
            if (a.id !== addonId) return a;
            return Object.assign({}, a, {
              options: (a.options || []).filter(function(_, i) { return i !== optIdx; })
            });
          })
        });
      });
    });
  }

  function updateFoodAddonOption(foodId, addonId, optIdx, field, value) {
    setFoods(function(p) {
      var u = {};
      u[field] = value;
      return updateNestedOption(p, foodId, addonId, optIdx, u);
    });
  }

  // ─── PROPERTIES ───
  function addProperty() {
    setProperties(function(p) {
      return p.concat([{ id: Date.now(), name: '', type: businessType === 'Shortlet' ? 'shortlet' : 'sale', price: '', location: '', bedrooms: '', bathrooms: '', description: '', images: [] }]);
    });
  }

  function removeProperty(id) {
    setProperties(function(p) {
      return p.filter(function(x) { return x.id !== id; });
    });
  }

  function updateProperty(id, field, value) {
    setProperties(function(p) {
      var u = {};
      u[field] = value;
      return updateNestedState(p, id, u);
    });
  }

  function handlePropertyImageUpload(property) {
    handleUpload(function(url) {
      setProperties(function(p) {
        return p.map(function(pr) {
          if (pr.id !== property.id) return pr;
          var current = pr.images || [];
          if (current.length >= 5) return pr;
          var newImages = current.concat([url]);
          return Object.assign({}, pr, { images: newImages });
        });
      });
    }, true, 5);
  }

  function removePropertyImage(propId, idx) {
    setProperties(function(p) {
      return p.map(function(pr) {
        if (pr.id !== propId) return pr;
        var newImgs = pr.images.filter(function(_, i) { return i !== idx; });
        return Object.assign({}, pr, { images: newImgs });
      });
    });
  }

  function nextStep() {
    if (currentStep < steps.length) {
      setCurrentStep(c => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(c => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    var honeypot = document.getElementById('formspree_gotcha');
    if (honeypot && honeypot.value) {
      setLoading(false);
      return;
    }

    function cleanPrice(val) {
      if (!val) return 0;
      return parseInt(String(val).replace(/,/g, '')) || 0;
    }

    var servicesData = services.filter(function(s) { return s.name; }).map(function(s) {
      return {
        id: businessSlug + '-' + s.id,
        name: s.name,
        duration: s.duration,
        price: cleanPrice(s.price),
        image: s.image || '',
        images: s.images || [],
        showDetails: true,
        description: s.description || ''
      };
    });

    var productsData = products.filter(function(p) { return p.name; }).map(function(p) {
      return {
        id: businessSlug + '-' + p.id,
        name: p.name,
        price: cleanPrice(p.price),
        image: p.image || '',
        images: p.images || [],
        sizes: p.sizes || [],
        colors: p.colors || [],
        showDetails: true,
        description: p.description || ''
      };
    });

    var carsData = (carsEnabled ? cars : []).filter(function(c) { return c.name; }).map(function(c) {
      return {
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
        images: c.images || []
      };
    });

    var foodsData = (foodEnabled ? foods : []).filter(function(f) { return f.name; }).map(function(f) {
      var cleanAddons = [];
      if (f.addons && f.addons.length > 0) {
        for (var i = 0; i < f.addons.length; i++) {
          var a = f.addons[i];
          if (!a.label || !a.label.trim()) continue;
          var cleanOpts = [];
          if (a.options) {
            for (var j = 0; j < a.options.length; j++) {
              if (a.options[j].name && a.options[j].name.trim()) {
                cleanOpts.push({
                  name: a.options[j].name.trim(),
                  price: cleanPrice(a.options[j].price)
                });
              }
            }
          }
          if (cleanOpts.length > 0) {
            cleanAddons.push({
              id: a.id,
              label: a.label.trim(),
              type: a.type,
              options: cleanOpts
            });
          }
        }
      }

      return {
        id: businessSlug + '-' + f.id,
        name: f.name,
        price: cleanPrice(f.price),
        image: f.image || '',
        description: f.description || '',
        addons: cleanAddons
      };
    });

    var propertiesData = (propertiesEnabled ? properties : []).filter(function(p) { return p.name; }).map(function(p) {
      return {
        id: businessSlug + '-' + p.id,
        name: p.name,
        type: p.type,
        price: cleanPrice(p.price),
        location: p.location || '',
        bedrooms: p.bedrooms || '',
        bathrooms: p.bathrooms || '',
        description: p.description || '',
        images: p.images || []
      };
    });

    var galleryData = gallery
      .filter(function(g) { return g.group.trim() && g.images.length > 0; })
      .map(function(g) { return { group: g.group.trim(), images: g.images }; });

    var finalGallery = galleryData.length > 0
      ? galleryData
      : [{ group: 'Gallery', images: [] }];

    var payload = {
      slug: businessSlug,
      name: businessName,
      logo: logoUrl,
      tagline: 'A professional ' + businessType + ' in Lagos',
      bio: bio,
      phone: phone,
      referredBy: referredBy,
      whatsapp: whatsapp,
      email: email,
      location: locationAddr,
      hours: 'Mon–Sun, 9 AM – 6 PM',
      accent: brandColor,
      hero: 'https://picsum.photos/seed/' + businessSlug + '/800/600',
      socials: { instagram: instagram, tiktok: tiktok },
      paystackPublicKey: 'pk_test_129628160c0fdb0e1e837751e5ff0233872676b8',
      subaccountCode: subaccountCode,
      calendarId: email,
      adsEnabled: !propertiesEnabled,

      businessType: businessType,
      servicesEnabled: servicesEnabled,
      productsEnabled: productsEnabled,
      carsEnabled: carsEnabled,
      foodEnabled: foodEnabled,
      propertiesEnabled: propertiesEnabled,

      securityCode: securityCode,
      securityQuestion1: securityQuestion1,
      securityAnswer1: securityAnswer1.trim().toLowerCase(),
      securityQuestion2: securityQuestion2,
      securityAnswer2: securityAnswer2.trim().toLowerCase(),
      account_name: accountName,
      account_number: accountNumber,
      settlement_bank: settlementBankName,
      gallery: finalGallery,
      services: servicesData,
      products: productsData,
      cars: carsData,
      food: foodsData,
      properties: propertiesData
    };

    var formData = new FormData();
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

    Promise.all([
      fetch('https://formspree.io/f/xyklbbqy', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).catch(function(err) {
        console.warn('Formspree email notification failed:', err);
        return { ok: true };
      }),
      fetch('/.netlify/functions/save-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    ])
    .then(function(results) {
      return results[1].json();
    })
    .then(function(data) {
      if (data.ok) {
        localStorage.removeItem('pending_signup_' + businessSlug);
        localStorage.removeItem('pending_signup_data');
        sessionStorage.removeItem('pending_signup_data');

        sessionStorage.setItem('new_biz_slug', businessSlug);
        sessionStorage.setItem('new_biz_name', businessName);
        navigate('/onboarding-success', {
          state: {
            businessName: businessName,
            businessSlug: businessSlug
          }
        });
      } else {
        throw new Error(data.error || 'Failed to save business configuration.');
      }
    })
    .catch(function(err) {
      setError(err.message || 'Failed to save. Please try again.');
    })
    .finally(function() {
      setLoading(false);
    });
  }

  var inputBase = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200";
  var selectBase = "w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200 cursor-pointer";
  var sectionTitle = "text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 mt-1";
  var sectionDesc = "text-xs text-zinc-400 mb-3 -mt-1";
  var labelBase = "block text-sm font-medium text-zinc-200 mb-1.5";

  var totalGalleryImages = 0;
  for (var gi = 0; gi < gallery.length; gi++) {
    totalGalleryImages += gallery[gi].images.length;
  }

  var isProductsStep = hasProductsStep && currentStep === 4;
  var isReviewStep = currentStep === steps.length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white">
      
      <nav className="bg-white sticky top-0 z-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Manage Business
            </Link>
            <Link to="/signup" className="text-sm font-semibold text-white bg-zinc-900 px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-xs text-zinc-500">
                {steps.find(s => s.id === currentStep)?.title}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-center gap-1.5 mt-3 md:hidden">
              {steps.map(step => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentStep === step.id ? 'bg-white w-4' : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
              <h2 className="text-lg font-bold text-white">
                {steps.find(s => s.id === currentStep)?.title}
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                {steps.find(s => s.id === currentStep)?.desc}
              </p>
            </div>

            <div className="p-6">
              
              {/* ── STEP 1: SECURITY ── */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelBase}>4-Digit Security Code *</label>
                    <input 
                      className={inputBase + " font-mono tracking-widest text-center text-xl"} 
                      placeholder="••••" 
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      value={securityCode}
                      onChange={function(e) { setSecurityCode(e.target.value.replace(/\D/g, '')); }}
                      autoFocus
                    />
                    <p className="text-xs text-zinc-500 mt-1.5">You'll use this to access your dashboard</p>
                  </div>
                  
                  <div className="border-t border-zinc-800 pt-5">
                    <label className={labelBase}>Security Question 1 *</label>
                    <select className={selectBase} value={securityQuestion1} onChange={function(e) { setSecurityQuestion1(e.target.value); }}>
                      <option value="" disabled className="bg-zinc-800">Select a question...</option>
                      <option value="What is your pet's name?" className="bg-zinc-800">What is your pet's name?</option>
                      <option value="What city were you born in?" className="bg-zinc-800">What city were you born in?</option>
                      <option value="What is your mother's maiden name?" className="bg-zinc-800">What is your mother's maiden name?</option>
                      <option value="What was the name of your first school?" className="bg-zinc-800">What was the name of your first school?</option>
                    </select>
                    <input className={inputBase + " mt-2"} placeholder="Your answer" value={securityAnswer1} onChange={function(e) { setSecurityAnswer1(e.target.value); }} />
                  </div>

                  <div>
                    <label className={labelBase}>Security Question 2 *</label>
                    <select className={selectBase} value={securityQuestion2} onChange={function(e) { setSecurityQuestion2(e.target.value); }}>
                      <option value="" disabled className="bg-zinc-800">Select a question...</option>
                      <option value="What is your favorite childhood movie?" className="bg-zinc-800">What is your favorite childhood movie?</option>
                      <option value="What street did you grow up on?" className="bg-zinc-800">What street did you grow up on?</option>
                      <option value="What is the name of your best friend?" className="bg-zinc-800">What is the name of your best friend?</option>
                      <option value="What was your first car?" className="bg-zinc-800">What was your first car?</option>
                    </select>
                    <input className={inputBase + " mt-2"} placeholder="Your answer" value={securityAnswer2} onChange={function(e) { setSecurityAnswer2(e.target.value); }} />
                  </div>

                  <div className="border-t border-zinc-800 pt-5 mt-6">
                    <p className="text-sm font-bold text-zinc-200 mb-4">Banking Details (for Offline Transfers)</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className={labelBase}>Bank Name</label>
                        <input 
                          className={inputBase} 
                          placeholder="e.g. Zenith Bank" 
                          value={settlementBankName} 
                          onChange={function(e) { setSettlementBankName(e.target.value); }} 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={labelBase}>Account Name</label>
                          <input 
                            className={inputBase} 
                            placeholder="Business Account Name" 
                            value={accountName} 
                            onChange={function(e) { setAccountName(e.target.value); }} 
                          />
                        </div>
                        <div>
                          <label className={labelBase}>Account Number</label>
                          <input 
                            className={inputBase} 
                            placeholder="10 Digit Number" 
                            value={accountNumber} 
                            maxLength={10}
                            onChange={function(e) { setAccountNumber(e.target.value.replace(/\D/g, '')); }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ── STEP 2: GALLERY ── */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <p className={sectionTitle}>Photo Gallery</p>
                    <p className={sectionDesc}>Organize your photos into groups. Add at least one group.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {gallery.map(function(group) {
                      return (
                        <div key={group.id} className="border border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/50">
                          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                            <input
                              type="text"
                              value={group.group}
                              onChange={function(e) { updateGroupName(group.id, e.target.value); }}
                              placeholder="Group name (e.g. Our Work)"
                              className="flex-1 text-sm font-semibold text-white bg-transparent border-0 focus:outline-none placeholder-zinc-500"
                            />
                            {group.images.length > 0 && (
                              <span className="text-[10px] text-zinc-400 bg-zinc-700 px-2 py-0.5 rounded-full">{group.images.length}</span>
                            )}
                            <button type="button" onClick={function() { removeGroup(group.id); }} className="text-zinc-500 hover:text-red-400 transition-colors p-1">✕</button>
                          </div>
                          <div className="p-3">
                            <div className="grid grid-cols-3 gap-2">
                              {group.images.map(function(img, imgIdx) {
                                return (
                                  <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-700 border border-zinc-700 group">
                                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                                    <button type="button" onClick={function() { removeGalleryImage(group.id, imgIdx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 text-xs">✕</button>
                                  </div>
                                );
                              })}
                              <button type="button" onClick={function() { handleGalleryUpload(group.id); }} className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all">
                                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-[10px]">Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" onClick={addGroup} className="w-full py-2.5 rounded-xl border-2 border-dashed border-zinc-700 text-zinc-400 text-xs font-semibold hover:border-zinc-500 hover:text-zinc-300 transition-all flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Add New Group
                  </button>
                </div>
              )}

              {/* ── STEP 3: SERVICES / CARS / MENU / PROPERTIES ── */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  
                  {propertiesEnabled && (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={sectionTitle}>Properties</p>
                          <p className={sectionDesc}>Add your {businessType === 'Shortlet' ? 'shortlets' : 'listings'}.</p>
                        </div>
                        <button type="button" onClick={addProperty} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add</button>
                      </div>
                      <div className="space-y-4">
                        {properties.map(function(prop) {
                          return (
                            <div key={prop.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
                              <button type="button" onClick={function() { removeProperty(prop.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">✕</button>
                              <div className="space-y-2">
                                <input className={inputBase} placeholder="Property Name (e.g. 3 Bed Detached Duplex)" value={prop.name} onChange={function(e) { updateProperty(prop.id, 'name', e.target.value); }} />
                                <input className={inputBase} placeholder="Location (e.g. Lekki Phase 1)" value={prop.location} onChange={function(e) { updateProperty(prop.id, 'location', e.target.value); }} />
                                <div className="grid grid-cols-2 gap-2">
                                  <input className={inputBase} placeholder="Price (₦)" type="number" value={prop.price} onChange={function(e) { updateProperty(prop.id, 'price', e.target.value); }} />
                                  <select className={selectBase} value={prop.type} onChange={function(e) { updateProperty(prop.id, 'type', e.target.value); }}>
                                    <option value="sale" className="bg-zinc-800">For Sale</option>
                                    <option value="rent" className="bg-zinc-800">For Rent</option>
                                    <option value="shortlet" className="bg-zinc-800">Shortlet</option>
                                  </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <input className={inputBase} placeholder="Bedrooms" type="number" value={prop.bedrooms} onChange={function(e) { updateProperty(prop.id, 'bedrooms', e.target.value); }} />
                                  <input className={inputBase} placeholder="Bathrooms" type="number" value={prop.bathrooms} onChange={function(e) { updateProperty(prop.id, 'bathrooms', e.target.value); }} />
                                </div>
                                <textarea className={inputBase + " h-20 resize-none"} placeholder="Description" value={prop.description} onChange={function(e) { updateProperty(prop.id, 'description', e.target.value); }} />
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 5)</p>
                                <div className="grid grid-cols-3 gap-2">
                                  {(prop.images || []).map(function(img, idx) {
                                    return (
                                      <div key={idx} className="aspect-video bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                                        <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                                        <button type="button" onClick={function() { removePropertyImage(prop.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                                      </div>
                                    );
                                  })}
                                  {(prop.images || []).length < 5 && (
                                    <button type="button" onClick={function() { handlePropertyImageUpload(prop); }} className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all">
                                      <span className="text-xs">+ Photos</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {servicesEnabled && !carsEnabled && !foodEnabled && !propertiesEnabled && (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={sectionTitle}>Services</p>
                          <p className={sectionDesc}>Add the services you offer.</p>
                        </div>
                        <button type="button" onClick={addService} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add</button>
                      </div>
                      <div className="space-y-4">
                        {services.map(function(service) {
                          return (
                            <div key={service.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
                              <button type="button" onClick={function() { removeService(service.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">✕</button>
                              <div className="space-y-2">
                                <input className={inputBase} placeholder="Service Name" value={service.name} onChange={function(e) { updateService(service.id, 'name', e.target.value); }} />
                                <div className="grid grid-cols-2 gap-2">
                                  <input className={inputBase} placeholder="Price (₦)" type="number" value={service.price} onChange={function(e) { updateService(service.id, 'price', e.target.value); }} />
                                  <input className={inputBase} placeholder="Duration" value={service.duration} onChange={function(e) { updateService(service.id, 'duration', e.target.value); }} />
                                </div>
                                <textarea className={inputBase + " h-16 resize-none"} placeholder="Description" value={service.description} onChange={function(e) { updateService(service.id, 'description', e.target.value); }} />
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
                                <div className="grid grid-cols-3 gap-2">
                                  {(service.images || []).map(function(img, idx) {
                                    return (
                                      <div key={idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                                        <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                                        <button type="button" onClick={function() { removeServiceImage(service.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                                      </div>
                                    );
                                  })}
                                  {(service.images || []).length < 3 && (
                                    <button type="button" onClick={function() { handleServiceImageUpload(service); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all">
                                      <span className="text-xs">+ Photos</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {carsEnabled && (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={sectionTitle}>Cars</p>
                          <p className={sectionDesc}>Add vehicles for rent or sale.</p>
                        </div>
                        <button type="button" onClick={addCar} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add</button>
                      </div>
                      <div className="space-y-4">
                        {cars.map(function(car) {
                          return (
                            <div key={car.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
                              <button type="button" onClick={function() { removeCar(car.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">✕</button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold text-zinc-400">Type</label>
                                  <div className="flex gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                      <input type="radio" name={"type-" + car.id} checked={car.type === 'rent'} onChange={function() { updateCar(car.id, 'type', 'rent'); }} className="accent-white" /> Rent
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                      <input type="radio" name={"type-" + car.id} checked={car.type === 'sale'} onChange={function() { updateCar(car.id, 'type', 'sale'); }} className="accent-white" /> Sale
                                    </label>
                                  </div>
                                  <input className={inputBase} placeholder="Car Name" value={car.name} onChange={function(e) { updateCar(car.id, 'name', e.target.value); }} />
                                  <input className={inputBase} placeholder="Year" type="number" value={car.year} onChange={function(e) { updateCar(car.id, 'year', e.target.value); }} />
                                </div>
                                <div className="space-y-2">
                                  <input className={inputBase} placeholder="Price (₦)" type="number" value={car.price} onChange={function(e) { updateCar(car.id, 'price', e.target.value); }} />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input className={inputBase} placeholder="Mileage" value={car.mileage} onChange={function(e) { updateCar(car.id, 'mileage', e.target.value); }} />
                                    <input className={inputBase} placeholder="Transmission" value={car.transmission} onChange={function(e) { updateCar(car.id, 'transmission', e.target.value); }} />
                                  </div>
                                  <input className={inputBase} placeholder="Fuel Type" value={car.fuel} onChange={function(e) { updateCar(car.id, 'fuel', e.target.value); }} />
                                </div>
                              </div>
                              <textarea className={inputBase + " h-16 resize-none mt-2"} placeholder="Description" value={car.description} onChange={function(e) { updateCar(car.id, 'description', e.target.value); }} />
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
                                <div className="grid grid-cols-3 gap-2">
                                  {(car.images || []).map(function(img, idx) {
                                    return (
                                      <div key={idx} className="aspect-video bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                                        <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                                        <button type="button" onClick={function() { setCarImages(car.id, car.images.filter(function(_, i) { return i !== idx; })); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                                      </div>
                                    );
                                  })}
                                  <button type="button" onClick={function() { handleCarImageUpload(car); }} className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all">
                                    <span className="text-xs">+ Photos</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {foodEnabled && (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={sectionTitle}>Food Menu</p>
                          <p className={sectionDesc}>Add menu items with variations.</p>
                        </div>
                        <button type="button" onClick={addFood} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add</button>
                      </div>
                      <div className="space-y-4">
                        {foods.map(function(item) {
                          return (
                            <div key={item.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
                              <button type="button" onClick={function() { removeFood(item.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 z-10">✕</button>
                              <div className="space-y-2">
                                <input className={inputBase} placeholder="Food Name" value={item.name} onChange={function(e) { updateFood(item.id, 'name', e.target.value); }} />
                                <input className={inputBase} placeholder="Price (₦)" type="number" value={item.price} onChange={function(e) { updateFood(item.id, 'price', e.target.value); }} />
                                <textarea className={inputBase + " h-16 resize-none"} placeholder="Description" value={item.description} onChange={function(e) { updateFood(item.id, 'description', e.target.value); }} />
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
                                <div className="grid grid-cols-3 gap-2">
                                  {(item.images || []).map(function(img, idx) {
                                    return (
                                      <div key={idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                                        <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                                        <button type="button" onClick={function() { removeFoodImage(item.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 text-xs">✕</button>
                                      </div>
                                    );
                                  })}
                                  {(item.images || []).length < 3 && (
                                    <button type="button" onClick={function() { handleFoodImageUpload(item); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all">
                                      <span className="text-xs">+ Photos</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-zinc-700">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Variations & Addons</span>
                                  <button type="button" onClick={function() { addFoodAddonGroup(item.id); }} className="text-xs text-white hover:text-zinc-300 font-medium transition-colors">+ Add Group</button>
                                </div>
                                {item.addons && item.addons.length > 0 && (
                                  <div className="space-y-3">
                                    {item.addons.map(function(addon) {
                                      return (
                                        <div key={addon.id} className="bg-zinc-800 rounded-xl border border-zinc-700 p-3 space-y-2">
                                          <div className="flex items-center gap-2">
                                            <input className={inputBase + " flex-1 font-medium"} placeholder="Group Name (e.g. Size)" value={addon.label} onChange={function(e) { updateFoodAddonGroup(item.id, addon.id, 'label', e.target.value); }} />
                                            <select className={selectBase + " w-24"} value={addon.type} onChange={function(e) { updateFoodAddonGroup(item.id, addon.id, 'type', e.target.value); }}>
                                              <option value="single" className="bg-zinc-800">Single</option>
                                              <option value="multi" className="bg-zinc-800">Multi</option>
                                            </select>
                                            <button type="button" onClick={function() { removeFoodAddonGroup(item.id, addon.id); }} className="text-zinc-500 hover:text-red-400 transition-colors p-1 shrink-0">
                                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                          </div>
                                          <div className="space-y-2 pl-1 border-l-2 border-zinc-700 ml-1">
                                            {addon.options.map(function(opt, optIdx) {
                                              return (
                                                <div key={optIdx} className="flex items-center gap-2">
                                                  <input className={inputBase + " flex-1 py-2.5 text-sm"} placeholder="Option name" value={opt.name} onChange={function(e) { updateFoodAddonOption(item.id, addon.id, optIdx, 'name', e.target.value); }} />
                                                  <div className="relative w-24 shrink-0">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">+₦</span>
                                                    <input type="number" className={inputBase + " pl-7 py-2.5 text-sm"} placeholder="0" value={opt.price || ''} onChange={function(e) { updateFoodAddonOption(item.id, addon.id, optIdx, 'price', e.target.value); }} />
                                                  </div>
                                                  <button type="button" onClick={function() { removeFoodAddonOption(item.id, addon.id, optIdx); }} className="text-zinc-500 hover:text-red-400 transition-colors p-1 shrink-0">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                  </button>
                                                </div>
                                              );
                                            })}
                                            <button type="button" onClick={function() { addFoodAddonOption(item.id, addon.id); }} className="w-full py-2 text-xs text-zinc-400 hover:text-white font-medium transition-colors flex items-center justify-center gap-1 rounded-lg hover:bg-zinc-700">+ Add Option</button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── STEP 4: PRODUCTS ── */}
              {isProductsStep && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={sectionTitle}>Products</p>
                      <p className={sectionDesc}>
                        {businessType === 'Fashion' 
                          ? 'Add your clothing & accessories. Include sizes and colors.' 
                          : 'Items you sell.'}
                      </p>
                    </div>
                    <button type="button" onClick={addProduct} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add</button>
                  </div>
                  <div className="space-y-4">
                    {products.map(function(product) {
                      return (
                        <div key={product.id} className="relative p-4 rounded-xl border border-zinc-700 bg-zinc-800/50">
                          <button type="button" onClick={function() { removeProduct(product.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">✕</button>
                          <div className="space-y-2">
                            <input className={inputBase} placeholder="Product Name" value={product.name} onChange={function(e) { updateProduct(product.id, 'name', e.target.value); }} />
                            <input className={inputBase} placeholder="Price (₦)" type="number" value={product.price} onChange={function(e) { updateProduct(product.id, 'price', e.target.value); }} />
                            <textarea className={inputBase + " h-16 resize-none"} placeholder="Description" value={product.description} onChange={function(e) { updateProduct(product.id, 'description', e.target.value); }} />
                            
                            <input 
                              className={inputBase} 
                              placeholder="Sizes (comma separated, e.g. S, M, L, XL)" 
                              value={(product.sizes || []).join(', ')} 
                              onChange={function(e) { updateProductSizes(product.id, e.target.value); }} 
                            />
                            <input 
                              className={inputBase} 
                              placeholder="Colors (comma separated, e.g. Red, Blue, Black)" 
                              value={(product.colors || []).join(', ')} 
                              onChange={function(e) { updateProductColors(product.id, e.target.value); }} 
                            />
                          </div>
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-zinc-400 mb-2">Images (Max 3)</p>
                            <div className="grid grid-cols-3 gap-2">
                              {(product.images || []).map(function(img, idx) {
                                return (
                                  <div key={idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group">
                                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                                    <button type="button" onClick={function() { removeProductImage(product.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                                  </div>
                                );
                              })}
                              {(product.images || []).length < 3 && (
                                <button type="button" onClick={function() { handleProductImageUpload(product); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:text-zinc-300 transition-all">
                                  <span className="text-xs">+ Photos</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── REVIEW STEP ── */}
              {isReviewStep && (
                <div className="space-y-5">
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                    <h3 className="text-sm font-semibold text-white mb-3">Review Your Setup</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-zinc-700">
                        <span className="text-zinc-400">Business</span>
                        <span className="text-white font-medium">{businessName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-700">
                        <span className="text-zinc-400">Slug</span>
                        <span className="text-white font-mono text-xs">{businessSlug}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-700">
                        <span className="text-zinc-400">Type</span>
                        <span className="text-white font-medium">{businessType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-700">
                        <span className="text-zinc-400">Gallery Groups</span>
                        <span className="text-white font-medium">{gallery.length} groups ({totalGalleryImages} photos)</span>
                      </div>
                      
                      {servicesEnabled && (
                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Services</span>
                          <span className="text-white font-medium">{services.filter(s => s.name).length} items</span>
                        </div>
                      )}
                      {productsEnabled && (
                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Products</span>
                          <span className="text-white font-medium">{products.filter(p => p.name).length} items</span>
                        </div>
                      )}
                      {carsEnabled && (
                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Cars</span>
                          <span className="text-white font-medium">{cars.filter(c => c.name).length} vehicles</span>
                        </div>
                      )}
                      {foodEnabled && (
                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Menu Items</span>
                          <span className="text-white font-medium">{foods.filter(f => f.name).length} items</span>
                        </div>
                      )}
                      {propertiesEnabled && (
                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Properties</span>
                          <span className="text-white font-medium">{properties.filter(p => p.name).length} listings</span>
                        </div>
                      )}

                      <div className="flex justify-between py-2">
                        <span className="text-zinc-400">Security</span>
                        <span className="text-green-400 font-medium">✓ Configured</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/40 border border-red-700 rounded-xl p-3">
                      <p className="text-xs text-red-300">{error}</p>
                    </div>
                  )}

                  <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-4">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      By clicking "Finish Setup", you confirm that all information is accurate. Your business will be live within 24 hours after payment verification.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-800/50 flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-white hover:bg-zinc-200 text-zinc-900 py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  Continue
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-white hover:bg-zinc-200 text-zinc-900 py-3 rounded-xl text-sm font-semibold transition-all disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Finish Setup'
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-zinc-200 pt-12 pb-8 px-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <Link to="/" className="flex items-center">
                <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-10 w-auto object-contain" />
              </Link>
            </div>
            <div className="flex gap-10 text-sm">
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</p>
                <ul className="space-y-2">
                  <li><Link to="/#pricing" className="text-zinc-600 hover:text-zinc-900 transition-colors">Pricing</Link></li>
                  <li><Link to="/#features" className="text-zinc-600 hover:text-zinc-900 transition-colors">Features</Link></li>
                  <li><Link to="/signup" className="text-zinc-600 hover:text-zinc-900 transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Partners</p>
                <ul className="space-y-2">
                  <li><Link to="/affiliate-signup" className="text-zinc-700 font-medium hover:text-zinc-900 transition-colors">Affiliate</Link></li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Company</p>
                <ul className="space-y-2">
                  <li><Link to="/blog" className="text-zinc-600 hover:text-zinc-900 transition-colors">Blog</Link></li>
                  <li><Link to="/privacy" className="text-zinc-600 hover:text-zinc-900 transition-colors">Privacy</Link></li>
                  <li><Link to="/terms" className="text-zinc-600 hover:text-zinc-900 transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row justify-between gap-4 items-center">
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
            <div className="flex gap-4 text-sm text-zinc-500">
              <Link to="/terms" className="hover:text-zinc-700 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-zinc-700 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}