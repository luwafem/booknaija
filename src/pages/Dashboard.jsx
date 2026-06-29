import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import LocationPicker from '../components/LocationPicker';
import DomainManager from '../components/DomainManager';

var CLOUD_NAME = 'deexaiik4';
var UPLOAD_PRESET = 'BizUploads';

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
      { id: 'domain', label: 'Domain' }, 
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

    // ─── NEW: renderDomainTab() ───
  function renderDomainTab() {
    const buttonClass = "px-5 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] whitespace-nowrap disabled:opacity-50";
    return (
      <DomainManager
        biz={biz}
        accent={accent}
        inputClassName={inp}
        cardClassName={card}
        buttonClassName={buttonClass}
      />
    );
  }


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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white font-bold text-lg mb-1">Business not found</p>
          <p className="text-zinc-400 text-sm mb-4">No business with slug "{slug}" exists.</p>
          <a href="/dashboard" className="text-white hover:text-zinc-200 transition-colors duration-300 text-sm font-semibold">Try a different slug</a>
        </div>
      </div>
    );
  }

  // ─── UI SYSTEM TOKENS ───
  var inp = "w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-white/[0.12] focus:ring-1 focus:ring-white/[0.06] transition-all duration-300";
  var sel = "w-full appearance-none bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-white/[0.12] focus:ring-1 focus:ring-white/[0.06] transition-all duration-300 cursor-pointer";
  var lbl = "block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5";
  var card = "bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6";
  var accent = biz.accent || '#c8a97e';

  var visibleTabs = getVisibleTabs();

  function Toggle(props) {
    return (
      <button 
        type="button" 
        onClick={props.onChange} 
        className={"relative w-10 h-[22px] rounded-full transition-all duration-300 " + (props.checked ? 'bg-white' : 'bg-white/[0.06]')}
      >
        <span className={"absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-black rounded-full shadow-sm transition-all duration-300 " + (props.checked ? 'translate-x-[18px]' : '')}></span>
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
              <span key={idx} className="inline-flex items-center gap-1.5 bg-white/[0.06] text-zinc-300 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-300">
                {item}
                <button 
                  type="button" 
                  onClick={function() { onRemove(idx); }} 
                  className="text-zinc-500 hover:text-red-400 transition-colors duration-200 leading-none"
                >
                  ×
                </button>
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
          <button 
            type="button" 
            onClick={handleAdd} 
            className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 whitespace-nowrap border border-white/[0.06]"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  function ImageUploadArea({ currentImage, onUpload, label, aspect }) {
    return (
      <div>
        <label className={lbl}>{label}</label>
        <div 
          className="relative overflow-hidden rounded-xl border border-white/[0.06] cursor-pointer group transition-all duration-300 hover:border-white/[0.12]"
          style={{ aspectRatio: aspect || '4/3' }}
          onClick={onUpload}
        >
          {currentImage ? (
            <>
              <img 
                src={currentImage} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Change Image
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02]">
              <svg className="w-8 h-8 text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <span className="text-[10px] font-semibold text-zinc-500 tracking-[0.15em] uppercase">Upload Image</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderOfflinePaymentsTab() {
    if (offlineLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
        </div>
      );
    }

    var pendingCount = offlineBookings.filter(function(b) { return b.status === 'pending'; }).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Bank Transfer Bookings</h3>
          {pendingCount > 0 && (
            <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
              {pendingCount} Pending
            </span>
          )}
        </div>

        {offlineBookings.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-zinc-500 text-sm">No bank transfer bookings found.</p>
          </div>
        )}

        <div className="space-y-4">
          {offlineBookings.map(function(b) {
            var isPending = b.status === 'pending';
            var isVerified = b.status === 'verified';
            return (
              <div key={b.id} className={card + " " + (isPending ? '' : 'opacity-50')}>
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white">{b.customer_name}</span>
                      <span className={"text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.15em] " + 
                        (isPending ? 'bg-amber-500/15 text-amber-400' : 
                         isVerified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-zinc-500')}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mb-1">{b.order_summary}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        {b.customer_phone}
                      </span>
                      <span className="flex items-center gap-1.5" style={{ color: accent }}>
                        <svg className="w-3 h-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ₦{b.amount.toLocaleString()}
                      </span>
                    </div>
                    {b.customer_address && (
                      <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-sm flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        {b.customer_address}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:w-auto w-full">
                    {b.proof_image_url && (
                      <a href={b.proof_image_url} target="_blank" rel="noreferrer" className="text-[11px] font-medium flex items-center gap-1.5 transition-colors duration-300 hover:opacity-70" style={{ color: accent }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View Proof
                      </a>
                    )}
                    {isPending && (
                      <button 
                        type="button" 
                        onClick={function() { handleVerifyOfflinePayment(b.id); }} 
                        disabled={offlineLoading} 
                        className="w-full sm:w-auto px-5 py-2.5 text-white text-[10px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
                        style={{ backgroundColor: accent }}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Verify Payment
                      </button>
                    )}
                    {isVerified && (
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5">
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
          <div className={"rounded-2xl p-5 sm:p-6 text-white " + (isExpired ? 'bg-red-600' : 'bg-amber-500')}>
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  {isExpired ? 'Your Page is Inactive' : `Subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                </h3>
                <p className="text-sm opacity-90 mt-1 leading-relaxed">
                  {isExpired ? 'Your bio-link is currently hidden. Pay now to reactivate it instantly.' : 'Pay now to avoid losing access to your store and bookings.'}
                </p>
              </div>
            </div>
            {subMsg && <p className="text-sm font-medium bg-white/20 rounded-xl px-4 py-2.5 mb-3 text-center">{subMsg}</p>}
            <button 
              type="button" 
              onClick={handlePaySubscription} 
              disabled={subLoading} 
              className="w-full bg-white text-zinc-900 font-bold py-3.5 rounded-full hover:bg-zinc-100 transition-all duration-300 active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 text-[11px] tracking-[0.15em] uppercase"
            >
              {subLoading ? 'Processing...' : `Pay ₦2,500 for Next Month`}
            </button>
          </div>
        )}

        {(biz.subaccount_code === 'ACCT_PENDING' || !biz.subaccount_code) && (
          <div className={card}>
            <div className="flex items-start gap-3 mb-5">
              <div className="flex-shrink-0 w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Payout Details Required</h3>
                <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">
                  Your bank verification failed during signup. You won't receive payouts until this is fixed.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Account Name</label>
                <input className={inp} placeholder="As on bank account" value={bankName} onChange={function(e) { setBankName(e.target.value); }} />
              </div>
              <div>
                <label className={lbl}>Bank</label>
                <select className={sel} value={bankCode} onChange={function(e) { setBankCode(e.target.value); }}>
                  <option value="" disabled className="bg-zinc-900">Select your bank</option>
                  {banks.map(function(b, bidx) { return <option key={b.code + '-' + bidx} value={b.code} className="bg-zinc-900">{b.name}</option>; })}
                </select>
              </div>
              <div>
                <label className={lbl}>Account Number</label>
                <input className={inp + " font-mono tracking-wider"} placeholder="10-digit number" maxLength={10} value={bankAcc} onChange={function(e) { setBankAcc(e.target.value.replace(/\D/g, '')); }} />
              </div>
            </div>
            {bankUpdateError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-[11px] text-red-400">{bankUpdateError}</p>
              </div>
            )}
            {bankUpdateSuccess && (
              <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-[11px] text-emerald-400">Bank details verified! Refreshing...</p>
              </div>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button 
                type="button" 
                onClick={handleUpdateBank} 
                disabled={bankUpdating || !bankName || !bankCode || !bankAcc} 
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition-all duration-300 active:scale-[0.98] disabled:bg-white/[0.06] disabled:text-zinc-500 text-[11px] tracking-[0.15em] uppercase"
              >
                {bankUpdating ? 'Verifying...' : 'Verify Bank Details'}
              </button>
              <a 
                href="mailto:support@booknaija.com" 
                className="flex-1 bg-white/[0.03] text-zinc-300 font-bold py-3 rounded-full border border-white/[0.06] text-center hover:bg-white/[0.06] transition-all duration-300 active:scale-[0.98] text-[11px] tracking-[0.15em] uppercase"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        <div className={card}>
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + '15' }}>
              <svg className="w-5 h-5" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Bank Transfer Details</h3>
              <p className="text-[13px] text-zinc-400 mt-0.5 leading-relaxed">
                Shown to customers who choose "Bank Transfer" as payment method.
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
                  <option value="" disabled className="bg-zinc-900">Select bank</option>
                  {banks.map(function(b, bidx) { 
                    return <option key={b.code + '-' + bidx} value={b.code} className="bg-zinc-900">{b.name}</option>; 
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
            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">
                Bank transfer option is active on your booking page
              </p>
            </div>
          )}

          {(!biz.accountName || !biz.accountNumber || !biz.settlementBank) && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-[10px] text-amber-400 font-semibold tracking-wide">
                Fill in all 3 fields to enable bank transfers
              </p>
            </div>
          )}
        </div>

        {!mapsClaimed && (
          <div className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="relative">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight leading-tight">Get on Google Maps</h3>
                    <span className="px-2 py-0.5 bg-yellow-500 text-yellow-900 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] rounded-full whitespace-nowrap">+40% Traffic</span>
                  </div>
                  <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">Show up in "near me" searches</p>
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
                          <a href="#info-fields" className="text-yellow-300 hover:text-yellow-200 text-[10px] font-medium underline ml-auto transition-colors duration-300">Edit →</a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <button 
                    type="button" 
                    onClick={function () { window.open('https://business.google.com/create?hl=en', '_blank'); }} 
                    className="w-full bg-white text-emerald-700 font-bold py-3 sm:py-3.5 px-4 rounded-full text-sm sm:text-base hover:bg-emerald-50 transition-all duration-300 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2.5"
                  >
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
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-emerald-300 tracking-tight mb-0.5">On Google Maps</h3>
                <p className="text-[11px] text-emerald-400 leading-relaxed">"{biz.name} near me" searches will show your listing</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <a 
                    href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(biz.name + ' ' + (biz.location || ''))} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] font-medium transition-colors duration-300 hover:opacity-70"
                    style={{ color: accent }}
                  >
                    View on Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div id="info-fields" className={card}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white tracking-tight">Business Information</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Referrals</span>
                <span className="text-xs font-medium text-white">{referralCount}</span>
                {freeMonthsEarned > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: accent + '20', color: accent }}>
                    {freeMonthsEarned} free
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.06]">
            <div 
              className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 transition-all duration-300 hover:scale-105"
              style={{ boxShadow: '0 0 0 1px ' + accent + '40' }}
              onClick={handleLogoUpload}
            >
              {biz.logo ? (
                <img src={biz.logo} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-base font-light" style={{ backgroundColor: accent + '15', color: accent }}>
                  {biz.name ? biz.name.charAt(0) : '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p 
                className="text-lg font-medium text-white cursor-pointer hover:opacity-70 transition-opacity duration-300 truncate"
                onClick={handleNameClick}
              >
                {biz.name || 'Untitled Business'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Click name 3× to toggle feature switches</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={lbl}>Business Name</label>
              <input 
                className={inp} 
                placeholder="e.g. Ayedogbon Properties" 
                value={biz.name || ''} 
                onChange={function(e) { setField('name', e.target.value); }} 
              />
            </div>

            <div>
              <label className={lbl}>Bio / Description</label>
              <textarea 
                className={inp + " min-h-[100px] resize-y"} 
                placeholder="Tell customers about your business..." 
                value={biz.bio || ''} 
                onChange={function(e) { setField('bio', e.target.value); }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Phone (WhatsApp)</label>
                <input 
                  className={inp} 
                  placeholder="e.g. 08012345678" 
                  value={biz.phone || ''} 
                  onChange={function(e) { setField('phone', e.target.value); }}
                />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input 
                  className={inp} 
                  type="email"
                  placeholder="e.g. hello@example.com" 
                  value={biz.email || ''} 
                  onChange={function(e) { setField('email', e.target.value); }}
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Location</label>
              <div className="flex gap-2">
                <input 
                  className={inp + " flex-1"} 
                  placeholder="e.g. Lekki, Lagos" 
                  value={biz.location || ''} 
                  onChange={function(e) { setField('location', e.target.value); }}
                />
                <button 
                  type="button" 
                  onClick={function() { setShowMapPicker(true); }}
                  className="px-4 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] whitespace-nowrap flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  Map
                </button>
              </div>
              {hasPreciseLocation && (
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Precise location set
                </p>
              )}
            </div>

            <div>
              <label className={lbl}>Business Type</label>
              <select className={sel} value={biz.businessType || ''} onChange={function(e) { setField('businessType', e.target.value); }}>
                <option value="" className="bg-zinc-900">Select type</option>
                <option value="Shortlet" className="bg-zinc-900">Shortlet</option>
                <option value="Service" className="bg-zinc-900">Service</option>
                <option value="Product" className="bg-zinc-900">Product</option>
                <option value="Food" className="bg-zinc-900">Food / Restaurant</option>
                <option value="Car Rental" className="bg-zinc-900">Car Rental</option>
                <option value="Property" className="bg-zinc-900">Property</option>
              </select>
            </div>

            <div>
              <label className={lbl}>Accent Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={biz.accent || '#c8a97e'} 
                  onChange={function(e) { setField('accent', e.target.value); }}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent"
                />
                <input 
                  className={inp + " flex-1 font-mono text-xs tracking-wider"} 
                  value={biz.accent || '#c8a97e'} 
                  onChange={function(e) { setField('accent', e.target.value); }}
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Social Links</label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[11px] w-20 flex-shrink-0">Instagram</span>
                  <input 
                    className={inp} 
                    placeholder="https://instagram.com/..." 
                    value={(biz.socials || {}).instagram || ''} 
                    onChange={function(e) { setField('socials', Object.assign({}, biz.socials, { instagram: e.target.value })); }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[11px] w-20 flex-shrink-0">TikTok</span>
                  <input 
                    className={inp} 
                    placeholder="https://tiktok.com/..." 
                    value={(biz.socials || {}).tiktok || ''} 
                    onChange={function(e) { setField('socials', Object.assign({}, biz.socials, { tiktok: e.target.value })); }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={card}>
          <h3 className="text-sm font-bold text-white tracking-tight mb-4">Share Links</h3>
          <div className="space-y-3">
            <div>
              <label className={lbl}>Referral Link</label>
              <div className="flex gap-2">
                <input className={inp + " flex-1 text-xs font-mono"} value={referralUrl} readOnly />
                <button 
                  type="button" 
                  onClick={handleCopyReferralLink}
                  className="px-5 py-3 text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] whitespace-nowrap"
                  style={{ backgroundColor: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', color: copied ? '#10b981' : '#fff' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">
                {referralsUntilNextMonth} more referral{referralsUntilNextMonth !== 1 ? 's' : ''} until next free month
              </p>
            </div>
            <div>
              <label className={lbl}>Page URL</label>
              <div className="flex gap-2">
                <input className={inp + " flex-1 text-xs font-mono"} value={pageUrl} readOnly />
                <button 
                  type="button" 
                  onClick={handleCopyPageUrl}
                  className="px-5 py-3 text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] whitespace-nowrap"
                  style={{ backgroundColor: urlCopied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', color: urlCopied ? '#10b981' : '#fff' }}
                >
                  {urlCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSecurityTab() {
    return (
      <div className="space-y-6">
        <div className={card}>
          <h3 className="text-sm font-bold text-white tracking-tight mb-4">Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className={lbl}>Current Password</label>
              <input className={inp} type="password" placeholder="Enter current password" />
            </div>
            <div>
              <label className={lbl}>New Password</label>
              <input className={inp} type="password" placeholder="Enter new password" />
            </div>
            <div>
              <label className={lbl}>Confirm New Password</label>
              <input className={inp} type="password" placeholder="Confirm new password" />
            </div>
            <button className="w-full text-white font-bold py-3 rounded-full text-[11px] tracking-[0.15em] uppercase transition-all duration-300 hover:brightness-110 active:scale-[0.98]" style={{ backgroundColor: accent }}>
              Update Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderGalleryTab() {
    var heroSlides = biz.hero_slides || [];
    var hasMultipleSlides = heroSlides.length > 0;
    var hasSingleHero = biz.hero && !hasMultipleSlides;

    return (
      <div className="space-y-6">
        <div className={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white tracking-tight">Hero Image</h3>
            {!hasMultipleSlides && (
              <button 
                type="button" 
                onClick={addHeroSlide}
                className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
              >
                + Add Slides
              </button>
            )}
            {hasMultipleSlides && (
              <button 
                type="button" 
                onClick={revertToSingleHero}
                className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
              >
                Single Image Mode
              </button>
            )}
          </div>

          {hasSingleHero && (
            <ImageUploadArea 
              currentImage={biz.hero}
              onUpload={function() { 
                uploadImage(function(url) { setField('hero', url); }, false, 1); 
              }}
              label="Hero Image"
              aspect="21/9"
            />
          )}

          {hasMultipleSlides && (
            <div className="space-y-4">
              {heroSlides.map(function(slide, idx) {
                return (
                  <div key={slide.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Slide {idx + 1}</span>
                      <button 
                        type="button"
                        onClick={function() { removeHeroSlide(slide.id); }}
                        className="text-zinc-500 hover:text-red-400 transition-colors duration-200 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ImageUploadArea
                        currentImage={slide.image}
                        onUpload={function() { uploadHeroSlideImage(slide.id, 'image'); }}
                        label="Desktop Image"
                        aspect="21/9"
                      />
                      <ImageUploadArea
                        currentImage={slide.mobileImage}
                        onUpload={function() { uploadHeroSlideImage(slide.id, 'mobileImage'); }}
                        label="Mobile Image"
                        aspect="9/16"
                      />
                    </div>
                  </div>
                );
              })}
              <button 
                type="button"
                onClick={addHeroSlide}
                className="w-full py-3 border border-dashed border-white/[0.06] rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-300"
              >
                + Add Another Slide
              </button>
            </div>
          )}
        </div>

        <div className={card}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white tracking-tight">Gallery Groups</h3>
            <button 
              type="button" 
              onClick={addGalleryGroup}
              className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
            >
              + Add Group
            </button>
          </div>

          {(biz.gallery || []).length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.02]">
              <p className="text-zinc-500 text-sm">No gallery groups yet.</p>
            </div>
          )}

          <div className="space-y-6">
            {(biz.gallery || []).map(function(group) {
              return (
                <div key={group.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input 
                      className={inp + " text-sm font-medium"} 
                      placeholder="Group name (e.g. Interior, Exterior)" 
                      value={group.group || ''} 
                      onChange={function(e) { updateGalleryGroup(group.id, 'group', e.target.value); }}
                    />
                    <button 
                      type="button"
                      onClick={function() { removeGalleryGroup(group.id); }}
                      className="text-zinc-500 hover:text-red-400 transition-colors duration-200 ml-3"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {(group.images || []).map(function(img, imgIdx) {
                      return (
                        <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={function() { removeGalleryImage(group.id, imgIdx); }}
                              className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    type="button"
                    onClick={function() { 
                      uploadImage(function(url) { addGalleryImage(group.id, url); }, true, 10); 
                    }}
                    className="w-full py-2.5 border border-dashed border-white/[0.06] rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-all duration-300"
                  >
                    + Add Images
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderServicesTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Services</h3>
          <button 
            type="button" 
            onClick={function() { addItem('services', { id: uid('svc-'), name: '', description: '', price: 0, image: '', images: [] }); }}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
            style={{ backgroundColor: accent }}
          >
            + Add Service
          </button>
        </div>

        {(biz.services || []).length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H21M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            <p className="text-zinc-500 text-sm">No services added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(biz.services || []).map(function(svc) {
            return (
              <div key={svc.id} className={card}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Service</h4>
                  <button 
                    type="button"
                    onClick={function() { removeItem('services', svc.id); }}
                    className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Service Name</label>
                    <input className={inp} placeholder="e.g. Deep Cleaning" value={svc.name || ''} onChange={function(e) { setNested('services', svc.id, { name: e.target.value }); }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Description</label>
                    <textarea className={inp + " min-h-[80px] resize-y"} placeholder="Describe this service..." value={svc.description || ''} onChange={function(e) { setNested('services', svc.id, { description: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Price (₦)</label>
                    <input className={inp} type="number" placeholder="0" value={svc.price || ''} onChange={function(e) { setNested('services', svc.id, { price: Number(e.target.value) || 0 }); }} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={lbl}>Images (max 3)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(svc.images || []).map(function(img, idx) {
                      return (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={function() { removeServiceImage(svc.id, idx); }}
                              className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(svc.images || []).length < 3 && (
                      <div 
                        className="aspect-square rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                        onClick={function() { addServiceImage(svc); }}
                      >
                        <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </div>
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

  function renderProductsTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Products</h3>
          <button 
            type="button" 
            onClick={function() { addItem('products', { id: uid('prod-'), name: '', description: '', price: 0, image: '', images: [] }); }}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
            style={{ backgroundColor: accent }}
          >
            + Add Product
          </button>
        </div>

        {(biz.products || []).length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-zinc-500 text-sm">No products added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(biz.products || []).map(function(prod) {
            return (
              <div key={prod.id} className={card}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Product</h4>
                  <button 
                    type="button"
                    onClick={function() { removeItem('products', prod.id); }}
                    className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Product Name</label>
                    <input className={inp} placeholder="e.g. Organic Honey" value={prod.name || ''} onChange={function(e) { setNested('products', prod.id, { name: e.target.value }); }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Description</label>
                    <textarea className={inp + " min-h-[80px] resize-y"} placeholder="Describe this product..." value={prod.description || ''} onChange={function(e) { setNested('products', prod.id, { description: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Price (₦)</label>
                    <input className={inp} type="number" placeholder="0" value={prod.price || ''} onChange={function(e) { setNested('products', prod.id, { price: Number(e.target.value) || 0 }); }} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={lbl}>Images (max 3)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(prod.images || []).map(function(img, idx) {
                      return (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={function() { removeProductImage(prod.id, idx); }}
                              className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(prod.images || []).length < 3 && (
                      <div 
                        className="aspect-square rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                        onClick={function() { addProductImage(prod); }}
                      >
                        <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </div>
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

  function renderCarsTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Cars</h3>
          <button 
            type="button" 
            onClick={function() { addItem('cars', { id: uid('car-'), name: '', description: '', price: 0, image: '', images: [] }); }}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
            style={{ backgroundColor: accent }}
          >
            + Add Car
          </button>
        </div>

        {(biz.cars || []).length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 11M3 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6M3 11h18" />
            </svg>
            <p className="text-zinc-500 text-sm">No cars added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(biz.cars || []).map(function(car) {
            return (
              <div key={car.id} className={card}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Car</h4>
                  <button 
                    type="button"
                    onClick={function() { removeItem('cars', car.id); }}
                    className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Car Name</label>
                    <input className={inp} placeholder="e.g. Toyota Camry 2023" value={car.name || ''} onChange={function(e) { setNested('cars', car.id, { name: e.target.value }); }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Description</label>
                    <textarea className={inp + " min-h-[80px] resize-y"} placeholder="Describe this car..." value={car.description || ''} onChange={function(e) { setNested('cars', car.id, { description: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Price per day (₦)</label>
                    <input className={inp} type="number" placeholder="0" value={car.price || ''} onChange={function(e) { setNested('cars', car.id, { price: Number(e.target.value) || 0 }); }} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={lbl}>Images (max 3)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(car.images || []).map(function(img, idx) {
                      return (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={function() { removeCarImage(car.id, idx); }}
                              className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(car.images || []).length < 3 && (
                      <div 
                        className="aspect-square rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                        onClick={function() { addCarImage(car); }}
                      >
                        <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </div>
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

  function renderFoodTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Menu Items</h3>
          <button 
            type="button" 
            onClick={function() { addItem('food', { id: uid('food-'), name: '', description: '', price: 0, image: '', images: [], addons: [] }); }}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
            style={{ backgroundColor: accent }}
          >
            + Add Item
          </button>
        </div>

        {(biz.food || []).length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-zinc-500 text-sm">No menu items added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(biz.food || []).map(function(item) {
            return (
              <div key={item.id} className={card}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Menu Item</h4>
                  <button 
                    type="button"
                    onClick={function() { removeItem('food', item.id); }}
                    className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Item Name</label>
                    <input className={inp} placeholder="e.g. Jollof Rice" value={item.name || ''} onChange={function(e) { setNested('food', item.id, { name: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Price (₦)</label>
                    <input className={inp} type="number" placeholder="0" value={item.price || ''} onChange={function(e) { setNested('food', item.id, { price: Number(e.target.value) || 0 }); }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Description</label>
                    <textarea className={inp + " min-h-[80px] resize-y"} placeholder="Describe this item..." value={item.description || ''} onChange={function(e) { setNested('food', item.id, { description: e.target.value }); }} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={lbl}>Images (max 3)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(item.images || []).map(function(img, idx) {
                      return (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={function() { removeFoodImage(item.id, idx); }}
                              className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(item.images || []).length < 3 && (
                      <div 
                        className="aspect-square rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                        onClick={function() { addFoodImage(item); }}
                      >
                        <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Add-ons / Extras</h4>
                    <button 
                      type="button"
                      onClick={function() { addAddonGroup(item.id); }}
                      className="text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
                    >
                      + Add Group
                    </button>
                  </div>

                  {(item.addons || []).length === 0 && (
                    <p className="text-[11px] text-zinc-500 text-center py-4">No add-ons yet</p>
                  )}

                  <div className="space-y-4">
                    {(item.addons || []).map(function(addon) {
                      return (
                        <div key={addon.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <input 
                              className={inp + " flex-1 text-sm"} 
                              placeholder="Group name (e.g. Drink Options)" 
                              value={addon.label || ''} 
                              onChange={function(e) { updateAddonGroup(item.id, addon.id, 'label', e.target.value); }}
                            />
                            <select 
                              className={sel + " w-32"} 
                              value={addon.type || 'single'} 
                              onChange={function(e) { updateAddonGroup(item.id, addon.id, 'type', e.target.value); }}
                            >
                              <option value="single" className="bg-zinc-900">Single</option>
                              <option value="multiple" className="bg-zinc-900">Multiple</option>
                            </select>
                            <button 
                              type="button"
                              onClick={function() { removeAddonGroup(item.id, addon.id); }}
                              className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(addon.options || []).map(function(opt) {
                              return (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <input 
                                    className={inp + " flex-1 text-xs"} 
                                    placeholder="Option name" 
                                    value={opt.name || ''} 
                                    onChange={function(e) { updateAddonOption(item.id, addon.id, opt.id, 'name', e.target.value); }}
                                  />
                                  <input 
                                    className={inp + " w-24 text-xs text-right font-mono"} 
                                    type="number" 
                                    placeholder="₦0" 
                                    value={opt.price || ''} 
                                    onChange={function(e) { updateAddonOption(item.id, addon.id, opt.id, 'price', Number(e.target.value) || 0); }}
                                  />
                                  <button 
                                    type="button"
                                    onClick={function() { removeAddonOption(item.id, addon.id, opt.id); }}
                                    className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              );
                            })}
                            <button 
                              type="button"
                              onClick={function() { addAddonOption(item.id, addon.id); }}
                              className="w-full py-2 border border-dashed border-white/[0.06] rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-all duration-300"
                            >
                              + Add Option
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderPropertiesTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Properties</h3>
          <button 
            type="button" 
            onClick={function() { addItem('properties', { id: uid('prop-'), name: '', location: '', type: 'rent', price: '', bedrooms: '', bathrooms: '', description: '', amenities: [], images: [] }); }}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
            style={{ backgroundColor: accent }}
          >
            + Add Property
          </button>
        </div>

        {(biz.properties || []).length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className="text-zinc-500 text-sm">No properties added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(biz.properties || []).map(function(prop) {
            return (
              <div key={prop.id} className={card}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Property</h4>
                  <button 
                    type="button"
                    onClick={function() { removeItem('properties', prop.id); }}
                    className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Property Name</label>
                    <input className={inp} placeholder="e.g. 3 Bedroom Duplex" value={prop.name || ''} onChange={function(e) { setNested('properties', prop.id, { name: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Location</label>
                    <input className={inp} placeholder="e.g. Lekki Phase 1" value={prop.location || ''} onChange={function(e) { setNested('properties', prop.id, { location: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Type</label>
                    <select className={sel} value={prop.type || 'rent'} onChange={function(e) { setNested('properties', prop.id, { type: e.target.value }); }}>
                      <option value="rent" className="bg-zinc-900">For Rent</option>
                      <option value="sale" className="bg-zinc-900">For Sale</option>
                      <option value="shortlet" className="bg-zinc-900">Shortlet</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Price (₦)</label>
                    <input className={inp} type="number" placeholder="0" value={prop.price || ''} onChange={function(e) { setNested('properties', prop.id, { price: e.target.value }); }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Bedrooms</label>
                      <input className={inp} type="number" placeholder="0" value={prop.bedrooms || ''} onChange={function(e) { setNested('properties', prop.id, { bedrooms: e.target.value }); }} />
                    </div>
                    <div>
                      <label className={lbl}>Bathrooms</label>
                      <input className={inp} type="number" placeholder="0" value={prop.bathrooms || ''} onChange={function(e) { setNested('properties', prop.id, { bathrooms: e.target.value }); }} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Description</label>
                    <textarea className={inp + " min-h-[100px] resize-y"} placeholder="Describe this property..." value={prop.description || ''} onChange={function(e) { setNested('properties', prop.id, { description: e.target.value }); }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Amenities</label>
                    <TagInput 
                      items={prop.amenities || []}
                      onAdd={function(val) {
                        setBiz(function(p) {
                          return Object.assign({}, p, {
                            properties: p.properties.map(function(pr) {
                              return pr.id === prop.id ? Object.assign({}, pr, { amenities: (pr.amenities || []).concat([val]) }) : pr;
                            })
                          });
                        });
                      }}
                      onRemove={function(idx) {
                        setBiz(function(p) {
                          return Object.assign({}, p, {
                            properties: p.properties.map(function(pr) {
                              return pr.id === prop.id ? Object.assign({}, pr, { amenities: pr.amenities.filter(function(_, i) { return i !== idx; }) }) : pr;
                            })
                          });
                        });
                      }}
                      placeholder="e.g. Swimming Pool"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={lbl}>Images (max 5)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(prop.images || []).map(function(img, idx) {
                      return (
                        <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={function() { removePropertyImage(prop.id, idx); }}
                              className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(prop.images || []).length < 5 && (
                      <div 
                        className="aspect-[4/3] rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                        onClick={function() { addPropertyImage(prop); }}
                      >
                        <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </div>
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

  function renderEstatesTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Estates</h3>
          <button 
            type="button" 
            onClick={function() { 
              addItem('estates', { 
                id: uid('est-'), 
                name: '', 
                tagline: '', 
                description: '', 
                location: '', 
                priceRange: { min: 0, max: 0 }, 
                totalUnits: 0, 
                availableUnits: 0, 
                completionDate: '', 
                heroImage: '', 
                images: [], 
                amenities: [], 
                unitTypes: [],
                featured: false
              }); 
            }}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 text-white hover:brightness-110"
            style={{ backgroundColor: accent }}
          >
            + Add Estate
          </button>
        </div>

        {(biz.estates || []).length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-zinc-500 text-sm">No estates added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(biz.estates || []).map(function(estate) {
            return (
              <div key={estate.id} className={card}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">Estate</h4>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Featured</span>
                      <Toggle 
                        checked={estate.featured || false} 
                        onChange={function() { setNested('estates', estate.id, { featured: !estate.featured }); }}
                      />
                    </label>
                    <button 
                      type="button"
                      onClick={function() { removeItem('estates', estate.id); }}
                      className="text-zinc-500 hover:text-red-400 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Estate Name</label>
                    <input className={inp} placeholder="e.g. Palm Springs Estate" value={estate.name || ''} onChange={function(e) { setNested('estates', estate.id, { name: e.target.value }); }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Tagline</label>
                    <input className={inp} placeholder="e.g. Luxury living in the heart of Lekki" value={estate.tagline || ''} onChange={function(e) { setNested('estates', estate.id, { tagline: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Location</label>
                    <input className={inp} placeholder="e.g. Ibeju-Lekki" value={estate.location || ''} onChange={function(e) { setNested('estates', estate.id, { location: e.target.value }); }} />
                  </div>
                  <div>
                    <label className={lbl}>Completion Date</label>
                    <input className={inp} placeholder="e.g. Q4 2025" value={estate.completionDate || ''} onChange={function(e) { setNested('estates', estate.id, { completionDate: e.target.value }); }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>Price Min (₦)</label>
                      <input className={inp + " text-xs"} type="number" placeholder="0" value={(estate.priceRange || {}).min || ''} onChange={function(e) { setNested('estates', estate.id, { priceRange: Object.assign({}, estate.priceRange, { min: Number(e.target.value) || 0 }) }); }} />
                    </div>
                    <div>
                      <label className={lbl}>Price Max (₦)</label>
                      <input className={inp + " text-xs"} type="number" placeholder="0" value={(estate.priceRange || {}).max || ''} onChange={function(e) { setNested('estates', estate.id, { priceRange: Object.assign({}, estate.priceRange, { max: Number(e.target.value) || 0 }) }); }} />
                    </div>
                    <div>
                      <label className={lbl}>Units</label>
                      <input className={inp + " text-xs"} type="number" placeholder="0" value={estate.totalUnits || ''} onChange={function(e) { setNested('estates', estate.id, { totalUnits: Number(e.target.value) || 0 }); }} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Description</label>
                    <textarea className={inp + " min-h-[100px] resize-y"} placeholder="Describe this estate..." value={estate.description || ''} onChange={function(e) { setNested('estates', estate.id, { description: e.target.value }); }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Amenities</label>
                    <TagInput 
                      items={estate.amenities || []}
                      onAdd={function(val) {
                        setBiz(function(p) {
                          return Object.assign({}, p, {
                            estates: p.estates.map(function(est) {
                              return est.id === estate.id ? Object.assign({}, est, { amenities: (est.amenities || []).concat([val]) }) : est;
                            })
                          });
                        });
                      }}
                      onRemove={function(idx) {
                        setBiz(function(p) {
                          return Object.assign({}, p, {
                            estates: p.estates.map(function(est) {
                              return est.id === estate.id ? Object.assign({}, est, { amenities: est.amenities.filter(function(_, i) { return i !== idx; }) }) : est;
                            })
                          });
                        });
                      }}
                      placeholder="e.g. Swimming Pool"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Unit Types</label>
                    <TagInput 
                      items={estate.unitTypes || []}
                      onAdd={function(val) {
                        setBiz(function(p) {
                          return Object.assign({}, p, {
                            estates: p.estates.map(function(est) {
                              return est.id === estate.id ? Object.assign({}, est, { unitTypes: (est.unitTypes || []).concat([val]) }) : est;
                            })
                          });
                        });
                      }}
                      onRemove={function(idx) {
                        setBiz(function(p) {
                          return Object.assign({}, p, {
                            estates: p.estates.map(function(est) {
                              return est.id === estate.id ? Object.assign({}, est, { unitTypes: est.unitTypes.filter(function(_, i) { return i !== idx; }) }) : est;
                            })
                          });
                        });
                      }}
                      placeholder="e.g. 3BR Duplex"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={lbl}>Hero Image</label>
                  <ImageUploadArea 
                    currentImage={estate.heroImage}
                    onUpload={function() { 
                      uploadImage(function(url) { 
                        setNested('estates', estate.id, { heroImage: url });
                      }, false, 1); 
                    }}
                    aspect="21/9"
                  />
                </div>

                <div className="mt-4">
                  <label className={lbl}>Gallery Images</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(estate.images || []).map(function(img, idx) {
                      return (
                        <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={function() { 
                                setBiz(function(p) {
                                  return Object.assign({}, p, {
                                    estates: p.estates.map(function(est) {
                                      return est.id === estate.id ? Object.assign({}, est, { images: est.images.filter(function(_, i) { return i !== idx; }) }) : est;
                                    })
                                  });
                                });
                              }}
                              className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div 
                      className="aspect-[4/3] rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
                      onClick={function() { 
                        uploadImage(function(url) { 
                          setBiz(function(p) {
                            return Object.assign({}, p, {
                              estates: p.estates.map(function(est) {
                                if (est.id !== estate.id) return est;
                                var current = est.images || [];
                                if (current.length >= 10) return est;
                                return Object.assign({}, est, { images: current.concat([url]) });
                              })
                            });
                          });
                        }, true, 10); 
                      }}
                    >
                      <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'info': return renderInfoTab();
      case 'security': return renderSecurityTab();
      case 'gallery': return renderGalleryTab();
      case 'domain': return renderDomainTab();    
      case 'offline-payments': return renderOfflinePaymentsTab();
      case 'services': return renderServicesTab();
      case 'products': return renderProductsTab();
      case 'cars': return renderCarsTab();
      case 'food': return renderFoodTab();
      case 'properties': return renderPropertiesTab();
      case 'estates': return renderEstatesTab();
      default: return null;
    }
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
      <style>{`body, body * { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }`}</style>
      
      <div className="min-h-screen bg-black text-white">
        {/* ─── HEADER ─── */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <a href={'/' + biz.slug} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 group">
                  {biz.logo ? (
                    <img src={biz.logo} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/[0.06] transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium" style={{ backgroundColor: accent + '15', color: accent }}>
                      {biz.name ? biz.name.charAt(0) : '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-300 hidden sm:block tracking-wide">{biz.name}</span>
                </a>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-2 py-0.5 bg-white/[0.03] rounded-full hidden sm:block">Dashboard</span>
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={'/' + biz.slug} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  View Page
                </a>
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                  Exit
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ─── MAIN LAYOUT ─── */}
        <div className="pt-16 flex min-h-screen">
          
          {/* ─── SIDEBAR ─── */}
          <aside className="fixed top-16 left-0 bottom-0 w-56 bg-black border-r border-white/[0.06] overflow-y-auto hidden lg:block">
            <nav className="p-3 space-y-0.5">
              {visibleTabs.map(function(tab) {
                var isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={function() { setActiveTab(tab.id); }}
                    className={"w-full text-left px-4 py-2.5 text-[11px] font-semibold tracking-[0.05em] rounded-xl transition-all duration-300 " + 
                      (isActive 
                        ? 'text-white bg-white/[0.06]' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]')
                    }
                  >
                    {tab.label}
                    {tab.id === 'offline-payments' && offlineBookings.filter(function(b) { return b.status === 'pending'; }).length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full">
                        {offlineBookings.filter(function(b) { return b.status === 'pending'; }).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {showToggles && (
              <div className="p-4 mt-2 border-t border-white/[0.06]">
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3">Features</p>
                <div className="space-y-3">
                  {[
                    { key: 'servicesEnabled', label: 'Services' },
                    { key: 'productsEnabled', label: 'Products' },
                    { key: 'carsEnabled', label: 'Cars' },
                    { key: 'foodEnabled', label: 'Food' },
                    { key: 'propertiesEnabled', label: 'Properties' },
                    { key: 'estatesEnabled', label: 'Estates' }
                  ].map(function(t) {
                    return (
                      <label key={t.key} className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">{t.label}</span>
                        <Toggle 
                          checked={biz[t.key] || false} 
                          onChange={function() { setField(t.key, !biz[t.key]); }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* ─── MOBILE TABS ─── */}
          <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="flex overflow-x-auto no-scrollbar px-3 py-2 gap-1">
              {visibleTabs.map(function(tab) {
                var isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={function() { setActiveTab(tab.id); }}
                    className={"flex-shrink-0 px-4 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase rounded-full transition-all duration-300 whitespace-nowrap " + 
                      (isActive 
                        ? 'text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300')
                    }
                    style={isActive ? { backgroundColor: accent } : {}}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── CONTENT AREA ─── */}
          <main className="flex-1 lg:ml-56">
            <div className="max-w-3xl mx-auto px-6 sm:px-10 py-8 lg:py-10 pt-20 lg:pt-10">
              
              {renderTabContent()}

              {/* ─── SAVE BAR ─── */}
              <div className="sticky bottom-0 -mx-6 sm:-mx-10 px-6 sm:px-10 py-4 mt-10 bg-gradient-to-t from-black via-black to-transparent">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                  {errorMsg && (
                    <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <p className="text-[11px] text-red-400 truncate">{errorMsg}</p>
                    </div>
                  )}
                  {saved && !errorMsg && (
                    <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-[11px] text-emerald-400">Changes saved</p>
                    </div>
                  )}
                  {!errorMsg && !saved && <div className="flex-1"></div>}

                  <button 
                    type="button" 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex-shrink-0 inline-flex items-center gap-2.5 px-8 py-3 text-white text-[11px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{ backgroundColor: accent }}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : saved ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : null}
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>

        {/* ─── LOCATION PICKER MODAL ─── */}
        {showMapPicker && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={function() { setShowMapPicker(false); }}>
            <div 
              className="w-full max-w-2xl bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden" 
              onClick={function(e) { e.stopPropagation(); }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white tracking-tight">Pick Location</h3>
                <button 
                  type="button"
                  onClick={function() { setShowMapPicker(false); }}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="h-[400px]">
                <LocationPicker
                  lat={biz.lat || 6.5244}
                  lng={biz.lng || 3.3792}
                  onLocationSelect={function(lat, lng) {
                    setField('lat', lat);
                    setField('lng', lng);
                  }}
                />
              </div>
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">
                  {biz.lat && biz.lng ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {biz.lat.toFixed(4)}, {biz.lng.toFixed(4)}
                    </span>
                  ) : 'Click the map to set location'}
                </p>
                <button 
                  type="button"
                  onClick={function() { setShowMapPicker(false); }}
                  className="px-5 py-2 text-white text-[10px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:brightness-110"
                  style={{ backgroundColor: accent }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}