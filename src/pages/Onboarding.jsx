import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

export default function Onboarding() {
  const location = useLocation();
  const navigate = useNavigate();

  var bizData = location.state;
  var businessName = (bizData && bizData.businessName) ? bizData.businessName : 'New Business';
  var businessSlug = (bizData && bizData.businessSlug) ? bizData.businessSlug : 'new-business';
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

  var isAutoBusiness = businessType === 'Auto' || businessType === 'Auto Dealer / Rental';
  var isFoodBusiness = businessType === 'Restaurant' || businessType === 'Restaurant / Food';

  var loadingArr = useState(false);
  var loading = loadingArr[0];
  var setLoading = loadingArr[1];
  var errorArr = useState('');
  var errorMsg = errorArr[0];
  var setError = errorArr[1];

  var galleryArr = useState([{ id: 'default', group: 'Gallery', images: [] }]);
  var gallery = galleryArr[0];
  var setGallery = galleryArr[1];

  var servicesArr = useState([{ id: 1, name: '', duration: '', price: '', description: '', image: '', images: [] }]);
  var services = servicesArr[0];
  var setServices = servicesArr[1];

  var productsArr = useState([{ id: 1, name: '', price: '', description: '', image: '', images: [] }]);
  var products = productsArr[0];
  var setProducts = productsArr[1];

  var carsArr = useState([]);
  var cars = carsArr[0];
  var setCars = carsArr[1];

  var foodsArr = useState([]);
  var foods = foodsArr[0];
  var setFoods = foodsArr[1];

  var CLOUD_NAME = 'deexaiik4';
  var UPLOAD_PRESET = 'BizUploads';

  useEffect(function() {
    if (!window.cloudinary) {
      var s = document.createElement('script');
      s.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  function handleUpload(onSuccess, isMultiple) {
    if (!window.cloudinary) {
      alert('Widget is still loading.');
      return;
    }
    if (isMultiple === undefined) isMultiple = false;
    var uploadedUrls = [];

    var widget = window.cloudinary.createUploadWidget({
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      sources: ['local', 'url', 'camera'],
      multiple: isMultiple,
      maxFiles: isMultiple ? 10 : 1
    }, function(err, res) {
      if (err) return;
      if (!isMultiple && res.event === 'success') {
        if (res.info && res.info.secure_url && typeof onSuccess === 'function') {
          onSuccess(res.info.secure_url);
        }
      }
      if (isMultiple && res.event === 'success') {
        var url = res.info && res.info.secure_url;
        if (url && uploadedUrls.indexOf(url) === -1) {
          uploadedUrls.push(url);
          onSuccess(url);
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
            onSuccess(newUrls[j]);
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
    }, true);
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
      var current = service.images || [];
      if (current.length < 3) {
        var newImages = current.concat([url]);
        setServices(function(p) {
          return p.map(function(s) {
            if (s.id !== service.id) return s;
            return Object.assign({}, s, { images: newImages, image: newImages[0] });
          });
        });
      } else {
        alert("Max 3 images");
      }
    });
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
      return p.concat([{ id: Date.now(), name: '', price: '', description: '', image: '', images: [] }]);
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

  function handleProductImageUpload(product) {
    handleUpload(function(url) {
      var current = product.images || [];
      if (current.length < 3) {
        var newImages = current.concat([url]);
        setProducts(function(p) {
          return p.map(function(pr) {
            if (pr.id !== product.id) return pr;
            return Object.assign({}, pr, { images: newImages, image: newImages[0] });
          });
        });
      } else {
        alert("Max 3 images");
      }
    });
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
      var current = car.images || [];
      if (current.length < 3) {
        setCarImages(car.id, current.concat([url]));
      } else {
        alert("Max 3 images");
      }
    });
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
      var current = food.images || [];
      if (current.length < 3) {
        var newImages = current.concat([url]);
        setFoods(function(p) {
          return p.map(function(f) {
            if (f.id !== food.id) return f;
            return Object.assign({}, f, { images: newImages, image: newImages[0] });
          });
        });
      } else {
        alert("Max 3 images");
      }
    });
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

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    var honeypot = document.getElementById('formspree_gotcha');
    if (honeypot && honeypot.value) {
      setLoading(false);
      return;
    }

    function clean(val) {
      if (!val) return 0;
      var str = val.toString();
      var cleaned = str.replace(/,/g, '');
      return parseInt(cleaned) || 0;
    }

    // ─── JS Object Literal Formatters ───
    function esc(val) {
      if (val === undefined || val === null) return '';
      return String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    function q(val) {
      return "'" + esc(val) + "'";
    }

    function strArr(arr) {
      if (!arr || arr.length === 0) return '[]';
      return '[' + arr.map(function(s) { return q(s); }).join(', ') + ']';
    }

    function galleryStr(arr) {
      if (!arr || arr.length === 0) return '[]';
      var items = arr.map(function(g) {
        return '{ group: ' + q(g.group) + ', images: ' + strArr(g.images) + ' }';
      });
      return '[\n      ' + items.join(',\n      ') + ',\n    ]';
    }

    function serviceStr(s, slug) {
      return '      {\n' +
        '        id: ' + q(slug + '-' + s.id) + ', name: ' + q(s.name) + ', duration: ' + q(s.duration) + ', price: ' + clean(s.price) + ', image: ' + q(s.image) + ',\n' +
        '        images: ' + strArr(s.images || []) + ',\n' +
        '        showDetails: true,\n' +
        '        description: ' + q(s.description) + '\n' +
        '      }';
    }

    function productStr(p, slug) {
      return '      {\n' +
        '        id: ' + q(slug + '-' + p.id) + ', name: ' + q(p.name) + ', price: ' + clean(p.price) + ', image: ' + q(p.image) + ',\n' +
        '        showDetails: true,\n' +
        '        description: ' + q(p.description) + '\n' +
        '      }';
    }

    function carStr(c, slug) {
      var img = c.images && c.images.length > 0 ? c.images[0] : '';
      return '      {\n' +
        '        id: ' + q(slug + '-' + c.id) + ',\n' +
        '        type: ' + q(c.type) + ',\n' +
        '        name: ' + q(c.name) + ',\n' +
        '        year: ' + (parseInt(c.year) || new Date().getFullYear()) + ',\n' +
        '        price: ' + clean(c.price) + ',\n' +
        '        mileage: ' + q(c.mileage) + ',\n' +
        '        transmission: ' + q(c.transmission) + ',\n' +
        '        fuel: ' + q(c.fuel) + ',\n' +
        '        description: ' + q(c.description) + ',\n' +
        '        image: ' + q(img) + ',\n' +
        '        images: ' + strArr(c.images || []) + '\n' +
        '      }';
    }

    function foodStr(f, slug) {
      var parts = [];
      parts.push('id: ' + q(slug + '-' + f.id));
      parts.push('name: ' + q(f.name));
      parts.push('price: ' + clean(f.price));
      parts.push('image: ' + q(f.image));
      parts.push('description: ' + q(f.description));

      if (f.addons && f.addons.length > 0) {
        var validAddons = [];
        for (var i = 0; i < f.addons.length; i++) {
          var a = f.addons[i];
          if (a.label.trim() && a.options && a.options.length > 0) {
            var optArr = [];
            for (var j = 0; j < a.options.length; j++) {
              if (a.options[j].name.trim()) {
                optArr.push({ name: a.options[j].name.trim(), price: clean(a.options[j].price) });
              }
            }
            if (optArr.length > 0) {
              validAddons.push({ id: a.id, label: a.label.trim(), type: a.type, options: optArr });
            }
          }
        }
        if (validAddons.length > 0) {
          var addonLines = validAddons.map(function(a) {
            var optStrs = a.options.map(function(o) {
              return '{ name: ' + q(o.name) + ', price: ' + o.price + ' }';
            });
            return '          {\n' +
              '            id: ' + q(a.id) + ',\n' +
              '            label: ' + q(a.label) + ',\n' +
              '            type: ' + q(a.type) + ', \n' +
              '            options: [\n              ' + optStrs.join(',\n              ') + '\n            ]\n' +
              '          }';
          });
          parts.push('addons: [\n' + addonLines.join(',\n') + '\n        ]');
        }
      }

      var propsStr = parts.map(function(p, idx) {
        var comma = idx < parts.length - 1 ? ',' : '';
        return '        ' + p + comma;
      }).join('\n');

      return '      {\n' + propsStr + '\n      }';
    }

    // ─── Build the data ───

    var servicesData = services.filter(function(s) { return s.name; });
    var productsData = products.filter(function(p) { return p.name; });
    var carsData = isAutoBusiness ? cars.filter(function(c) { return c.name; }) : [];
    var foodsData = isFoodBusiness ? foods.filter(function(f) { return f.name; }) : [];

    var galleryJson = gallery
      .filter(function(g) { return g.group.trim() && g.images.length > 0; })
      .map(function(g) { return { group: g.group.trim(), images: g.images }; });
    var finalGallery = galleryJson.length > 0 ? galleryJson : [{ group: 'Gallery', images: [] }];

    // ─── Build the JS object literal block ───

    var lines = [];
    lines.push("  '" + esc(businessSlug) + "': {");
    lines.push('    name: ' + q(businessName) + ',');
    lines.push('    slug: ' + q(businessSlug) + ',');
    lines.push('    logo: ' + q(logoUrl) + ',');
    lines.push('    tagline: ' + q('A professional ' + businessType + ' in Lagos') + ',');
    lines.push('    bio: ' + q(bio) + ',');
    lines.push('    phone: ' + q(phone) + ',');
    lines.push('    whatsapp: ' + q(whatsapp) + ',');
    lines.push('    email: ' + q(email) + ',');
    lines.push('    location: ' + q(locationAddr) + ',');
    lines.push("    hours: 'Mon\u2013Sun, 9 AM \u2013 6 PM',");
    lines.push('    accent: ' + q(brandColor) + ',');
    lines.push("    avatar: '',");
    lines.push('    hero: ' + q('https://picsum.photos/seed/' + businessSlug + '/800/600') + ',');
    lines.push('    gallery: ' + galleryStr(finalGallery) + ',');
    lines.push('    socials: { instagram: ' + q(instagram) + ', tiktok: ' + q(tiktok) + ' },');
    lines.push('    paystackPublicKey: PLATFORM_PAYSTACK_KEY,');
    lines.push('    subaccountCode: ' + q(subaccountCode) + ',');
    lines.push('    calendarId: ' + q(email) + ',');
    lines.push('    active: true,');
    lines.push('    adsEnabled: true,');
    lines.push('    carsEnabled: ' + isAutoBusiness + ',');
    lines.push('    servicesEnabled: ' + !isAutoBusiness + ',');
    lines.push('    productsEnabled: ' + !isAutoBusiness + ',');
    lines.push('    foodEnabled: ' + isFoodBusiness + ',');

    if (servicesData.length > 0) {
      lines.push('    services: [');
      lines.push(servicesData.map(function(s) { return serviceStr(s, businessSlug); }).join(',\n'));
      lines.push('    ],');
    } else {
      lines.push('    services: [],');
    }

    if (productsData.length > 0) {
      lines.push('    products: [');
      lines.push(productsData.map(function(p) { return productStr(p, businessSlug); }).join(',\n'));
      lines.push('    ],');
    } else {
      lines.push('    products: [],');
    }

    if (carsData.length > 0) {
      lines.push('    cars: [');
      lines.push(carsData.map(function(c) { return carStr(c, businessSlug); }).join(',\n'));
      lines.push('    ],');
    } else {
      lines.push('    cars: [],');
    }

    if (foodsData.length > 0) {
      lines.push('    food: [');
      lines.push(foodsData.map(function(f) { return foodStr(f, businessSlug); }).join(',\n'));
      lines.push('    ]');
    } else {
      lines.push('    food: []');
    }

    lines.push('  },');

    var completeHeaderBlock = lines.join('\n');

    // ─── Build FormData (Summary ONLY for email notification) ───
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

    // ─── Send Both Requests Concurrently ───
    Promise.all([
      // 1. Send lightweight summary to Formspree (won't trigger spam filters)
      fetch('https://formspree.io/f/xyklbbqy', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).catch(function(err) {
        // Don't crash if email fails, just log it
        console.warn('Formspree email notification failed:', err);
        return { ok: true }; 
      }),

      // 2. Send full config to Netlify Function to commit to GitHub
      fetch('/.netlify/functions/save-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: businessSlug,
          config: completeHeaderBlock
        })
      })
    ])
    .then(function(results) {
      // We only care if the GitHub save (index 1) succeeded
      return results[1].json();
    })
    .then(function(data) {
      if (data.ok) {
        navigate('/onboarding-success');
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

  var inputBase = "w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all";
  var selectBase = "w-full appearance-none bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-purple-600 transition-all cursor-pointer";
  var sectionTitle = "text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 mt-6";
  var sectionDesc = "text-xs text-zinc-400 mb-3 -mt-1";

  var totalGalleryImages = 0;
  for (var gi = 0; gi < gallery.length; gi++) {
    totalGalleryImages += gallery[gi].images.length;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Setup {businessName}</h1>
          <p className="text-zinc-500">Add your inventory, services, cars, and food.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* HONEYPOT */}
          <input
            type="text"
            id="formspree_gotcha"
            name="_gotcha"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* GALLERY */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className={sectionTitle}>Gallery Images</h2>
              <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 px-2 py-0.5 rounded-full">
                {totalGalleryImages} photo{totalGalleryImages !== 1 ? 's' : ''}
              </span>
            </div>
            <p className={sectionDesc}>Organise your photos into groups.</p>
            <div className="space-y-6">
              {gallery.map(function(group) {
                return (
                  <div key={group.id} className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50">
                    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-zinc-100">
                      <input
                        type="text"
                        value={group.group}
                        onChange={function(e) { updateGroupName(group.id, e.target.value); }}
                        placeholder="Group name (e.g. Our Work)"
                        className="flex-1 text-sm font-semibold text-zinc-800 bg-transparent border-0 focus:outline-none placeholder-zinc-400"
                      />
                      {group.images.length > 0 && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{group.images.length}</span>
                      )}
                      <button type="button" onClick={function() { removeGroup(group.id); }} className="text-zinc-300 hover:text-red-500 transition-colors p-1">✕</button>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {group.images.map(function(img, imgIdx) {
                          return (
                            <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 group">
                              <img src={img} className="w-full h-full object-cover" alt="" />
                              <button type="button" onClick={function() { removeGalleryImage(group.id, imgIdx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 text-xs">✕</button>
                            </div>
                          );
                        })}
                        <button type="button" onClick={function() { handleGalleryUpload(group.id); }} className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-all">
                          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          <span className="text-[10px]">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={addGroup} className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 text-xs font-semibold hover:border-purple-500 hover:text-purple-500 transition-all flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Add New Group
            </button>
          </div>

          {/* SERVICES */}
          {!isAutoBusiness && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className={sectionTitle}>Services</h2>
                <button type="button" onClick={addService} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add Service</button>
              </div>
              <div className="space-y-6">
                {services.map(function(service) {
                  return (
                    <div key={service.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                      <button type="button" onClick={function() { removeService(service.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500">✕</button>
                      <div className="space-y-2">
                        <input className={inputBase} placeholder="Service Name" value={service.name} onChange={function(e) { updateService(service.id, 'name', e.target.value); }} />
                        <div className="grid grid-cols-2 gap-2">
                          <input className={inputBase} placeholder="Price" type="number" value={service.price} onChange={function(e) { updateService(service.id, 'price', e.target.value); }} />
                          <input className={inputBase} placeholder="Duration" value={service.duration} onChange={function(e) { updateService(service.id, 'duration', e.target.value); }} />
                        </div>
                        <textarea className={inputBase + " h-16 resize-none"} placeholder="Description" value={service.description} onChange={function(e) { updateService(service.id, 'description', e.target.value); }} />
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-zinc-500 mb-2">Images (Max 3)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(service.images || []).map(function(img, idx) {
                            return (
                              <div key={idx} className="aspect-square bg-white border border-zinc-200 rounded-lg overflow-hidden relative group">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <button type="button" onClick={function() { removeServiceImage(service.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                              </div>
                            );
                          })}
                          {(service.images || []).length < 3 && (
                            <button type="button" onClick={function() { handleServiceImageUpload(service); }} className="aspect-square bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center hover:border-purple-500 hover:text-purple-500 transition-all">
                              <span className="text-xs">+ Add Photo</span>
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

          {/* PRODUCTS */}
          {!isAutoBusiness && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className={sectionTitle}>Products</h2>
                <button type="button" onClick={addProduct} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add Product</button>
              </div>
              <div className="space-y-6">
                {products.map(function(product) {
                  return (
                    <div key={product.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                      <button type="button" onClick={function() { removeProduct(product.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500">✕</button>
                      <div className="space-y-2">
                        <input className={inputBase} placeholder="Product Name" value={product.name} onChange={function(e) { updateProduct(product.id, 'name', e.target.value); }} />
                        <input className={inputBase} placeholder="Price" type="number" value={product.price} onChange={function(e) { updateProduct(product.id, 'price', e.target.value); }} />
                        <textarea className={inputBase + " h-16 resize-none"} placeholder="Description" value={product.description} onChange={function(e) { updateProduct(product.id, 'description', e.target.value); }} />
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-zinc-500 mb-2">Images (Max 3)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(product.images || []).map(function(img, idx) {
                            return (
                              <div key={idx} className="aspect-square bg-white border border-zinc-200 rounded-lg overflow-hidden relative group">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <button type="button" onClick={function() { removeProductImage(product.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                              </div>
                            );
                          })}
                          {(product.images || []).length < 3 && (
                            <button type="button" onClick={function() { handleProductImageUpload(product); }} className="aspect-square bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center hover:border-purple-500 hover:text-purple-500 transition-all">
                              <span className="text-xs">+ Add Photo</span>
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

          {/* CARS */}
          {isAutoBusiness && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className={sectionTitle}>Cars</h2>
                <button type="button" onClick={addCar} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add Car</button>
              </div>
              <div className="space-y-6">
                {cars.map(function(car) {
                  return (
                    <div key={car.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                      <button type="button" onClick={function() { removeCar(car.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500">✕</button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-500">Type</label>
                          <div className="flex gap-2">
                            <label className="flex items-center gap-1">
                              <input type="radio" name={"type-" + car.id} checked={car.type === 'rent'} onChange={function() { updateCar(car.id, 'type', 'rent'); }} className="accent-purple-600" /> Rent
                            </label>
                            <label className="flex items-center gap-1">
                              <input type="radio" name={"type-" + car.id} checked={car.type === 'sale'} onChange={function() { updateCar(car.id, 'type', 'sale'); }} className="accent-purple-600" /> Sale
                            </label>
                          </div>
                          <input className={inputBase} placeholder="Car Name" value={car.name} onChange={function(e) { updateCar(car.id, 'name', e.target.value); }} />
                          <input className={inputBase} placeholder="Year" type="number" value={car.year} onChange={function(e) { updateCar(car.id, 'year', e.target.value); }} />
                        </div>
                        <div className="space-y-2">
                          <input className={inputBase} placeholder="Daily Rate / Price" type="number" value={car.price} onChange={function(e) { updateCar(car.id, 'price', e.target.value); }} />
                          <div className="grid grid-cols-2 gap-2">
                            <input className={inputBase} placeholder="Mileage" value={car.mileage} onChange={function(e) { updateCar(car.id, 'mileage', e.target.value); }} />
                            <input className={inputBase} placeholder="Transmission" value={car.transmission} onChange={function(e) { updateCar(car.id, 'transmission', e.target.value); }} />
                          </div>
                          <input className={inputBase} placeholder="Fuel" value={car.fuel} onChange={function(e) { updateCar(car.id, 'fuel', e.target.value); }} />
                        </div>
                      </div>
                      <textarea className={inputBase + " h-16 resize-none mt-2"} placeholder="Description" value={car.description} onChange={function(e) { updateCar(car.id, 'description', e.target.value); }} />
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-zinc-500 mb-2">Images (Max 3)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(car.images || []).map(function(img, idx) {
                            return (
                              <div key={idx} className="aspect-video bg-white border border-zinc-200 rounded-lg overflow-hidden relative group">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <button type="button" onClick={function() { setCarImages(car.id, car.images.filter(function(_, i) { return i !== idx; })); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                              </div>
                            );
                          })}
                          <button type="button" onClick={function() { handleCarImageUpload(car); }} className="aspect-video bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center hover:border-purple-500 hover:text-purple-500 transition-all">
                            <span className="text-xs">+ Add Photo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FOOD MENU */}
          {isFoodBusiness && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className={sectionTitle}>Food Menu</h2>
                <button type="button" onClick={addFood} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add Food Item</button>
              </div>
              <div className="space-y-6">
                {foods.map(function(item) {
                  return (
                    <div key={item.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                      <button type="button" onClick={function() { removeFood(item.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 z-10">✕</button>
                      <div className="space-y-2">
                        <input className={inputBase} placeholder="Food Name" value={item.name} onChange={function(e) { updateFood(item.id, 'name', e.target.value); }} />
                        <input className={inputBase} placeholder="Price" type="number" value={item.price} onChange={function(e) { updateFood(item.id, 'price', e.target.value); }} />
                        <textarea className={inputBase + " h-16 resize-none"} placeholder="Description / Addons Info" value={item.description} onChange={function(e) { updateFood(item.id, 'description', e.target.value); }} />
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-zinc-500 mb-2">Images (Max 3)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(item.images || []).map(function(img, idx) {
                            return (
                              <div key={idx} className="aspect-square bg-white border border-zinc-200 rounded-lg overflow-hidden relative group">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <button type="button" onClick={function() { removeFoodImage(item.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                              </div>
                            );
                          })}
                          {(item.images || []).length < 3 && (
                            <button type="button" onClick={function() { handleFoodImageUpload(item); }} className="aspect-square bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center hover:border-purple-500 hover:text-purple-500 transition-all">
                              <span className="text-xs">+ Add Photo</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ADDONS */}
                      <div className="mt-4 pt-4 border-t border-zinc-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Variations &amp; Addons</span>
                          <button type="button" onClick={function() { addFoodAddonGroup(item.id); }} className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors">+ Add Group</button>
                        </div>
                        {item.addons && item.addons.length > 0 && (
                          <div className="space-y-4">
                            {item.addons.map(function(addon) {
                              return (
                                <div key={addon.id} className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <input className={inputBase + " flex-1 font-medium"} placeholder="Group Name (e.g. Size, Toppings)" value={addon.label} onChange={function(e) { updateFoodAddonGroup(item.id, addon.id, 'label', e.target.value); }} />
                                    <select className={selectBase + " w-28"} value={addon.type} onChange={function(e) { updateFoodAddonGroup(item.id, addon.id, 'type', e.target.value); }}>
                                      <option value="single">Single</option>
                                      <option value="multi">Multi</option>
                                    </select>
                                    <button type="button" onClick={function() { removeFoodAddonGroup(item.id, addon.id); }} className="text-zinc-300 hover:text-red-500 transition-colors p-1 shrink-0" title="Delete group">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 -mt-1 ml-1">
                                    {addon.type === 'single' ? 'Customer can select ONE option' : 'Customer can select MULTIPLE options'}
                                  </p>
                                  <div className="space-y-2 pl-1 border-l-2 border-zinc-100 ml-1">
                                    {addon.options.map(function(opt, optIdx) {
                                      return (
                                        <div key={optIdx} className="flex items-center gap-2">
                                          <input className={inputBase + " flex-1 py-2.5 text-sm"} placeholder="Option name" value={opt.name} onChange={function(e) { updateFoodAddonOption(item.id, addon.id, optIdx, 'name', e.target.value); }} />
                                          <div className="relative w-24 shrink-0">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">+&#8358;</span>
                                            <input type="number" className={inputBase + " pl-8 py-2.5 text-sm"} placeholder="0" value={opt.price || ''} onChange={function(e) { updateFoodAddonOption(item.id, addon.id, optIdx, 'price', e.target.value); }} />
                                          </div>
                                          <button type="button" onClick={function() { removeFoodAddonOption(item.id, addon.id, optIdx); }} className="text-zinc-300 hover:text-red-500 transition-colors p-1 shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                          </button>
                                        </div>
                                      );
                                    })}
                                    <button type="button" onClick={function() { addFoodAddonOption(item.id, addon.id); }} className="w-full py-2 text-xs text-zinc-400 hover:text-purple-600 font-medium transition-colors flex items-center justify-center gap-1 rounded-lg hover:bg-zinc-50">+ Add Option</button>
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
            </div>
          )}

          {/* SUBMIT */}
          <div className="sticky bottom-6 z-10">
            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:bg-zinc-400 disabled:scale-100">
              {loading ? 'Saving...' : 'Finish Setup'}
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-100 text-red-600 rounded-xl text-center text-sm">{errorMsg}</div>
          )}
        </form>
      </div>
    </div>
  );
}