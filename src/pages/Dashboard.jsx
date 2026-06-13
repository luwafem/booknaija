import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import LocationPicker from '../components/LocationPicker';

var CLOUD_NAME = 'deexaiik4';
var UPLOAD_PRESET = 'BizUploads';

// ─── OPTIMIZE CLOUDINARY URLs FOR INSTANT LOADING ───
function optimizeCloudinaryUrl(url) {
  if (!url || url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

export default function Dashboard() {
  var params = useParams();
  var navigate = useNavigate();
  var slug = params.slug;

  var result = useBusiness(slug);
  var initialBiz = result.business;
  var loading = result.loading;

  var bizArr = useState(null);
  var biz = bizArr[0];
  var setBiz = bizArr[1];

  var tabArr = useState('info');
  var activeTab = tabArr[0];
  var setActiveTab = tabArr[1];

  var savingArr = useState(false);
  var saving = savingArr[0];
  var setSaving = savingArr[1];

  var savedArr = useState(false);
  var saved = savedArr[0];
  var setSaved = savedArr[1];

  var errorArr = useState('');
  var errorMsg = errorArr[0];
  var setError = errorArr[1];

  var showTogglesArr = useState(false);
  var showToggles = showTogglesArr[0];
  var setShowToggles = showTogglesArr[1];

  var clickCountArr = useRef(0);
  var clickTimerArr = useRef(null);

  var copiedArr = useState(false);
  var copied = copiedArr[0];
  var setCopied = copiedArr[1];

  var urlCopiedArr = useState(false);
  var urlCopied = urlCopiedArr[0];
  var setUrlCopied = urlCopiedArr[1];

  var showMapPickerArr = useState(false);
  var showMapPicker = showMapPickerArr[0];
  var setShowMapPicker = showMapPickerArr[1];

  var subLoadingArr = useState(false);
  var subLoading = subLoadingArr[0];
  var setSubLoading = subLoadingArr[1];

  var subMsgArr = useState('');
  var subMsg = subMsgArr[0];
  var setSubMsg = subMsgArr[1];

  var bankUpdatingArr = useState(false);
  var bankUpdating = bankUpdatingArr[0];
  var setBankUpdating = bankUpdatingArr[1];

  var bankUpdateErrorArr = useState('');
  var bankUpdateError = bankUpdateErrorArr[0];
  var setBankUpdateError = bankUpdateErrorArr[1];

  var bankUpdateSuccessArr = useState(false);
  var bankUpdateSuccess = bankUpdateSuccessArr[0];
  var setBankUpdateSuccess = bankUpdateSuccessArr[1];

  var bankNameArr = useState('');
  var bankName = bankNameArr[0];
  var setBankName = bankNameArr[1];

  var bankCodeArr = useState('');
  var bankCode = bankCodeArr[0];
  var setBankCode = bankCodeArr[1];

  var bankAccArr = useState('');
  var bankAcc = bankAccArr[0];
  var setBankAcc = bankAccArr[1];

  var banksArr = useState([]);
  var banks = banksArr[0];
  var setBanks = banksArr[1];

  var offlineBookingsArr = useState([]);
  var offlineBookings = offlineBookingsArr[0];
  var setOfflineBookings = offlineBookingsArr[1];

  var offlineLoadingArr = useState(false);
  var offlineLoading = offlineLoadingArr[0];
  var setOfflineLoading = offlineLoadingArr[1];

  var idCounter = useRef(0);
  function uid(prefix) {
    idCounter.current++;
    return (prefix || '') + Date.now().toString(36) + idCounter.current.toString(36);
  }

  useEffect(function () {
    if (!loading && biz) {
      var authStatus = sessionStorage.getItem('biz_auth_' + slug);
      if (!authStatus) {
        navigate('/dashboard');
      }
    }
  }, [loading, biz, slug, navigate]);

  useEffect(function () {
    if (initialBiz) {
      setBiz(JSON.parse(JSON.stringify(initialBiz)));
      setActiveTab('info');
      setShowToggles(false);
      clickCountArr.current = 0;
    }
  }, [initialBiz]);

  useEffect(function() {
    if (activeTab === 'offline-payments' && biz) {
      setOfflineLoading(true);
      fetch('/.netlify/functions/get-offline-bookings?slug=' + biz.slug)
        .then(function(res) { return res.json(); })
        .then(function(data) { 
          setOfflineBookings(data.bookings || []); 
        })
        .catch(function(err) { 
          console.error('Failed to load bookings:', err); 
        })
        .finally(function() { 
          setOfflineLoading(false); 
        });
    }
  }, [activeTab, biz]);

  useEffect(function() {
    fetch('/.netlify/functions/list-banks')
      .then(function(res) { return res.json(); })
      .then(function(data) { if (Array.isArray(data)) setBanks(data); })
      .catch(function(err) { console.error('Failed to load banks:', err); });
  }, []);

  useEffect(function() {
    const params = new URLSearchParams(window.location.search);
    const subRef = params.get('sub_ref');
    
    if (subRef && biz) {
      setSubLoading(true);
      fetch('/.netlify/functions/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: subRef, slug: slug })
      })
      .then(r => r.json())
      .then(data => {
        if(data.success) {
          setSubMsg('Payment successful! Subscription extended by 30 days.');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setSubMsg('Payment verification failed. Contact support.');
        }
      })
      .catch(() => setSubMsg('Network error verifying payment.'))
      .finally(() => setSubLoading(false));

      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [biz, slug]);

  useEffect(function () {
    if (!window.cloudinary) {
      var s = document.createElement('script');
      s.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  async function handleVerifyOfflinePayment(bookingId) {
    if (!confirm('Are you sure you have received this payment? This will confirm the booking.')) return;
    
    setOfflineLoading(true);
    try {
      const res = await fetch('/.netlify/functions/verify-offline-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, slug: biz.slug })
      });

      if (res.ok) {
        setOfflineBookings(function(prev) {
          return prev.map(function(b) {
            if (b.id === bookingId) return Object.assign({}, b, { status: 'verified' });
            return b;
          });
        });
        alert('Payment verified successfully! Booking confirmed.');
      } else {
        alert('Failed to verify payment. Please try again.');
      }
    } catch (err) {
      alert('Network error verifying payment.');
    } finally {
      setOfflineLoading(false);
    }
  }

  async function handleUpdateBank() {
    if (!bankName.trim()) {
      setBankUpdateError('Please enter the account name.');
      return;
    }
    if (!bankCode) {
      setBankUpdateError('Please select a bank.');
      return;
    }
    if (!/^[0-9]{10}$/.test(bankAcc)) {
      setBankUpdateError('Account number must be exactly 10 digits.');
      return;
    }

    setBankUpdating(true);
    setBankUpdateError('');
    setBankUpdateSuccess(false);

    try {
      const res = await fetch('/.netlify/functions/update-subaccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: biz.slug,
          business_name: biz.name,
          settlement_bank: bankCode,
          account_number: bankAcc,
          account_name: bankName,
          email: biz.email || '',
          phone: biz.phone || ''
        })
      });

      const data = await res.json();

      if (res.ok && (data.ok || data.subaccount_code)) {
        setBankUpdateSuccess(true);
        setBiz(function(p) { return Object.assign({}, p, { subaccount_code: data.subaccount_code || p.subaccount_code }); });
        setTimeout(function() { window.location.reload(); }, 1500);
      } else {
        setBankUpdateError(data.error || 'Verification failed. Please check your details or contact support.');
      }
    } catch (err) {
      setBankUpdateError('Network error. Please try again.');
    } finally {
      setBankUpdating(false);
    }
  }

  var subEndsAt = biz?.subscription_ends_at ? new Date(biz.subscription_ends_at) : null;
  var now = new Date();
  var daysLeft = subEndsAt ? Math.ceil((subEndsAt - now) / (1000 * 60 * 60 * 24)) : null;
  var isExpired = daysLeft !== null && daysLeft <= 0;
  var isWarning = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;

  async function handlePaySubscription() {
    setSubLoading(true);
    setSubMsg('');
    try {
      const res = await fetch('/.netlify/functions/initialize-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug, email: biz.email })
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setSubMsg(data.error || 'Failed to initialize payment.');
        setSubLoading(false);
      }
    } catch (err) {
      setSubMsg('Network error.');
      setSubLoading(false);
    }
  }

  function handleNameClick() {
    clickCountArr.current++;
    if (clickTimerArr.current) clearTimeout(clickTimerArr.current);
    
    clickTimerArr.current = setTimeout(function () {
      clickCountArr.current = 0;
    }, 500);

    if (clickCountArr.current >= 3) {
      clickCountArr.current = 0;
      setShowToggles(function (p) { return !p; });
    }
  }

  function handleCopyReferralLink() {
    var referralUrl = window.location.origin + '/signup?ref=' + biz.slug;
    navigator.clipboard.writeText(referralUrl).then(function () {
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 2500);
    }).catch(function () {
      var textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 2500);
    });
  }

  function handleCopyPageUrl() {
    var pageUrl = window.location.origin + '/' + biz.slug;
    navigator.clipboard.writeText(pageUrl).then(function () {
      setUrlCopied(true);
      setTimeout(function () { setUrlCopied(false); }, 2500);
    }).catch(function () {
      var textArea = document.createElement('textarea');
      textArea.value = pageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setUrlCopied(true);
      setTimeout(function () { setUrlCopied(false); }, 2500);
    });
  }

  function getMapsReadiness() {
    var issues = [];
    if (!biz.name) issues.push('Business Name');
    if (!biz.phone) issues.push('Phone Number');
    if (!biz.location) issues.push('Location');
    if (!biz.email) issues.push('Email');
    return { ready: issues.length === 0, issues: issues };
  }

  function getVisibleTabs() {
    if (!biz) return [];
    var tabs = [
      { id: 'info', label: 'Info' },
      { id: 'security', label: 'Security' },
      { id: 'gallery', label: 'Gallery' },
      { id: 'offline-payments', label: 'Bank Payments' }
    ];
    if (biz.servicesEnabled) tabs.push({ id: 'services', label: 'Services' });
    if (biz.productsEnabled) tabs.push({ id: 'products', label: 'Products' });
    if (biz.carsEnabled) tabs.push({ id: 'cars', label: 'Cars' });
    if (biz.foodEnabled) tabs.push({ id: 'food', label: 'Food' });
    if (biz.propertiesEnabled) tabs.push({ id: 'properties', label: 'Properties' });
    if (biz.estatesEnabled) tabs.push({ id: 'estates', label: 'Estates' });
    return tabs;
  }

  // ─── FASTER UPLOAD: Multi-select, optimized URLs, size limits ───
  function uploadImage(onSuccess, isMultiple, maxImages) {
    if (!window.cloudinary) { alert('Widget loading...'); return; }
    if (isMultiple === undefined) isMultiple = true; 
    if (!maxImages) maxImages = isMultiple ? 10 : 1;
    var urls = [];

    var widget = window.cloudinary.createUploadWidget({
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      sources: ['local', 'url', 'camera'],
      multiple: isMultiple,
      maxFiles: maxImages,
      maxImageFileSize: 10000000, 
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }]
    }, function (err, res) {
      if (err) return;

      if (!isMultiple && res.event === 'success' && res.info.secure_url) {
        onSuccess(optimizeCloudinaryUrl(res.info.secure_url));
      }

      if (isMultiple && res.event === 'success') {
        var u = res.info && res.info.secure_url;
        if (u && urls.indexOf(u) === -1) {
          urls.push(u);
          onSuccess(optimizeCloudinaryUrl(u));
        }
      }

      if (isMultiple && res.event === 'upload-finish' && res.info && res.info.files) {
        res.info.files.forEach(function (f) {
          var u2 = f.uploadInfo && f.uploadInfo.secure_url;
          if (u2 && urls.indexOf(u2) === -1) {
            urls.push(u2);
            onSuccess(optimizeCloudinaryUrl(u2));
          }
        });
      }
    });
    widget.open();
  }

  function setField(field, value) {
    setBiz(function (p) { var n = Object.assign({}, p); n[field] = value; return n; });
  }

  function setNested(arrName, id, updates) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        [arrName]: p[arrName].map(function (item) {
          return item.id === id ? Object.assign({}, item, updates) : item;
        })
      });
    });
  }

  function addItem(arrName, template) {
    setBiz(function (p) {
      return Object.assign({}, p, { [arrName]: p[arrName].concat([template]) });
    });
  }

  function removeItem(arrName, id) {
    setBiz(function (p) {
      return Object.assign({}, p, { [arrName]: p[arrName].filter(function (i) { return i.id !== id; }) });
    });
  }

  function addGalleryGroup() {
    addItem('gallery', { id: uid('g-'), group: '', images: [] });
  }
  function removeGalleryGroup(gid) {
    setBiz(function (p) { return Object.assign({}, p, { gallery: p.gallery.filter(function (g) { return g.id !== gid; }) }); });
  }
  function updateGalleryGroup(gid, field, value) {
    setBiz(function (p) {
      return Object.assign({}, p, { gallery: p.gallery.map(function (g) { return g.id === gid ? Object.assign({}, g, { [field]: value }) : g; }) });
    });
  }
  function addGalleryImage(gid, url) {
    setBiz(function (p) {
      return Object.assign({}, p, { gallery: p.gallery.map(function (g) { return g.id === gid ? Object.assign({}, g, { images: g.images.concat([url]) }) : g; }) });
    });
  }
  function removeGalleryImage(gid, idx) {
    setBiz(function (p) {
      return Object.assign({}, p, { gallery: p.gallery.map(function (g) { return g.id === gid ? Object.assign({}, g, { images: g.images.filter(function (_, i) { return i !== idx; }) }) : g; }) });
    });
  }

  // ─── HERO SLIDES MANAGEMENT ───
  function addHeroSlide() {
    var existingHero = biz.hero || '';
    setBiz(function (p) {
      var newSlide = { id: uid('hs-'), image: existingHero, mobileImage: '' };
      return Object.assign({}, p, {
        hero_slides: (p.hero_slides || []).concat([newSlide]),
        hero: ''
      });
    });
  }

  function removeHeroSlide(slideId) {
    setBiz(function (p) {
      var newSlides = (p.hero_slides || []).filter(function (s) { return s.id !== slideId; });
      return Object.assign({}, p, { hero_slides: newSlides });
    });
  }

  function uploadHeroSlideImage(slideId, field) {
    uploadImage(function (url) {
      setBiz(function (p) {
        return Object.assign({}, p, {
          hero_slides: (p.hero_slides || []).map(function (s) {
            if (s.id !== slideId) return s;
            return Object.assign({}, s, { [field]: url });
          })
        });
      });
    }, false, 1);
  }

  function revertToSingleHero() {
    var firstSlide = (biz.hero_slides || [])[0];
    setBiz(function (p) {
      return Object.assign({}, p, {
        hero: firstSlide ? (firstSlide.image || firstSlide.mobileImage || '') : '',
        hero_slides: []
      });
    });
  }

  // ─── TEAM MEMBERS MANAGEMENT ───
  function addTeamMember() {
    setBiz(function(p) {
      return Object.assign({}, p, {
        team: (p.team || []).concat([{ id: uid('tm-'), name: '', position: '', headshot: '', bio: '' }])
      });
    });
  }

  function removeTeamMember(memberId) {
    setBiz(function(p) {
      return Object.assign({}, p, {
        team: (p.team || []).filter(function(m) { return m.id !== memberId; })
      });
    });
  }

  function updateTeamMember(memberId, field, value) {
    setBiz(function(p) {
      return Object.assign({}, p, {
        team: (p.team || []).map(function(m) {
          return m.id === memberId ? Object.assign({}, m, { [field]: value }) : m;
        })
      });
    });
  }

  function uploadTeamHeadshot(member) {
    uploadImage(function(url) {
      updateTeamMember(member.id, 'headshot', url);
    }, false, 1);
  }

  function addServiceImage(svc) {
    uploadImage(function (url) {
      setBiz(function (p) {
        return Object.assign({}, p, {
          services: p.services.map(function (s) {
            if (s.id !== svc.id) return s;
            var current = s.images || [];
            if (current.length >= 3) return s; 
            var imgs = current.concat([url]);
            return Object.assign({}, s, { images: imgs, image: imgs[0] || '' });
          })
        });
      });
    }, true, 3); 
  }
  function removeServiceImage(svcId, idx) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        services: p.services.map(function (s) {
          if (s.id !== svcId) return s;
          var imgs = s.images.filter(function (_, i) { return i !== idx; });
          return Object.assign({}, s, { images: imgs, image: imgs[0] || '' });
        })
      });
    });
  }

  function addProductImage(prod) {
    uploadImage(function (url) {
      setBiz(function (p) {
        return Object.assign({}, p, {
          products: p.products.map(function (pr) {
            if (pr.id !== prod.id) return pr;
            var current = pr.images || [];
            if (current.length >= 3) return pr;
            var imgs = current.concat([url]);
            return Object.assign({}, pr, { images: imgs, image: imgs[0] || '' });
          })
        });
      });
    }, true, 3);
  }
  function removeProductImage(prodId, idx) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        products: p.products.map(function (pr) {
          if (pr.id !== prodId) return pr;
          var imgs = pr.images.filter(function (_, i) { return i !== idx; });
          return Object.assign({}, pr, { images: imgs, image: imgs[0] || '' });
        })
      });
    });
  }

  function addCarImage(car) {
    uploadImage(function (url) {
      setBiz(function (p) {
        return Object.assign({}, p, {
          cars: p.cars.map(function (c) {
            if (c.id !== car.id) return c;
            var current = c.images || [];
            if (current.length >= 3) return c;
            var imgs = current.concat([url]);
            return Object.assign({}, c, { images: imgs, image: imgs[0] || '' });
          })
        });
      });
    }, true, 3);
  }
  function removeCarImage(carId, idx) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        cars: p.cars.map(function (c) {
          if (c.id !== carId) return c;
          var imgs = c.images.filter(function (_, i) { return i !== idx; });
          return Object.assign({}, c, { images: imgs, image: imgs[0] || '' });
        })
      });
    });
  }

  function addFoodImage(food) {
    uploadImage(function (url) {
      setBiz(function (p) {
        return Object.assign({}, p, {
          food: p.food.map(function (f) {
            if (f.id !== food.id) return f;
            var current = f.images || [];
            if (current.length >= 3) return f;
            var imgs = current.concat([url]);
            return Object.assign({}, f, { images: imgs, image: imgs[0] || '' });
          })
        });
      });
    }, true, 3);
  }
  function removeFoodImage(foodId, idx) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          var imgs = f.images.filter(function (_, i) { return i !== idx; });
          return Object.assign({}, f, { images: imgs, image: imgs[0] || '' });
        })
      });
    });
  }

  // ─── PROPERTY IMAGES: Multi-select (max 5) ───
  function addPropertyImage(prop) {
    uploadImage(function (url) {
      setBiz(function (p) {
        return Object.assign({}, p, {
          properties: p.properties.map(function (pr) {
            if (pr.id !== prop.id) return pr;
            var current = pr.images || [];
            if (current.length >= 5) return pr;
            var imgs = current.concat([url]);
            return Object.assign({}, pr, { images: imgs });
          })
        });
      });
    }, true, 5); 
  }
  function removePropertyImage(propId, idx) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        properties: p.properties.map(function (pr) {
          if (pr.id !== propId) return pr;
          var imgs = pr.images.filter(function (_, i) { return i !== idx; });
          return Object.assign({}, pr, { images: imgs });
        })
      });
    });
  }

  function addAddonGroup(foodId) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          return Object.assign({}, f, { addons: (f.addons || []).concat([{ id: uid('a-'), label: '', type: 'single', options: [] }]) });
        })
      });
    });
  }
  function removeAddonGroup(foodId, addonId) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          return Object.assign({}, f, { addons: (f.addons || []).filter(function (a) { return a.id !== addonId; }) });
        })
      });
    });
  }
  function updateAddonGroup(foodId, addonId, field, value) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          return Object.assign({}, f, { addons: (f.addons || []).map(function (a) { return a.id === addonId ? Object.assign({}, a, { [field]: value }) : a; }) });
        })
      });
    });
  }
  function addAddonOption(foodId, addonId) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          return Object.assign({}, f, {
            addons: (f.addons || []).map(function (a) {
              if (a.id !== addonId) return a;
              return Object.assign({}, a, { options: (a.options || []).concat([{ id: uid('opt-'), name: '', price: 0 }]) });
            })
          });
        })
      });
    });
  }
  function removeAddonOption(foodId, addonId, optId) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          return Object.assign({}, f, {
            addons: (f.addons || []).map(function (a) {
              if (a.id !== addonId) return a;
              return Object.assign({}, a, { options: (a.options || []).filter(function (o) { return o.id !== optId; }) });
            })
          });
        })
      });
    });
  }
  function updateAddonOption(foodId, addonId, optId, field, value) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          return Object.assign({}, f, {
            addons: (f.addons || []).map(function (a) {
              if (a.id !== addonId) return a;
              return Object.assign({}, a, { options: (a.options || []).map(function (o) { return o.id === optId ? Object.assign({}, o, { [field]: value }) : o; }) });
            })
          });
        })
      });
    });
  }

  function handleLogoUpload() {
    uploadImage(function (url) { setField('logo', url); }, false, 1);
  }

  function resolveBankName(value) {
    if (!value) return '';
    if (/^\d{2,6}$/.test(value)) {
      var found = banks.find(function(b) { return b.code === value; });
      return found ? found.name : value;
    }
    return value;
  }

  function resolveBankCode(value) {
    if (!value) return '';
    if (/^\d{2,6}$/.test(value)) return value;
    var found = banks.find(function(b) { return b.name === value; });
    return found ? found.code : '';
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      var payload = Object.assign({}, biz, {
        account_name: biz.accountName || biz.account_name || '',
        account_number: biz.accountNumber || biz.account_number || '',
        settlement_bank: biz.settlementBank || biz.settlement_bank || ''
      });

      var res = await fetch('/.netlify/functions/save-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (data.ok) {
        setSaved(true);
        setTimeout(function () { setSaved(false); }, 3000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white font-bold text-lg mb-1">Business not found</p>
          <p className="text-zinc-400 text-sm mb-4">No business with slug "{slug}" exists.</p>
          <a href="/dashboard" className="text-white hover:text-zinc-200 transition-colors text-sm font-semibold">Try a different slug</a>
        </div>
      </div>
    );
  }

  var inp = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200";
  var sel = "w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200 cursor-pointer";
  var lbl = "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5";

  function Toggle(props) {
    return (
      <button type="button" onClick={props.onChange} className={"relative w-10 h-6 rounded-full transition-colors " + (props.checked ? 'bg-white' : 'bg-zinc-700')}>
        <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-zinc-900 rounded-full shadow transition-transform " + (props.checked ? 'translate-x-4' : '')}></span>
      </button>
    );
  }

  function TagInput({ items, onAdd, onRemove, placeholder }) {
    var inputRef = useRef(null);
    
    function handleAdd() {
      if (inputRef.current && inputRef.current.value.trim()) {
        onAdd(inputRef.current.value.trim());
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    }

    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(items || []).map(function(item, idx) {
            return (
              <span key={idx} className="inline-flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-full">
                {item}
                <button type="button" onClick={function() { onRemove(idx); }} className="text-zinc-500 hover:text-red-400 transition-colors leading-none">&times;</button>
              </span>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input 
            ref={inputRef}
            className={inp + " flex-1"} 
            placeholder={placeholder} 
            onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          />
          <button type="button" onClick={handleAdd} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors whitespace-nowrap border border-zinc-700">
            Add
          </button>
        </div>
      </div>
    );
  }

  function renderOfflinePaymentsTab() {
    if (offlineLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        </div>
      );
    }

    var pendingCount = offlineBookings.filter(function(b) { return b.status === 'pending'; }).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Bank Transfer Bookings</h3>
          {pendingCount > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </div>

        {offlineBookings.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 text-sm">No bank transfer bookings found.</p>
          </div>
        )}

        <div className="space-y-4">
          {offlineBookings.map(function(b) {
            var isPending = b.status === 'pending';
            var isVerified = b.status === 'verified';
            return (
              <div key={b.id} className={"p-4 rounded-xl border " + (isPending ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-800/40 border-zinc-800 opacity-60')}>
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-white">{b.customer_name}</span>
                      <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide " + 
                        (isPending ? 'bg-amber-500/20 text-amber-500' : 
                         isVerified ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-700 text-zinc-400')}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mb-1 font-medium">{b.order_summary}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mt-2">
                      <span>📅 {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}</span>
                      <span>📞 {b.customer_phone}</span>
                      <span>💰 ₦{b.amount.toLocaleString()}</span>
                    </div>
                    {b.customer_address && (
                      <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-sm">📍 {b.customer_address}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:w-auto w-full">
                    {b.proof_image_url && (
                      <a href={b.proof_image_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View Proof
                      </a>
                    )}
                    {isPending && (
                      <button type="button" onClick={function() { handleVerifyOfflinePayment(b.id); }} disabled={offlineLoading} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Verify Payment
                      </button>
                    )}
                    {isVerified && (
                      <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Confirmed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderInfoTab() {
    var referralCount = biz.referralCount || 0;
    var freeMonthsEarned = Math.floor(referralCount / 3);
    var referralsUntilNextMonth = 3 - (referralCount % 3);
    var referralUrl = window.location.origin + '/signup?ref=' + biz.slug;
    var pageUrl = window.location.origin + '/' + biz.slug;
    var mapsReadiness = getMapsReadiness();
    var mapsClaimed = biz.googleMapsClaimed || false;
    var hasPreciseLocation = biz.lat && biz.lng;

    var currentSettlementBankCode = resolveBankCode(biz.settlementBank);
    var currentSettlementBankName = resolveBankName(biz.settlementBank);

    return (
      <div className="space-y-6">

        {(isExpired || isWarning) && (
          <div className={`rounded-2xl p-5 text-white ${isExpired ? 'bg-red-600' : 'bg-amber-500'}`}>
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-base font-bold">
                  {isExpired ? 'Your Page is Inactive' : `Subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  {isExpired ? 'Your bio-link is currently hidden. Pay now to reactivate it instantly.' : 'Pay now to avoid losing access to your store and bookings.'}
                </p>
              </div>
            </div>
            {subMsg && <p className="text-sm font-medium bg-white/20 rounded-lg px-3 py-2 mb-3 text-center">{subMsg}</p>}
            <button type="button" onClick={handlePaySubscription} disabled={subLoading} className="w-full bg-white text-zinc-900 font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:bg-zinc-300 disabled:text-zinc-500">
              {subLoading ? 'Processing...' : `Pay ₦2,500 for Next Month`}
            </button>
          </div>
        )}

        {(biz.subaccount_code === 'ACCT_PENDING' || !biz.subaccount_code) && (
          <div className="bg-zinc-700/30 border border-zinc-700 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-zinc-900/50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-300">Payout Details Required</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Your bank verification failed during signup. You won't receive payouts until this is fixed. Please re-enter your details below or contact support.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <input className={inp} placeholder="Account Name (as on bank account)" value={bankName} onChange={function(e) { setBankName(e.target.value); }} />
              <select className={sel} value={bankCode} onChange={function(e) { setBankCode(e.target.value); }}>
                <option value="" disabled className="bg-zinc-800">Select your bank</option>
                {banks.map(function(b, bidx) { return <option key={b.code + '-' + bidx} value={b.code} className="bg-zinc-800">{b.name}</option>; })}
              </select>
              <input className={inp + " font-mono tracking-wider"} placeholder="10-digit Account Number" maxLength={10} value={bankAcc} onChange={function(e) { setBankAcc(e.target.value.replace(/\D/g, '')); }} />
            </div>
            {bankUpdateError && <p className="text-xs text-red-400 mt-3 bg-zinc-800/50 p-2 rounded-lg border border-red-700">{bankUpdateError}</p>}
            {bankUpdateSuccess && <p className="text-xs text-green-400 mt-3 bg-zinc-800/50 p-2 rounded-lg border border-green-700">✓ Bank details verified successfully! Refreshing...</p>}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={handleUpdateBank} disabled={bankUpdating || !bankName || !bankCode || !bankAcc} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-400">
                {bankUpdating ? 'Verifying...' : 'Verify Bank Details'}
              </button>
              <a href="mailto:support@booknaija.com" className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl border border-zinc-700 text-center hover:bg-zinc-700 transition-all active:scale-95">
                Contact Support
              </a>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-900/50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bank Transfer Details</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                These details are shown to customers who choose "Bank Transfer" as their payment method. They are separate from your Paystack payout account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className={lbl}>Account Name</label>
              <input 
                className={inp} 
                placeholder="e.g. Oluwafemi Emmanuel Ayedogbon" 
                value={biz.accountName || ''} 
                onChange={function(e) { setField('accountName', e.target.value); }} 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Bank</label>
                <select 
                  className={sel} 
                  value={currentSettlementBankCode} 
                  onChange={function(e) {
                    var selectedBank = banks.find(function(b) { return b.code === e.target.value; });
                    setField('settlementBank', selectedBank ? selectedBank.name : e.target.value);
                  }}
                >
                  <option value="" disabled className="bg-zinc-800">Select bank</option>
                  {banks.map(function(b, bidx) { 
                    return <option key={b.code + '-' + bidx} value={b.code} className="bg-zinc-800">{b.name}</option>; 
                  })}
                </select>
                {!currentSettlementBankCode && biz.settlementBank && (
                  <p className="text-[10px] text-zinc-500 mt-1">Current: {biz.settlementBank}</p>
                )}
              </div>
              <div>
                <label className={lbl}>Account Number</label>
                <input 
                  className={inp + " font-mono tracking-wider"} 
                  placeholder="10-digit number" 
                  maxLength={10} 
                  value={biz.accountNumber || ''} 
                  onChange={function(e) { setField('accountNumber', e.target.value.replace(/\D/g, '')); }} 
                />
              </div>
            </div>
          </div>

          {biz.accountName && biz.accountNumber && biz.settlementBank && (
            <div className="mt-3 bg-emerald-900/20 border border-emerald-700 rounded-lg px-3 py-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[10px] text-emerald-400 font-semibold">
                Bank transfer option is active on your booking page
              </p>
            </div>
          )}

          {(!biz.accountName || !biz.accountNumber || !biz.settlementBank) && (
            <div className="mt-3 bg-amber-900/20 border border-amber-700 rounded-lg px-3 py-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-[10px] text-amber-400 font-semibold">
                Fill in all 3 fields to enable bank transfers on your page
              </p>
            </div>
          )}
        </div>

        {!mapsClaimed && (
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="text-base sm:text-lg font-bold leading-tight">Get on Google Maps</h3>
                    <span className="px-1.5 py-0.5 bg-yellow-500 text-yellow-900 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">+40% Traffic</span>
                  </div>
                  <p className="text-emerald-100 text-xs sm:text-sm leading-snug">Show up in "near me" searches</p>
                </div>
              </div>
              {!mapsReadiness.ready ? (
                <div className="bg-white/15 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold text-yellow-300 mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Add these to enable setup:
                  </p>
                  <div className="space-y-1.5">
                    {mapsReadiness.issues.map(function (issue, iidx) {
                      return (
                        <div key={'issue-' + issue + '-' + iidx} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-yellow-400 rounded-full flex-shrink-0"></span>
                          <span className="text-xs text-emerald-50">{issue}</span>
                          <a href="#info-fields" className="text-yellow-300 hover:text-yellow-200 text-[10px] font-medium underline ml-auto">Edit →</a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <button type="button" onClick={function () { window.open('https://business.google.com/create?hl=en', '_blank'); }} className="w-full bg-white text-emerald-700 font-bold py-3 sm:py-3.5 px-4 rounded-xl text-sm sm:text-base hover:bg-emerald-50 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2.5">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Add to Google Maps
                  </button>
                  <p className="text-[10px] text-emerald-200/80 text-center mt-2 px-2">Copy your website URL below • Free • ~2 mins</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mapsClaimed && (
          <div className="bg-emerald-900/30 border border-emerald-700 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-900/50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-emerald-300 mb-0.5">On Google Maps</h3>
                <p className="text-[11px] text-emerald-400 leading-relaxed">"{biz.name} near me" searches will show your listing</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(biz.name + ' ' + biz.location)} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline">View on Maps →</a>
                  <button type="button" onClick={function () { setField('googleMapsClaimed', false); }} className="text-[11px] text-zinc-400 hover:text-white font-medium">Not done yet</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!mapsClaimed && (
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 text-center">Your Website URL <span className="text-emerald-400">← for Google Maps</span></p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2.5 border border-zinc-700">
                <p className="text-sm text-white font-semibold font-mono truncate">{pageUrl}</p>
              </div>
              <button type="button" onClick={handleCopyPageUrl} className={"px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap " + (urlCopied ? 'bg-green-600 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-200 active:scale-95')}>
                {urlCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center">
              <a href={'/' + biz.slug} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white font-medium transition-colors">Open page →</a>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">Referral Program</h3>
              <p className="text-xs text-zinc-400 mt-1">Refer 3 friends = 1 Free Month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-bold text-white">{referralCount}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Referrals</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-zinc-300">{referralsUntilNextMonth === 3 ? 'Start referring to earn rewards' : referralsUntilNextMonth + ' more until next free month'}</span>
              <span className="text-xs font-bold text-zinc-300">{freeMonthsEarned > 0 ? freeMonthsEarned + ' month' + (freeMonthsEarned > 1 ? 's' : '') + ' earned!' : '0 months earned'}</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: Math.min((referralCount % 3) / 3 * 100, 100) + '%' }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-zinc-400">0</span>
              <span className="text-[10px] text-zinc-400">3</span>
            </div>
          </div>
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-3">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">Your Referral Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-700">
                <p className="text-xs text-zinc-300 font-mono truncate">{referralUrl}</p>
              </div>
              <button type="button" onClick={handleCopyReferralLink} className={"px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap " + (copied ? 'bg-green-600 text-white' : 'bg-zinc-700 text-white hover:bg-zinc-600 active:scale-95')}>
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">Share this link with friends. When they sign up, your counter increases automatically.</p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">How It Works</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[{ num: '1', text: 'Share link' }, { num: '2', text: 'Friend joins' }, { num: '3', text: 'Free month!' }].map(function (step) {
                return (
                  <div key={'step-' + step.num} className="text-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-1">
                      <span className="text-[10px] sm:text-xs font-bold text-zinc-300">{step.num}</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div id="info-fields">
          <label className={lbl}>Logo</label>
          <div className="flex items-center gap-3 sm:gap-4">
            {biz.logo ? (
              <img src={optimizeCloudinaryUrl(biz.logo)} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain border border-zinc-700 p-1" loading="lazy" />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 text-xs">No logo</div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={handleLogoUpload} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium transition-colors">Upload</button>
              {biz.logo && (
                <button type="button" onClick={function () { setField('logo', ''); }} className="text-xs bg-red-900/50 hover:bg-red-900 text-red-400 px-3 py-2 rounded-lg font-medium transition-colors">Remove</button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Business Name</label><input className={inp} value={biz.name} onChange={function (e) { setField('name', e.target.value); }} /></div>
          <div><label className={lbl}>Accent Color</label><div className="flex gap-2"><input type="color" value={biz.accent} onChange={function (e) { setField('accent', e.target.value); }} className="w-12 h-11 rounded-lg border border-zinc-700 cursor-pointer p-1 bg-zinc-800" /><input className={inp + " flex-1"} value={biz.accent} onChange={function (e) { setField('accent', e.target.value); }} /></div></div>
        </div>
        
        <div>
          <label className={lbl}>Theme Appearance</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={function() { setField('theme', 'light'); }} className={"p-3 rounded-xl border-2 text-left transition-all " + (biz.theme !== 'dark' ? 'border-white bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600')}>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="text-xs font-bold text-white">Light Mode</span>
              </div>
              <p className="text-[10px] text-zinc-400">Clean, bright background</p>
            </button>
            <button type="button" onClick={function() { setField('theme', 'dark'); }} className={"p-3 rounded-xl border-2 text-left transition-all " + (biz.theme === 'dark' ? 'border-white bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600')}>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                <span className="text-xs font-bold text-white">Dark Mode</span>
              </div>
              <p className="text-[10px] text-zinc-400">Sleek, dark background</p>
            </button>
          </div>
        </div>

        {/* ─── PROPERTY WEBSITE SETTINGS: HERO, ABOUT & TEAM ─── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-900/50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Property Website Content</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Manage the Hero banner, About section, and Team for your real estate page.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Hero Mode Toggle */}
            <div>
              <label className={lbl}>Hero Banner Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={revertToSingleHero} className={"p-3 rounded-xl border-2 text-left transition-all " + (!(biz.hero_slides || []).length ? 'border-white bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600')}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs font-bold text-white">Single Image</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Slow cinematic zoom</p>
                </button>
                <button type="button" onClick={addHeroSlide} className={"p-3 rounded-xl border-2 text-left transition-all " + ((biz.hero_slides || []).length > 0 ? 'border-white bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600')}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span className="text-xs font-bold text-white">Image Slider</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Auto-crossfade carousel</p>
                </button>
              </div>
            </div>

            {/* SINGLE IMAGE UI */}
            {!(biz.hero_slides || []).length && (
              <div>
                <label className={lbl}>Hero Banner Image</label>
                <div className="flex items-center gap-3 sm:gap-4">
                  {biz.hero ? (
                    <img src={optimizeCloudinaryUrl(biz.hero)} alt="" className="w-24 h-14 sm:w-28 sm:h-16 rounded-xl object-cover border border-zinc-700" loading="lazy" />
                  ) : (
                    <div className="w-24 h-14 sm:w-28 sm:h-16 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 text-[10px] px-2 text-center">No image</div>
                  )}
                  <div className="flex gap-2">
                    <button type="button" onClick={function () { uploadImage(function (url) { setField('hero', url); }, false, 1); }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium transition-colors">Upload</button>
                    {biz.hero && (
                      <button type="button" onClick={function () { setField('hero', ''); }} className="text-xs bg-red-900/50 hover:bg-red-900 text-red-400 px-3 py-2 rounded-lg font-medium transition-colors">Remove</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SLIDER UI */}
            {(biz.hero_slides || []).length > 0 && (
              <div className="space-y-3">
                {biz.hero_slides.map(function (slide, idx) {
                  return (
                    <div key={slide.id} className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Slide {idx + 1}</span>
                        <button type="button" onClick={function () { removeHeroSlide(slide.id); }} className="text-zinc-500 hover:text-red-400 text-xs font-medium">Remove</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-zinc-500 font-medium uppercase mb-1 block">Desktop (Landscape)</span>
                          {slide.image ? (
                            <div className="relative h-20 rounded-lg overflow-hidden border border-zinc-600 group/slideDesk">
                              <img src={optimizeCloudinaryUrl(slide.image)} className="w-full h-full object-cover" alt="" />
                              <button type="button" onClick={function () { uploadHeroSlideImage(slide.id, 'image'); }} className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover/slideDesk:opacity-100 transition-opacity">Replace</button>
                            </div>
                          ) : (
                            <button type="button" onClick={function () { uploadHeroSlideImage(slide.id, 'image'); }} className="h-20 w-full rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 text-xs transition-colors">+ Upload Desktop</button>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 font-medium uppercase mb-1 block">Mobile (Portrait/Square)</span>
                          {slide.mobileImage ? (
                            <div className="relative h-20 rounded-lg overflow-hidden border border-zinc-600 group/slideMob">
                              <img src={optimizeCloudinaryUrl(slide.mobileImage)} className="w-full h-full object-cover" alt="" />
                              <button type="button" onClick={function () { uploadHeroSlideImage(slide.id, 'mobileImage'); }} className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover/slideMob:opacity-100 transition-opacity">Replace</button>
                            </div>
                          ) : (
                            <button type="button" onClick={function () { uploadHeroSlideImage(slide.id, 'mobileImage'); }} className="h-20 w-full rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 text-xs transition-colors">+ Upload Mobile</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <button type="button" onClick={addHeroSlide} className="w-full p-3 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center gap-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Another Slide
                </button>
              </div>
            )}

            {/* Hero Tagline */}
            <div>
              <label className={lbl}>Hero Tagline <span className="text-zinc-500 font-normal normal-case tracking-normal">(Appears above title)</span></label>
              <input className={inp} value={biz.tagline} onChange={function (e) { setField('tagline', e.target.value); }} placeholder="e.g. Premium Real Estate" />
            </div>

            {/* About Section Bio */}
            <div>
              <label className={lbl}>About Section Text <span className="text-zinc-500 font-normal normal-case tracking-normal">(Bio)</span></label>
              <textarea className={inp + " h-24 resize-none"} value={biz.bio} onChange={function (e) { setField('bio', e.target.value); }} placeholder="Tell potential buyers about your agency..." />
            </div>

            {/* ─── TEAM MEMBERS ─── */}
            <div className="pt-5 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <label className={lbl + " mb-0"}>Team Members</label>
                <button type="button" onClick={addTeamMember} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">+ Add Member</button>
              </div>

              {(biz.team || []).length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-6 border-2 border-dashed border-zinc-800 rounded-xl">
                  No team members yet. Add your first team member.
                </p>
              )}

              <div className="space-y-3">
                {(biz.team || []).map(function (member, midx) {
                  return (
                    <div key={member.id || midx} className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Member {midx + 1}</span>
                        <button type="button" onClick={function() { removeTeamMember(member.id); }} className="text-zinc-500 hover:text-red-400 text-xs font-medium">Remove</button>
                      </div>

                      <div className="flex items-start gap-3">
                        {/* Headshot */}
                        <div className="flex-shrink-0">
                          {member.headshot ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-600 group/tm">
                              <img src={optimizeCloudinaryUrl(member.headshot)} className="w-full h-full object-cover" alt="" />
                              <button type="button" onClick={function() { uploadTeamHeadshot(member); }} className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] text-white font-medium opacity-0 group-hover/tm:opacity-100 transition-opacity">Replace</button>
                            </div>
                          ) : (
                            <button type="button" onClick={function() { uploadTeamHeadshot(member); }} className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 text-lg transition-colors">+</button>
                          )}
                        </div>

                        {/* Name & Position */}
                        <div className="flex-1 space-y-2">
                          <input className={inp + " py-2"} placeholder="Full Name" value={member.name || ''} onChange={function(e) { updateTeamMember(member.id, 'name', e.target.value); }} />
                          <input className={inp + " py-2"} placeholder="Position (e.g. Lead Agent)" value={member.position || ''} onChange={function(e) { updateTeamMember(member.id, 'position', e.target.value); }} />
                        </div>
                      </div>

                      <textarea className={inp + " h-16 resize-none"} placeholder="Short bio about this team member..." value={member.bio || ''} onChange={function(e) { updateTeamMember(member.id, 'bio', e.target.value); }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── REAL ESTATE FEATURES TOGGLE (OBVIOUS) ─── */}
        {(biz.businessType === 'Real Estate' || biz.businessType === 'Shortlet' || biz.propertiesEnabled || biz.estatesEnabled) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-900/50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Real Estate Features</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Enable or disable sections on your public property website.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div>
                  <p className="text-sm font-semibold text-white">Properties / Shortlets</p>
                  <p className="text-xs text-zinc-400">Show individual property listings and shortlets.</p>
                </div>
                <Toggle checked={biz.propertiesEnabled} onChange={function () { setField('propertiesEnabled', !biz.propertiesEnabled); }} />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div>
                  <p className="text-sm font-semibold text-white">Grand Estates</p>
                  <p className="text-xs text-zinc-400">Show exclusive estate developments and projects.</p>
                </div>
                <Toggle checked={biz.estatesEnabled} onChange={function () { setField('estatesEnabled', !biz.estatesEnabled); }} />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Phone</label><input className={inp} value={biz.phone} onChange={function (e) { setField('phone', e.target.value); }} /></div>
          <div><label className={lbl}>WhatsApp</label><input className={inp} value={biz.whatsapp} onChange={function (e) { setField('whatsapp', e.target.value); }} /></div>
          <div><label className={lbl}>Email</label><input className={inp} value={biz.email} onChange={function (e) { setField('email', e.target.value); }} /></div>
          <div>
            <label className={lbl}>Location <span className="text-white font-normal normal-case tracking-normal">(Recommended: Pin for accuracy)</span></label>
            <div className="flex gap-2">
              <input className={inp + " flex-1"} value={biz.location} onChange={function (e) { setField('location', e.target.value); }} placeholder="e.g. Lekki Phase 1, Lagos" />
              <button type="button" onClick={function () { setShowMapPicker(true); }} className="px-4 py-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Map
              </button>
            </div>
            {hasPreciseLocation && (
              <div className="mt-1.5 flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 rounded-lg px-3 py-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <p className="text-[10px] text-emerald-400 font-semibold">✓ Precise coordinates saved</p>
              </div>
            )}
          </div>
          <div><label className={lbl}>Hours</label><input className={inp} value={biz.hours} onChange={function (e) { setField('hours', e.target.value); }} /></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Instagram URL</label><input className={inp} value={(biz.socials || {}).instagram || ''} onChange={function (e) { setField('socials', Object.assign({}, biz.socials, { instagram: e.target.value })); }} placeholder="https://instagram.com/..." /></div>
          <div><label className={lbl}>TikTok URL</label><input className={inp} value={(biz.socials || {}).tiktok || ''} onChange={function (e) { setField('socials', Object.assign({}, biz.socials, { tiktok: e.target.value })); }} placeholder="https://tiktok.com/..." /></div>
        </div>

        <div><label className={lbl}>Calendar ID (Email)</label><input className={inp} value={biz.calendarId} onChange={function (e) { setField('calendarId', e.target.value); }} /></div>

        {showToggles && (
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Feature Toggles</h3>
              <button type="button" onClick={function () { setShowToggles(false); }} className="text-xs text-zinc-400 hover:text-white transition-colors">Hide</button>
            </div>
            <div className="space-y-3">
              {[
                ['active', 'Business Active', 'Show your page to visitors'],
                ['adsEnabled', 'Show Ads', 'Display Google AdSense on your page'],
                ['servicesEnabled', 'Services', 'Allow clients to book services'],
                ['productsEnabled', 'Products', 'Allow clients to buy products'],
                ['carsEnabled', 'Cars', 'Show car rental/sales section'],
                ['foodEnabled', 'Food Menu', 'Show food ordering section'],
                ['propertiesEnabled', 'Properties', 'Show real estate / shortlet listings'],
                ['estatesEnabled', 'Estates', 'Show grand estate developments section']
              ].map(function (t) {
                return (
                  <div key={'toggle-' + t[0]} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{t[1]}</p>
                      <p className="text-xs text-zinc-400">{t[2]}</p>
                    </div>
                    <Toggle checked={biz[t[0]]} onChange={function () { setField(t[0], !biz[t[0]]); }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderSecurityTab() {
    var isSetupRequired = sessionStorage.getItem('biz_auth_' + slug) === 'setup_required';
    return (
      <div className="space-y-6">
        {isSetupRequired && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-red-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div>
              <div>
                <p className="text-xs font-bold text-red-300 mb-1">Security Not Set Up</p>
                <p className="text-xs text-red-400 leading-relaxed">Your dashboard is currently unprotected. Please set a security code and questions below, then click <span className="font-bold text-white">Save Changes</span>.</p>
              </div>
            </div>
          </div>
        )}
        {!isSetupRequired && (
          <div className="bg-zinc-900/30 border border-zinc-700 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-zinc-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div>
              <div>
                <p className="text-xs font-bold text-zinc-300 mb-1">Important</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Changing your security code or questions will take effect immediately. Do not forget these, as they cannot be recovered.</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white">4-Digit Security Code</h3>
          <div>
            <label className={lbl}>Code</label>
            <input className={inp + " font-mono tracking-widest text-center text-xl"} type="password" maxLength={4} inputMode="numeric" value={biz.securityCode || ''} onChange={function(e) { setField('securityCode', e.target.value.replace(/\D/g, '').substring(0, 4)); }} placeholder="Enter new 4-digit code" />
          </div>
        </div>
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white">Security Questions</h3>
          <div>
            <label className={lbl}>Question 1</label>
            <select className={sel} value={biz.securityQuestion1 || ''} onChange={function(e) { setField('securityQuestion1', e.target.value); }}>
              <option value="" disabled className="bg-zinc-800">Select a question...</option>
              <option value="What is your pet's name?" className="bg-zinc-800">What is your pet's name?</option>
              <option value="What city were you born in?" className="bg-zinc-800">What city were you born in?</option>
              <option value="What is your mother's maiden name?" className="bg-zinc-800">What is your mother's maiden name?</option>
              <option value="What was the name of your first school?" className="bg-zinc-800">What was the name of your first school?</option>
            </select>
            <input className={inp + " mt-2"} placeholder="Your answer" value={biz.securityAnswer1 || ''} onChange={function(e) { setField('securityAnswer1', e.target.value); }} />
          </div>
          <div>
            <label className={lbl}>Question 2</label>
            <select className={sel} value={biz.securityQuestion2 || ''} onChange={function(e) { setField('securityQuestion2', e.target.value); }}>
              <option value="" disabled className="bg-zinc-800">Select a question...</option>
              <option value="What is your favorite childhood movie?" className="bg-zinc-800">What is your favorite childhood movie?</option>
              <option value="What street did you grow up on?" className="bg-zinc-800">What street did you grow up on?</option>
              <option value="What is the name of your best friend?" className="bg-zinc-800">What is the name of your best friend?</option>
              <option value="What was your first car?" className="bg-zinc-800">What was your first car?</option>
            </select>
            <input className={inp + " mt-2"} placeholder="Your answer" value={biz.securityAnswer2 || ''} onChange={function(e) { setField('securityAnswer2', e.target.value); }} />
          </div>
        </div>
      </div>
    );
  }

  function renderGalleryTab() {
    var totalImgs = 0;
    (biz.gallery || []).forEach(function (g) { totalImgs += (g.images || []).length; });
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h3 className="text-sm font-bold text-white">Gallery</h3><span className="text-xs text-zinc-400">{totalImgs} photos</span></div>
          <button type="button" onClick={addGalleryGroup} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium transition-colors">+ Add Group</button>
        </div>
        {(biz.gallery || []).length === 0 && (<p className="text-sm text-zinc-400 text-center py-8">No gallery groups yet.</p>)}
        {(biz.gallery || []).map(function (group, gidx) {
          return (
            <div key={'grp-' + group.id + '-' + gidx} className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <input className="flex-1 text-sm font-semibold text-white bg-transparent border-0 focus:outline-none placeholder-zinc-500" value={group.group} onChange={function (e) { updateGalleryGroup(group.id, 'group', e.target.value); }} placeholder="Group name" />
                <button type="button" onClick={function () { removeGalleryGroup(group.id); }} className="text-zinc-500 hover:text-red-400 transition-colors p-1 text-lg leading-none">&times;</button>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  {(group.images || []).map(function (img, idx) {
                    return (
                      <div key={'grpimg-' + group.id + '-' + idx} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 group/img">
                        <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                        <button type="button" onClick={function () { removeGalleryImage(group.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-xs">&times;</button>
                      </div>
                    );
                  })}
                  <button type="button" onClick={function () { uploadImage(function (url) { addGalleryImage(group.id, url); }, true, 10); }} className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-lg">+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderServicesTab() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Services ({(biz.services || []).length})</h3>
          <button type="button" onClick={function () { addItem('services', { id: uid(), name: '', duration: '', price: '', description: '', image: '', images: [], showDetails: true, discount_enabled: false, discount_price: 0 }); }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.services || []).map(function (s, sidx) {
          return (
            <div key={'svc-' + s.id + '-' + sidx} className="relative p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <button type="button" onClick={function () { removeItem('services', s.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">&times;</button>
              <input className={inp} placeholder="Name" value={s.name} onChange={function (e) { setNested('services', s.id, { name: e.target.value }); }} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="Price" type="number" value={s.price} onChange={function (e) { setNested('services', s.id, { price: parseInt(e.target.value) || 0 }); }} />
                <input className={inp} placeholder="Duration" value={s.duration} onChange={function (e) { setNested('services', s.id, { duration: e.target.value }); }} />
              </div>
              <div className="border-t border-zinc-800 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Discount Settings</span>
                  <Toggle checked={s.discount_enabled || false} onChange={function () { setNested('services', s.id, { discount_enabled: !s.discount_enabled }); }} />
                </div>
                {s.discount_enabled && (
                  <div className="space-y-2">
                    <input className={inp} placeholder="Discounted Price" type="number" value={s.discount_price || ''} onChange={function (e) { setNested('services', s.id, { discount_price: parseInt(e.target.value) || 0 }); }} />
                    {s.discount_price > 0 && s.price > 0 && (
                      <div className="bg-green-900/30 border border-green-700 rounded-lg p-2 text-xs text-green-400">
                        <span className="font-semibold">Discount: {Math.round(((s.price - s.discount_price) / s.price) * 100)}% off</span>
                        <span className="block mt-0.5">Customers will pay ₦{s.discount_price.toLocaleString()} instead of ₦{s.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <textarea className={inp + " h-16 resize-none"} placeholder="Description" value={s.description} onChange={function (e) { setNested('services', s.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(s.images || []).map(function (img, idx) {
                  return (
                    <div key={'svcimg-' + s.id + '-' + idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group/si">
                      <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                      <button type="button" onClick={function () { removeServiceImage(s.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/si:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(s.images || []).length < 3 && (
                  <button type="button" onClick={function () { addServiceImage(s); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+ Photos</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderProductsTab() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Products ({(biz.products || []).length})</h3>
          <button type="button" onClick={function () { addItem('products', { id: uid(), name: '', price: '', description: '', image: '', images: [], showDetails: true, product_code: '', discount_enabled: false, discount_price: 0 }); }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.products || []).map(function (p, pidx) {
          return (
            <div key={'prod-' + p.id + '-' + pidx} className="relative p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <button type="button" onClick={function () { removeItem('products', p.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">&times;</button>
              <input className={inp} placeholder="Name" value={p.name} onChange={function (e) { setNested('products', p.id, { name: e.target.value }); }} />
              <div>
                <label className={lbl}>Product Code</label>
                <div className="flex gap-2">
                  <input className={inp + " flex-1 font-mono"} placeholder="e.g., ABC123" value={p.product_code || ''} onChange={function (e) { setNested('products', p.id, { product_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }); }} />
                  {p.product_code && (
                    <div className="flex items-center gap-1.5 px-3 bg-blue-900/30 border border-blue-700 rounded-xl">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[10px] text-blue-300 font-medium hidden sm:inline">Shareable</span>
                    </div>
                  )}
                </div>
                {p.product_code && (
                  <p className="text-[10px] text-zinc-400 mt-1">Share: <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">/{biz.slug}?code={p.product_code}</span></p>
                )}
              </div>
              <input className={inp} placeholder="Price" type="number" value={p.price} onChange={function (e) { setNested('products', p.id, { price: parseInt(e.target.value) || 0 }); }} />
              <div className="border-t border-zinc-800 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Discount Settings</span>
                  <Toggle checked={p.discount_enabled || false} onChange={function () { setNested('products', p.id, { discount_enabled: !p.discount_enabled }); }} />
                </div>
                {p.discount_enabled && (
                  <div className="space-y-2">
                    <input className={inp} placeholder="Discounted Price" type="number" value={p.discount_price || ''} onChange={function (e) { setNested('products', p.id, { discount_price: parseInt(e.target.value) || 0 }); }} />
                    {p.discount_price > 0 && p.price > 0 && (
                      <div className="bg-green-900/30 border border-green-700 rounded-lg p-2 text-xs text-green-400">
                        <span className="font-semibold">Discount: {Math.round(((p.price - p.discount_price) / p.price) * 100)}% off</span>
                        <span className="block mt-0.5">Customers will pay ₦{p.discount_price.toLocaleString()} instead of ₦{p.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <textarea className={inp + " h-16 resize-none"} placeholder="Description" value={p.description} onChange={function (e) { setNested('products', p.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(p.images || []).map(function (img, idx) {
                  return (
                    <div key={'prodimg-' + p.id + '-' + idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group/pi">
                      <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                      <button type="button" onClick={function () { removeProductImage(p.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/pi:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(p.images || []).length < 3 && (
                  <button type="button" onClick={function () { addProductImage(p); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+ Photos</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderCarsTab() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Cars ({(biz.cars || []).length})</h3>
          <button type="button" onClick={function () { addItem('cars', { id: uid(), name: '', type: 'rent', year: '', price: '', mileage: '', transmission: '', fuel: '', description: '', image: '', images: [] }); }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.cars || []).map(function (c, cidx) {
          return (
            <div key={'car-' + c.id + '-' + cidx} className="relative p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <button type="button" onClick={function () { removeItem('cars', c.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">&times;</button>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs text-zinc-300"><input type="radio" name={"dt-" + c.id} checked={c.type === 'rent'} onChange={function () { setNested('cars', c.id, { type: 'rent' }); }} className="accent-white" /> Rent</label>
                <label className="flex items-center gap-1 text-xs text-zinc-300"><input type="radio" name={"dt-" + c.id} checked={c.type === 'sale'} onChange={function () { setNested('cars', c.id, { type: 'sale' }); }} className="accent-white" /> Sale</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="Name" value={c.name} onChange={function (e) { setNested('cars', c.id, { name: e.target.value }); }} />
                <input className={inp} placeholder="Year" type="number" value={c.year} onChange={function (e) { setNested('cars', c.id, { year: parseInt(e.target.value) || 0 }); }} />
                <input className={inp} placeholder="Price" type="number" value={c.price} onChange={function (e) { setNested('cars', c.id, { price: parseInt(e.target.value) || 0 }); }} />
                <input className={inp} placeholder="Mileage" value={c.mileage} onChange={function (e) { setNested('cars', c.id, { mileage: e.target.value }); }} />
                <input className={inp} placeholder="Transmission" value={c.transmission} onChange={function (e) { setNested('cars', c.id, { transmission: e.target.value }); }} />
                <input className={inp} placeholder="Fuel" value={c.fuel} onChange={function (e) { setNested('cars', c.id, { fuel: e.target.value }); }} />
              </div>
              <textarea className={inp + " h-16 resize-none"} placeholder="Description" value={c.description} onChange={function (e) { setNested('cars', c.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(c.images || []).map(function (img, idx) {
                  return (
                    <div key={'carimg-' + c.id + '-' + idx} className="aspect-video bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group/ci">
                      <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                      <button type="button" onClick={function () { removeCarImage(c.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/ci:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                <button type="button" onClick={function () { addCarImage(c); }} className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+ Photos</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderFoodTab() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Food Menu ({(biz.food || []).length})</h3>
          <button type="button" onClick={function () { addItem('food', { id: uid(), name: '', price: '', description: '', image: '', images: [], addons: [] }); }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.food || []).map(function (f, fidx) {
          return (
            <div key={'food-' + f.id + '-' + fidx} className="relative p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <button type="button" onClick={function () { removeItem('food', f.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 z-10">&times;</button>
              <input className={inp} placeholder="Name" value={f.name} onChange={function (e) { setNested('food', f.id, { name: e.target.value }); }} />
              <input className={inp} placeholder="Price" type="number" value={f.price} onChange={function (e) { setNested('food', f.id, { price: parseInt(e.target.value) || 0 }); }} />
              <textarea className={inp + " h-16 resize-none"} placeholder="Description" value={f.description} onChange={function (e) { setNested('food', f.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(f.images || []).map(function (img, idx) {
                  return (
                    <div key={'foodimg-' + f.id + '-' + idx} className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group/fi">
                      <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                      <button type="button" onClick={function () { removeFoodImage(f.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/fi:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(f.images || []).length < 3 && (
                  <button type="button" onClick={function () { addFoodImage(f); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+ Photos</button>
                )}
              </div>
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Addons</span>
                  <button type="button" onClick={function () { addAddonGroup(f.id); }} className="text-xs text-white hover:text-zinc-200 font-medium">+ Add Group</button>
                </div>
                {(f.addons || []).map(function (addon, aidx) {
                  return (
                    <div key={'addon-' + addon.id + '-' + aidx} className="bg-zinc-800 rounded-xl border border-zinc-700 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input className={inp + " flex-1 py-2 text-sm"} placeholder="Group name" value={addon.label} onChange={function (e) { updateAddonGroup(f.id, addon.id, 'label', e.target.value); }} />
                        <select className={sel + " w-24 py-2 text-sm"} value={addon.type} onChange={function (e) { updateAddonGroup(f.id, addon.id, 'type', e.target.value); }}>
                          <option value="single" className="bg-zinc-800">Single</option>
                          <option value="multi" className="bg-zinc-800">Multi</option>
                        </select>
                        <button type="button" onClick={function () { removeAddonGroup(f.id, addon.id); }} className="text-zinc-500 hover:text-red-400 p-1">&times;</button>
                      </div>
                      {(addon.options || []).map(function (opt, oidx) {
                        return (
                          <div key={'opt-' + opt.id + '-' + oidx} className="flex items-center gap-2">
                            <input className={inp + " flex-1 py-2 text-sm"} placeholder="Option" value={opt.name} onChange={function (e) { updateAddonOption(f.id, addon.id, opt.id, 'name', e.target.value); }} />
                            <div className="relative w-20">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">+&#8358;</span>
                              <input type="number" className={inp + " pl-7 py-2 text-sm"} value={opt.price || ''} onChange={function (e) { updateAddonOption(f.id, addon.id, opt.id, 'price', e.target.value); }} />
                            </div>
                            <button type="button" onClick={function () { removeAddonOption(f.id, addon.id, opt.id); }} className="text-zinc-500 hover:text-red-400 p-1">&times;</button>
                          </div>
                        );
                      })}
                      <button type="button" onClick={function () { addAddonOption(f.id, addon.id); }} className="w-full py-1.5 text-xs text-zinc-400 hover:text-white font-medium">+ Add Option</button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── PROPERTIES TAB ───
  function renderPropertiesTab() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Properties ({(biz.properties || []).length})</h3>
          <button type="button" onClick={function () { addItem('properties', { id: uid(), name: '', type: 'sale', price: '', location: '', bedrooms: '', bathrooms: '', description: '', images: [] }); }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium">+ Add Property</button>
        </div>
        {(biz.properties || []).map(function (p, pidx) {
          return (
            <div key={'prop-' + p.id + '-' + pidx} className="relative p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <button type="button" onClick={function () { removeItem('properties', p.id); }} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400">&times;</button>
              <input className={inp} placeholder="Property Name (e.g. 3 Bed Detached Duplex)" value={p.name} onChange={function (e) { setNested('properties', p.id, { name: e.target.value }); }} />
              <input className={inp} placeholder="Location (e.g. Lekki Phase 1)" value={p.location} onChange={function (e) { setNested('properties', p.id, { location: e.target.value }); }} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="Price (₦)" type="number" value={p.price} onChange={function (e) { setNested('properties', p.id, { price: parseInt(e.target.value) || 0 }); }} />
                <select className={sel} value={p.type} onChange={function (e) { setNested('properties', p.id, { type: e.target.value }); }}>
                  <option value="sale" className="bg-zinc-800">For Sale</option>
                  <option value="rent" className="bg-zinc-800">For Rent</option>
                  <option value="shortlet" className="bg-zinc-800">Shortlet</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="Bedrooms" type="number" value={p.bedrooms} onChange={function (e) { setNested('properties', p.id, { bedrooms: e.target.value }); }} />
                <input className={inp} placeholder="Bathrooms" type="number" value={p.bathrooms} onChange={function (e) { setNested('properties', p.id, { bathrooms: e.target.value }); }} />
              </div>
              <textarea className={inp + " h-20 resize-none"} placeholder="Description" value={p.description} onChange={function (e) { setNested('properties', p.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(p.images || []).map(function (img, idx) {
                  return (
                    <div key={'propimg-' + p.id + '-' + idx} className="aspect-video bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group/pt">
                      <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                      <button type="button" onClick={function () { removePropertyImage(p.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/pt:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(p.images || []).length < 5 && (
                  <button type="button" onClick={function () { addPropertyImage(p); }} className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+ Photos</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── ESTATES TAB ───
  function renderEstatesTab() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Estates ({(biz.estates || []).length})</h3>
          <button 
            type="button" 
            onClick={function () { 
              addItem('estates', { 
                id: uid(), 
                name: '', 
                tagline: '', 
                location: '', 
                description: '', 
                heroImage: '', 
                images: [],
                priceRange: { min: '', max: '' },
                totalUnits: '',
                availableUnits: '',
                completionDate: '',
                amenities: [],
                unitTypes: [],
                featured: false
              }); 
            }} 
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium"
          >
            + Add Estate
          </button>
        </div>

        {(biz.estates || []).map(function (estate, eidx) {
          return (
            <div key={'estate-' + estate.id + '-' + eidx} className="relative p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
              <button 
                type="button" 
                onClick={function () { removeItem('estates', estate.id); }} 
                className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"
              >
                ×
              </button>
              
              <input 
                className={inp} 
                placeholder="Estate Name (e.g. Palm Springs Estate)" 
                value={estate.name} 
                onChange={function (e) { setNested('estates', estate.id, { name: e.target.value }); }} 
              />
              
              <input 
                className={inp} 
                placeholder="Tagline (e.g. Luxury Living Redefined)" 
                value={estate.tagline || ''} 
                onChange={function (e) { setNested('estates', estate.id, { tagline: e.target.value }); }} 
              />

              <input 
                className={inp} 
                placeholder="Location (e.g. Lekki Phase 2, Lagos)" 
                value={estate.location || ''} 
                onChange={function (e) { setNested('estates', estate.id, { location: e.target.value }); }} 
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl}>Price Range Min (₦)</label>
                  <input 
                    className={inp + " font-mono"} 
                    placeholder="50,000,000" 
                    type="number"
                    value={estate.priceRange?.min || ''} 
                    onChange={function (e) { 
                      setNested('estates', estate.id, { 
                        priceRange: Object.assign({}, estate.priceRange, { min: parseInt(e.target.value) || 0 }) 
                      }); 
                    }} 
                  />
                </div>
                <div>
                  <label className={lbl}>Price Range Max (₦)</label>
                  <input 
                    className={inp + " font-mono"} 
                    placeholder="150,000,000" 
                    type="number"
                    value={estate.priceRange?.max || ''} 
                    onChange={function (e) { 
                      setNested('estates', estate.id, { 
                        priceRange: Object.assign({}, estate.priceRange, { max: parseInt(e.target.value) || 0 }) 
                      }); 
                    }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={lbl}>Total Units</label>
                  <input 
                    className={inp} 
                    placeholder="120" 
                    type="number"
                    value={estate.totalUnits || ''} 
                    onChange={function (e) { setNested('estates', estate.id, { totalUnits: e.target.value }); }} 
                  />
                </div>
                <div>
                  <label className={lbl}>Available</label>
                  <input 
                    className={inp} 
                    placeholder="45" 
                    type="number"
                    value={estate.availableUnits || ''} 
                    onChange={function (e) { setNested('estates', estate.id, { availableUnits: e.target.value }); }} 
                  />
                </div>
                <div>
                  <label className={lbl}>Completion</label>
                  <input 
                    className={inp} 
                    placeholder="Q4 2025" 
                    value={estate.completionDate || ''} 
                    onChange={function (e) { setNested('estates', estate.id, { completionDate: e.target.value }); }} 
                  />
                </div>
              </div>

              <textarea 
                className={inp + " h-24 resize-none"} 
                placeholder="Full description of the estate, location advantages, investment potential..." 
                value={estate.description || ''} 
                onChange={function (e) { setNested('estates', estate.id, { description: e.target.value }); }} 
              />

              {/* Hero Image Upload */}
              <div>
                <label className={lbl}>Hero Image (Landscape, High Quality)</label>
                <div className="flex items-center gap-3">
                  {estate.heroImage ? (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-zinc-700 group/hero">
                      <img src={optimizeCloudinaryUrl(estate.heroImage)} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button" 
                        onClick={function () { 
                          uploadImage(function (url) { 
                            setNested('estates', estate.id, { heroImage: url }); 
                          }, false, 1); 
                        }} 
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover/hero:opacity-100 transition-opacity"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={function () { 
                        uploadImage(function (url) { 
                          setNested('estates', estate.id, { heroImage: url }); 
                        }, false, 1); 
                      }} 
                      className="w-32 h-20 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                    >
                      + Upload Hero
                    </button>
                  )}
                  {estate.heroImage && (
                    <button 
                      type="button" 
                      onClick={function () { setNested('estates', estate.id, { heroImage: '' }); }} 
                      className="text-xs bg-red-900/50 hover:bg-red-900 text-red-400 px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <label className={lbl}>Gallery Images (up to 8)</label>
                <div className="grid grid-cols-4 gap-2">
                  {(estate.images || []).map(function (img, idx) {
                    return (
                      <div key={'estimg-' + estate.id + '-' + idx} className="aspect-video bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden relative group/ei">
                        <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                        <button 
                          type="button" 
                          onClick={function () { 
                            setNested('estates', estate.id, { 
                              images: estate.images.filter(function (_, i) { return i !== idx; }) 
                            }); 
                          }} 
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/ei:opacity-100 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {(estate.images || []).length < 8 && (
                    <button 
                      type="button" 
                      onClick={function () { 
                        uploadImage(function (url) { 
                          setNested('estates', estate.id, { 
                            images: (estate.images || []).concat([url]) 
                          }); 
                        }, true, 8); 
                      }} 
                      className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm"
                    >
                      + Photos
                    </button>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className={lbl}>Amenities</label>
                <TagInput 
                  items={estate.amenities}
                  placeholder="Type and press Enter (e.g. Swimming Pool)"
                  onAdd={function(val) {
                    setNested('estates', estate.id, {
                      amenities: (estate.amenities || []).concat([val])
                    });
                  }}
                  onRemove={function(idx) {
                    setNested('estates', estate.id, {
                      amenities: estate.amenities.filter(function(_, i) { return i !== idx; })
                    });
                  }}
                />
              </div>

              {/* Unit Types */}
              <div>
                <label className={lbl}>Unit Types</label>
                <TagInput 
                  items={estate.unitTypes}
                  placeholder="Type and press Enter (e.g. 3 Bedroom Duplex)"
                  onAdd={function(val) {
                    setNested('estates', estate.id, {
                      unitTypes: (estate.unitTypes || []).concat([val])
                    });
                  }}
                  onRemove={function(idx) {
                    setNested('estates', estate.id, {
                      unitTypes: estate.unitTypes.filter(function(_, i) { return i !== idx; })
                    });
                  }}
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Featured Estate</p>
                  <p className="text-xs text-zinc-500">Show as the grand hero section</p>
                </div>
                <Toggle 
                  checked={estate.featured || false} 
                  onChange={function () { setNested('estates', estate.id, { featured: !estate.featured }); }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'info': return renderInfoTab();
      case 'security': return renderSecurityTab();
      case 'gallery': return renderGalleryTab();
      case 'services': return renderServicesTab();
      case 'products': return renderProductsTab();
      case 'cars': return renderCarsTab();
      case 'food': return renderFoodTab();
      case 'properties': return renderPropertiesTab();
      case 'estates': return renderEstatesTab();
      case 'offline-payments': return renderOfflinePaymentsTab();
      default: return null;
    }
  }

  var visibleTabs = getVisibleTabs();

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white flex flex-col">
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <a href="/" className="flex-shrink-0">
              <img src="/fav-removebg.png" alt="BookNaija" className="h-9 w-auto sm:h-10 object-contain" />
            </a>
            <div className="h-6 w-px bg-zinc-200 flex-shrink-0"></div>
            <div onClick={handleNameClick} className="cursor-default select-none min-w-0">
              <h1 className="text-sm font-bold text-zinc-900 leading-tight truncate">{biz.name}</h1>
              <p className="text-[11px] text-zinc-500 truncate">booknaija.com/{biz.slug}</p>
            </div>
          </div>
          <a href={'/' + biz.slug} target="_blank" rel="noreferrer" className="text-xs text-zinc-600 hover:text-zinc-900 font-semibold transition-colors flex-shrink-0 ml-2">Preview →</a>
        </div>
      </nav>
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          {visibleTabs.map(function (tab) {
            var isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={function () { setActiveTab(tab.id); }} className={"px-3 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all " + (isActive ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700')}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <form onSubmit={handleSave} className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {renderTabContent()}
        </div>
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            {saved && <p className="text-xs text-green-400 font-semibold">✓ Saved!</p>}
            <button type="submit" disabled={saving} className="ml-auto bg-white hover:bg-zinc-200 text-zinc-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-400">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
      {showMapPicker && (
        <LocationPicker
          initialQuery={biz.location}
          onSave={function(data) { setField('location', data.address); setField('lat', data.lat); setField('lng', data.lng); setShowMapPicker(false); }}
          onClose={function () { setShowMapPicker(false); }}
        />
      )}
      <footer className="bg-white border-t border-zinc-200 py-6 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
        </div>
      </footer>
    </div>
  );
}