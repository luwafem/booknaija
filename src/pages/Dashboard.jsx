import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import LocationPicker from '../components/LocationPicker';

var CLOUD_NAME = 'deexaiik4';
var UPLOAD_PRESET = 'BizUploads';

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

  // --- NEW SUBSCRIPTION STATE ---
  var subLoadingArr = useState(false);
  var subLoading = subLoadingArr[0];
  var setSubLoading = subLoadingArr[1];

  var subMsgArr = useState('');
  var subMsg = subMsgArr[0];
  var setSubMsg = subMsgArr[1];

  // --- NEW BANK UPDATE STATE ---
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

  // --- COLLISION-PROOF ID GENERATOR ---
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

  // --- FETCH BANKS FOR UPDATE ---
  useEffect(function() {
    fetch('/.netlify/functions/list-banks')
      .then(function(res) { return res.json(); })
      .then(function(data) { if (Array.isArray(data)) setBanks(data); })
      .catch(function(err) { console.error('Failed to load banks:', err); });
  }, []);

  // --- NEW SUBSCRIPTION VERIFICATION EFFECT ---
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

  // --- NEW BANK UPDATE LOGIC ---
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

  // --- NEW SUBSCRIPTION LOGIC & CALCULATIONS ---
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
    return {
      ready: issues.length === 0,
      issues: issues
    };
  }

  function getVisibleTabs() {
    if (!biz) return [];
    var tabs = [
      { id: 'info', label: 'Info' },
      { id: 'security', label: 'Security' },
      { id: 'gallery', label: 'Gallery' }
    ];
    if (biz.servicesEnabled) tabs.push({ id: 'services', label: 'Services' });
    if (biz.productsEnabled) tabs.push({ id: 'products', label: 'Products' });
    if (biz.carsEnabled) tabs.push({ id: 'cars', label: 'Cars' });
    if (biz.foodEnabled) tabs.push({ id: 'food', label: 'Food' });
    return tabs;
  }

  function uploadImage(onSuccess, isMultiple) {
    if (!window.cloudinary) { alert('Widget loading...'); return; }
    var urls = [];
    var widget = window.cloudinary.createUploadWidget({
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      sources: ['local', 'url', 'camera'],
      multiple: !!isMultiple,
      maxFiles: isMultiple ? 10 : 1
    }, function (err, res) {
      if (err) return;
      if (!isMultiple && res.event === 'success' && res.info.secure_url) {
        onSuccess(res.info.secure_url);
      }
      if (isMultiple && res.event === 'success') {
        var u = res.info && res.info.secure_url;
        if (u && urls.indexOf(u) === -1) { urls.push(u); onSuccess(u); }
      }
      if (isMultiple && res.event === 'upload-finish' && res.info && res.info.files) {
        res.info.files.forEach(function (f) {
          var u2 = f.uploadInfo && f.uploadInfo.secure_url;
          if (u2 && urls.indexOf(u2) === -1) { urls.push(u2); onSuccess(u2); }
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

  function addServiceImage(svc) {
    uploadImage(function (url) {
      var imgs = (svc.images || []).concat([url]);
      if (imgs.length <= 3) {
        setNested('services', svc.id, { images: imgs, image: imgs[0] || '' });
      } else { alert('Max 3 images'); }
    });
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
      var imgs = (prod.images || []).concat([url]);
      if (imgs.length <= 3) {
        setNested('products', prod.id, { images: imgs, image: imgs[0] || '' });
      } else { alert('Max 3 images'); }
    });
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
      var imgs = (car.images || []).concat([url]);
      if (imgs.length <= 3) {
        setNested('cars', car.id, { images: imgs, image: imgs[0] || '' });
      } else { alert('Max 3 images'); }
    });
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
      var imgs = (food.images || []).concat([url]);
      if (imgs.length <= 3) {
        setNested('food', food.id, { images: imgs, image: imgs[0] || '' });
      } else { alert('Max 3 images'); }
    });
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
    uploadImage(function (url) { setField('logo', url); });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      var res = await fetch('/.netlify/functions/save-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(biz)
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

  // Dark theme input/select styles matching other pages
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

  function renderInfoTab() {
    var referralCount = biz.referralCount || 0;
    var freeMonthsEarned = Math.floor(referralCount / 3);
    var referralsUntilNextMonth = 3 - (referralCount % 3);
    var referralUrl = window.location.origin + '/signup?ref=' + biz.slug;
    var pageUrl = window.location.origin + '/' + biz.slug;
    var mapsReadiness = getMapsReadiness();
    var mapsClaimed = biz.googleMapsClaimed || false;
    var hasPreciseLocation = biz.lat && biz.lng;

    return (
      <div className="space-y-6">

        {/* ===== SUBSCRIPTION WARNING ===== */}
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

            <button
              type="button"
              onClick={handlePaySubscription}
              disabled={subLoading}
              className="w-full bg-white text-zinc-900 font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:bg-zinc-300 disabled:text-zinc-500"
            >
              {subLoading ? 'Processing...' : `Pay ₦2,500 for Next Month`}
            </button>
          </div>
        )}

        {/* ===== PAYOUT DETAILS PENDING ===== */}
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
              <input 
                className={inp} 
                placeholder="Account Name (as on bank account)" 
                value={bankName} 
                onChange={function(e) { setBankName(e.target.value); }} 
              />
              <select 
                className={sel} 
                value={bankCode} 
                onChange={function(e) { setBankCode(e.target.value); }}
              >
                <option value="" disabled className="bg-zinc-800">Select your bank</option>
                {banks.map(function(b, bidx) { return <option key={b.code + '-' + bidx} value={b.code} className="bg-zinc-800">{b.name}</option>; })}
              </select>
              <input 
                className={inp + " font-mono tracking-wider"} 
                placeholder="10-digit Account Number" 
                maxLength={10} 
                value={bankAcc} 
                onChange={function(e) { setBankAcc(e.target.value.replace(/\D/g, '')); }} 
              />
            </div>

            {bankUpdateError && <p className="text-xs text-red-400 mt-3 bg-zinc-800/50 p-2 rounded-lg border border-red-700">{bankUpdateError}</p>}
            {bankUpdateSuccess && <p className="text-xs text-green-400 mt-3 bg-zinc-800/50 p-2 rounded-lg border border-green-700">✓ Bank details verified successfully! Refreshing...</p>}

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button 
                type="button" 
                onClick={handleUpdateBank} 
                disabled={bankUpdating || !bankName || !bankCode || !bankAcc} 
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {bankUpdating ? 'Verifying...' : 'Verify Bank Details'}
              </button>
              <a 
                href="mailto:support@booknaija.com" 
                className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl border border-zinc-700 text-center hover:bg-zinc-700 transition-all active:scale-95"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {/* ===== GOOGLE MAPS - DARK THEME ===== */}
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
                  <p className="text-emerald-100 text-xs sm:text-sm leading-snug">
                    Show up in "near me" searches
                  </p>
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
                  <button
                    type="button"
                    onClick={function () { window.open('https://business.google.com/create?hl=en', '_blank'); }}
                    className="w-full bg-white text-emerald-700 font-bold py-3 sm:py-3.5 px-4 rounded-xl text-sm sm:text-base hover:bg-emerald-50 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Add to Google Maps
                  </button>
                  <p className="text-[10px] text-emerald-200/80 text-center mt-2 px-2">
                    Copy your website URL below • Free • ~2 mins
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== MAPS COMPLETED STATE ===== */}
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
                <p className="text-[11px] text-emerald-400 leading-relaxed">
                  "{biz.name} near me" searches will show your listing
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <a 
                    href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(biz.name + ' ' + biz.location)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline"
                  >
                    View on Maps →
                  </a>
                  <button 
                    type="button" 
                    onClick={function () { setField('googleMapsClaimed', false); }}
                    className="text-[11px] text-zinc-400 hover:text-white font-medium"
                  >
                    Not done yet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== YOUR WEBSITE URL ===== */}
        {!mapsClaimed && (
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 text-center">Your Website URL <span className="text-emerald-400">← for Google Maps</span></p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2.5 border border-zinc-700">
                <p className="text-sm text-white font-semibold font-mono truncate">{pageUrl}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyPageUrl}
                className={"px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap " + (urlCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-zinc-900 hover:bg-zinc-200 active:scale-95'
                )}
              >
                {urlCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center">
              <a href={'/' + biz.slug} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white font-medium transition-colors">
                Open page →
              </a>
            </div>
          </div>
        )}

        {/* ===== REFERRAL SECTION ===== */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Referral Program
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Refer 3 friends = 1 Free Month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-bold text-white">{referralCount}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Referrals</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-zinc-300">
                {referralsUntilNextMonth === 3 
                  ? 'Start referring to earn rewards' 
                  : referralsUntilNextMonth + ' more until next free month'
                }
              </span>
              <span className="text-xs font-bold text-zinc-300">
                {freeMonthsEarned > 0 ? freeMonthsEarned + ' month' + (freeMonthsEarned > 1 ? 's' : '') + ' earned!' : '0 months earned'}
              </span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: Math.min((referralCount % 3) / 3 * 100, 100) + '%' }}
              ></div>
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
              <button
                type="button"
                onClick={handleCopyReferralLink}
                className={"px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap " + (copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-zinc-700 text-white hover:bg-zinc-600 active:scale-95'
                )}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">
              Share this link with friends. When they sign up, your counter increases automatically.
            </p>
          </div>

                    <div className="mt-4 pt-4 border-t border-zinc-700">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-2">How It Works</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { num: '1', text: 'Share link' },
                { num: '2', text: 'Friend joins' },
                { num: '3', text: 'Free month!' }
              ].map(function (step) {
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
              <img src={biz.logo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain border border-zinc-700 p-1" />
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
        
        {/* ===== THEME SELECTOR ===== */}
        <div>
          <label className={lbl}>Theme Appearance</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={function() { setField('theme', 'light'); }}
              className={"p-3 rounded-xl border-2 text-left transition-all " + (biz.theme !== 'dark' ? 'border-white bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600')}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-xs font-bold text-white">Light Mode</span>
              </div>
              <p className="text-[10px] text-zinc-400">Clean, bright background</p>
            </button>
            <button
              type="button"
              onClick={function() { setField('theme', 'dark'); }}
              className={"p-3 rounded-xl border-2 text-left transition-all " + (biz.theme === 'dark' ? 'border-white bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600')}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-xs font-bold text-white">Dark Mode</span>
              </div>
              <p className="text-[10px] text-zinc-400">Sleek, dark background</p>
            </button>
          </div>
        </div>

        <div><label className={lbl}>Tagline</label><input className={inp} value={biz.tagline} onChange={function (e) { setField('tagline', e.target.value); }} /></div>
        <div><label className={lbl}>Bio</label><textarea className={inp + " h-24 resize-none"} value={biz.bio} onChange={function (e) { setField('bio', e.target.value); }} /></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Phone</label><input className={inp} value={biz.phone} onChange={function (e) { setField('phone', e.target.value); }} /></div>
          <div><label className={lbl}>WhatsApp</label><input className={inp} value={biz.whatsapp} onChange={function (e) { setField('whatsapp', e.target.value); }} /></div>
          <div><label className={lbl}>Email</label><input className={inp} value={biz.email} onChange={function (e) { setField('email', e.target.value); }} /></div>
          
          {/* ===== LOCATION WITH MAP PICKER ===== */}
          <div>
            <label className={lbl}>Location <span className="text-white font-normal normal-case tracking-normal">(Recommended: Pin for accuracy)</span></label>
            <div className="flex gap-2">
              <input 
                className={inp + " flex-1"}
                value={biz.location} 
                onChange={function (e) { setField('location', e.target.value); }} 
                placeholder="e.g. Lekki Phase 1, Lagos"
              />
              <button 
                type="button"
                onClick={function () { setShowMapPicker(true); }}
                className="px-4 py-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Map
              </button>
            </div>
            {hasPreciseLocation && (
              <div className="mt-1.5 flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 rounded-lg px-3 py-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-[10px] text-emerald-400 font-semibold">
                  ✓ Precise coordinates saved
                </p>
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
                ['foodEnabled', 'Food Menu', 'Show food ordering section']
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
              <div className="mt-0.5 text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-red-300 mb-1">Security Not Set Up</p>
                <p className="text-xs text-red-400 leading-relaxed">
                  Your dashboard is currently unprotected. Please set a security code and questions below, then click <span className="font-bold text-white">Save Changes</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isSetupRequired && (
          <div className="bg-zinc-900/30 border border-zinc-700 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-zinc-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-300 mb-1">Important</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Changing your security code or questions will take effect immediately. Do not forget these, as they cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white">4-Digit Security Code</h3>
          <div>
            <label className={lbl}>Code</label>
            <input 
              className={inp + " font-mono tracking-widest text-center text-xl"} 
              type="password"
              maxLength={4}
              inputMode="numeric"
              value={biz.securityCode || ''}
              onChange={function(e) { setField('securityCode', e.target.value.replace(/\D/g, '').substring(0, 4)); }}
              placeholder="Enter new 4-digit code"
            />
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
          <div>
            <h3 className="text-sm font-bold text-white">Gallery</h3>
            <span className="text-xs text-zinc-400">{totalImgs} photos</span>
          </div>
          <button type="button" onClick={addGalleryGroup} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg font-medium transition-colors">+ Add Group</button>
        </div>

        {(biz.gallery || []).length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">No gallery groups yet.</p>
        )}

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
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={function () { removeGalleryImage(group.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-xs">&times;</button>
                      </div>
                    );
                  })}
                  <button type="button" onClick={function () { uploadImage(function (url) { addGalleryImage(group.id, url); }, true); }} className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-lg">+</button>
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
                  <Toggle 
                    checked={s.discount_enabled || false} 
                    onChange={function () { setNested('services', s.id, { discount_enabled: !s.discount_enabled }); }} 
                  />
                </div>
                {s.discount_enabled && (
                  <div className="space-y-2">
                    <input 
                      className={inp} 
                      placeholder="Discounted Price" 
                      type="number" 
                      value={s.discount_price || ''} 
                      onChange={function (e) { setNested('services', s.id, { discount_price: parseInt(e.target.value) || 0 }); }} 
                    />
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
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeServiceImage(s.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/si:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(s.images || []).length < 3 && (
                  <button type="button" onClick={function () { addServiceImage(s); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+</button>
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
                  <input 
                    className={inp + " flex-1 font-mono"} 
                    placeholder="e.g., ABC123" 
                    value={p.product_code || ''} 
                    onChange={function (e) { setNested('products', p.id, { product_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }); }} 
                  />
                  {p.product_code && (
                    <div className="flex items-center gap-1.5 px-3 bg-blue-900/30 border border-blue-700 rounded-xl">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-blue-300 font-medium hidden sm:inline">Shareable</span>
                    </div>
                  )}
                </div>
                {p.product_code && (
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Share: <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">/{biz.slug}?code={p.product_code}</span>
                  </p>
                )}
              </div>
              
              <input className={inp} placeholder="Price" type="number" value={p.price} onChange={function (e) { setNested('products', p.id, { price: parseInt(e.target.value) || 0 }); }} />
              
              <div className="border-t border-zinc-800 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Discount Settings</span>
                  <Toggle 
                    checked={p.discount_enabled || false} 
                    onChange={function () { setNested('products', p.id, { discount_enabled: !p.discount_enabled }); }} 
                  />
                </div>
                {p.discount_enabled && (
                  <div className="space-y-2">
                    <input 
                      className={inp} 
                      placeholder="Discounted Price" 
                      type="number" 
                      value={p.discount_price || ''} 
                      onChange={function (e) { setNested('products', p.id, { discount_price: parseInt(e.target.value) || 0 }); }} 
                    />
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
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeProductImage(p.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/pi:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(p.images || []).length < 3 && (
                  <button type="button" onClick={function () { addProductImage(p); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+</button>
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
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeCarImage(c.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/ci:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                <button type="button" onClick={function () { addCarImage(c); }} className="aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+</button>
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
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeFoodImage(f.id, idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/fi:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(f.images || []).length < 3 && (
                  <button type="button" onClick={function () { addFoodImage(f); }} className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all text-sm">+</button>
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

  function renderTabContent() {
    switch (activeTab) {
      case 'info': return renderInfoTab();
      case 'security': return renderSecurityTab();
      case 'gallery': return renderGalleryTab();
      case 'services': return renderServicesTab();
      case 'products': return renderProductsTab();
      case 'cars': return renderCarsTab();
      case 'food': return renderFoodTab();
      default: return null;
    }
  }

  var visibleTabs = getVisibleTabs();

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white flex flex-col">
      
      {/* Header - White background matching landing page */}
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
          <a href={'/' + biz.slug} target="_blank" rel="noreferrer" className="text-xs text-zinc-600 hover:text-zinc-900 font-semibold transition-colors flex-shrink-0 ml-2">
            Preview →
          </a>
        </div>
      </nav>

      {/* Tabs - White background */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          {visibleTabs.map(function (tab) {
            var isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={function () { setActiveTab(tab.id); }}
                className={"px-3 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all " + (isActive ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content - Dark theme */}
      <form onSubmit={handleSave} className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {renderTabContent()}
        </div>

        {/* Sticky Save Bar - Dark theme */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            {saved && <p className="text-xs text-green-400 font-semibold">✓ Saved!</p>}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto bg-white hover:bg-zinc-200 text-zinc-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* ===== MAP PICKER MODAL ===== */}
      {showMapPicker && (
        <LocationPicker
          initialQuery={biz.location}
          onSave={function(data) {
            setField('location', data.address);
            setField('lat', data.lat);
            setField('lng', data.lng);
            setShowMapPicker(false);
          }}
          onClose={function () { setShowMapPicker(false); }}
        />
      )}

      {/* Footer - White background matching landing page */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
        </div>
      </footer>
    </div>
  );
}