import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';

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

  // Load business data into editable state
  useEffect(function () {
    if (initialBiz) {
      setBiz(JSON.parse(JSON.stringify(initialBiz)));
      setActiveTab('info');
      setShowToggles(false);
      clickCountArr.current = 0;
    }
  }, [initialBiz]);

  // ─── Cloudinary Upload ───
  useEffect(function () {
    if (!window.cloudinary) {
      var s = document.createElement('script');
      s.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // ─── Triple Click Handler ───
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

  // ─── Get visible tabs based on enabled features ───
  function getVisibleTabs() {
    if (!biz) return [];
    var tabs = [
      { id: 'info', label: 'Info' },
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

  // ─── State Helpers ───
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

  // ─── Gallery Helpers ───
  function addGalleryGroup() {
    addItem('gallery', { id: 'g-' + Date.now(), group: '', images: [] });
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

  // ─── Service Image Helpers ───
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

  // ─── Product Image Helpers ───
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

  // ─── Car Image Helpers ───
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

  // ─── Food Image Helpers ───
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

  // ─── Food Addon Helpers ───
  function addAddonGroup(foodId) {
    setBiz(function (p) {
      return Object.assign({}, p, {
        food: p.food.map(function (f) {
          if (f.id !== foodId) return f;
          return Object.assign({}, f, { addons: (f.addons || []).concat([{ id: 'a-' + Date.now(), label: '', type: 'single', options: [] }]) });
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
              return Object.assign({}, a, { options: (a.options || []).concat([{ id: 'opt-' + Date.now(), name: '', price: 0 }]) });
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

  // ─── Logo Upload ───
  function handleLogoUpload() {
    uploadImage(function (url) { setField('logo', url); });
  }

  // ─── Save ───
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

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ─── Not Found ───
  if (!biz) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-900 font-bold text-lg mb-1">Business not found</p>
          <p className="text-zinc-500 text-sm mb-4">No business with slug "{slug}" exists.</p>
          <a href="/dashboard" className="text-purple-600 text-sm font-semibold hover:underline">Try a different slug</a>
        </div>
      </div>
    );
  }

  // ─── Style vars ───
  var inp = "w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all";
  var sel = "w-full appearance-none bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-purple-600 transition-all cursor-pointer";
  var lbl = "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5";

  function Toggle(props) {
    return (
      <button type="button" onClick={props.onChange} className={"relative w-10 h-6 rounded-full transition-colors " + (props.checked ? 'bg-purple-600' : 'bg-zinc-300')}>
        <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " + (props.checked ? 'translate-x-4' : '')}></span>
      </button>
    );
  }

  // ─── Tab Content Renderers ───

  function renderInfoTab() {
    return (
      <div className="space-y-6">
        {/* Logo */}
        <div>
          <label className={lbl}>Logo</label>
          <div className="flex items-center gap-4">
            {biz.logo ? (
              <img src={biz.logo} alt="" className="w-16 h-16 rounded-xl object-contain border border-zinc-200 p-1" />
            ) : (
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 text-xs">No logo</div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={handleLogoUpload} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg font-medium transition-colors">Upload</button>
              {biz.logo && (
                <button type="button" onClick={function () { setField('logo', ''); }} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition-colors">Remove</button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Business Name</label><input className={inp} value={biz.name} onChange={function (e) { setField('name', e.target.value); }} /></div>
          <div><label className={lbl}>Accent Color</label><div className="flex gap-2"><input type="color" value={biz.accent} onChange={function (e) { setField('accent', e.target.value); }} className="w-12 h-11 rounded-lg border border-zinc-200 cursor-pointer p-1" /><input className={inp + " flex-1"} value={biz.accent} onChange={function (e) { setField('accent', e.target.value); }} /></div></div>
        </div>
        <div><label className={lbl}>Tagline</label><input className={inp} value={biz.tagline} onChange={function (e) { setField('tagline', e.target.value); }} /></div>
        <div><label className={lbl}>Bio</label><textarea className={inp + " h-24 resize-none"} value={biz.bio} onChange={function (e) { setField('bio', e.target.value); }} /></div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Phone</label><input className={inp} value={biz.phone} onChange={function (e) { setField('phone', e.target.value); }} /></div>
          <div><label className={lbl}>WhatsApp</label><input className={inp} value={biz.whatsapp} onChange={function (e) { setField('whatsapp', e.target.value); }} /></div>
          <div><label className={lbl}>Email</label><input className={inp} value={biz.email} onChange={function (e) { setField('email', e.target.value); }} /></div>
          <div><label className={lbl}>Location</label><input className={inp} value={biz.location} onChange={function (e) { setField('location', e.target.value); }} /></div>
          <div><label className={lbl}>Hours</label><input className={inp} value={biz.hours} onChange={function (e) { setField('hours', e.target.value); }} /></div>
        </div>

        {/* Socials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Instagram URL</label><input className={inp} value={(biz.socials || {}).instagram || ''} onChange={function (e) { setField('socials', Object.assign({}, biz.socials, { instagram: e.target.value })); }} placeholder="https://instagram.com/..." /></div>
          <div><label className={lbl}>TikTok URL</label><input className={inp} value={(biz.socials || {}).tiktok || ''} onChange={function (e) { setField('socials', Object.assign({}, biz.socials, { tiktok: e.target.value })); }} placeholder="https://tiktok.com/..." /></div>
        </div>

        {/* Calendar ID only */}
        <div><label className={lbl}>Calendar ID (Email)</label><input className={inp} value={biz.calendarId} onChange={function (e) { setField('calendarId', e.target.value); }} /></div>

        {/* Feature Toggles — HIDDEN BY DEFAULT, triple-click name to show */}
        {showToggles && (
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Feature Toggles</h3>
              <button type="button" onClick={function () { setShowToggles(false); }} className="text-xs text-zinc-400 hover:text-zinc-600">Hide</button>
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
                  <div key={t[0]} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">{t[1]}</p>
                      <p className="text-xs text-zinc-400">{t[2]}</p>
                    </div>
                    <Toggle checked={biz[t[0]]} onChange={function () { setField(t[0], !biz[t[0]]); }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview Link */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 text-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Your Live Page</p>
          <a href={'/' + biz.slug} target="_blank" rel="noreferrer" className="text-purple-600 font-semibold text-sm hover:underline">
            booknaija.com/{biz.slug}
          </a>
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
            <h3 className="text-sm font-bold text-zinc-800">Gallery</h3>
            <span className="text-xs text-zinc-400">{totalImgs} photos</span>
          </div>
          <button type="button" onClick={addGalleryGroup} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg font-medium transition-colors">+ Add Group</button>
        </div>

        {(biz.gallery || []).length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">No gallery groups yet.</p>
        )}

        {(biz.gallery || []).map(function (group) {
          return (
            <div key={group.id} className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50">
              <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-zinc-100">
                <input className="flex-1 text-sm font-semibold text-zinc-800 bg-transparent border-0 focus:outline-none" value={group.group} onChange={function (e) { updateGalleryGroup(group.id, 'group', e.target.value); }} placeholder="Group name" />
                <button type="button" onClick={function () { removeGalleryGroup(group.id); }} className="text-zinc-300 hover:text-red-500 transition-colors p-1 text-lg leading-none">&times;</button>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  {(group.images || []).map(function (img, idx) {
                    return (
                      <div key={group.id + '-' + idx} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 group/img">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={function () { removeGalleryImage(group.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-xs">&times;</button>
                      </div>
                    );
                  })}
                  <button type="button" onClick={function () { uploadImage(function (url) { addGalleryImage(group.id, url); }, true); }} className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-all text-lg">+</button>
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
          <h3 className="text-sm font-bold text-zinc-800">Services ({(biz.services || []).length})</h3>
          <button type="button" onClick={function () { addItem('services', { id: Date.now(), name: '', duration: '', price: '', description: '', image: '', images: [], showDetails: true }); }} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.services || []).map(function (s) {
          return (
            <div key={s.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2">
              <button type="button" onClick={function () { removeItem('services', s.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500">&times;</button>
              <input className={inp} placeholder="Name" value={s.name} onChange={function (e) { setNested('services', s.id, { name: e.target.value }); }} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="Price" type="number" value={s.price} onChange={function (e) { setNested('services', s.id, { price: parseInt(e.target.value) || 0 }); }} />
                <input className={inp} placeholder="Duration" value={s.duration} onChange={function (e) { setNested('services', s.id, { duration: e.target.value }); }} />
              </div>
              <textarea className={inp + " h-16 resize-none"} placeholder="Description" value={s.description} onChange={function (e) { setNested('services', s.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(s.images || []).map(function (img, idx) {
                  return (
                    <div key={s.id + '-' + idx} className="aspect-square bg-white border border-zinc-200 rounded-lg overflow-hidden relative group/si">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeServiceImage(s.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/si:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(s.images || []).length < 3 && (
                  <button type="button" onClick={function () { addServiceImage(s); }} className="aspect-square bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-all text-sm">+</button>
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
          <h3 className="text-sm font-bold text-zinc-800">Products ({(biz.products || []).length})</h3>
          <button type="button" onClick={function () { addItem('products', { id: Date.now(), name: '', price: '', description: '', image: '', images: [], showDetails: true }); }} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.products || []).map(function (p) {
          return (
            <div key={p.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2">
              <button type="button" onClick={function () { removeItem('products', p.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500">&times;</button>
              <input className={inp} placeholder="Name" value={p.name} onChange={function (e) { setNested('products', p.id, { name: e.target.value }); }} />
              <input className={inp} placeholder="Price" type="number" value={p.price} onChange={function (e) { setNested('products', p.id, { price: parseInt(e.target.value) || 0 }); }} />
              <textarea className={inp + " h-16 resize-none"} placeholder="Description" value={p.description} onChange={function (e) { setNested('products', p.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(p.images || []).map(function (img, idx) {
                  return (
                    <div key={p.id + '-' + idx} className="aspect-square bg-white border border-zinc-200 rounded-lg overflow-hidden relative group/pi">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeProductImage(p.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/pi:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(p.images || []).length < 3 && (
                  <button type="button" onClick={function () { addProductImage(p); }} className="aspect-square bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-all text-sm">+</button>
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
          <h3 className="text-sm font-bold text-zinc-800">Cars ({(biz.cars || []).length})</h3>
          <button type="button" onClick={function () { addItem('cars', { id: Date.now(), name: '', type: 'rent', year: '', price: '', mileage: '', transmission: '', fuel: '', description: '', image: '', images: [] }); }} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.cars || []).map(function (c) {
          return (
            <div key={c.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2">
              <button type="button" onClick={function () { removeItem('cars', c.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500">&times;</button>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs"><input type="radio" name={"dt-" + c.id} checked={c.type === 'rent'} onChange={function () { setNested('cars', c.id, { type: 'rent' }); }} className="accent-purple-600" /> Rent</label>
                <label className="flex items-center gap-1 text-xs"><input type="radio" name={"dt-" + c.id} checked={c.type === 'sale'} onChange={function () { setNested('cars', c.id, { type: 'sale' }); }} className="accent-purple-600" /> Sale</label>
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
                    <div key={c.id + '-' + idx} className="aspect-video bg-white border border-zinc-200 rounded-lg overflow-hidden relative group/ci">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeCarImage(c.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/ci:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                <button type="button" onClick={function () { addCarImage(c); }} className="aspect-video bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-all text-sm">+</button>
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
          <h3 className="text-sm font-bold text-zinc-800">Food Menu ({(biz.food || []).length})</h3>
          <button type="button" onClick={function () { addItem('food', { id: Date.now(), name: '', price: '', description: '', image: '', images: [], addons: [] }); }} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg font-medium">+ Add</button>
        </div>
        {(biz.food || []).map(function (f) {
          return (
            <div key={f.id} className="relative p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2">
              <button type="button" onClick={function () { removeItem('food', f.id); }} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 z-10">&times;</button>
              <input className={inp} placeholder="Name" value={f.name} onChange={function (e) { setNested('food', f.id, { name: e.target.value }); }} />
              <input className={inp} placeholder="Price" type="number" value={f.price} onChange={function (e) { setNested('food', f.id, { price: parseInt(e.target.value) || 0 }); }} />
              <textarea className={inp + " h-16 resize-none"} placeholder="Description" value={f.description} onChange={function (e) { setNested('food', f.id, { description: e.target.value }); }} />
              <div className="grid grid-cols-3 gap-2">
                {(f.images || []).map(function (img, idx) {
                  return (
                    <div key={f.id + '-' + idx} className="aspect-square bg-white border border-zinc-200 rounded-lg overflow-hidden relative group/fi">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={function () { removeFoodImage(f.id, idx); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/fi:opacity-100 text-xs">&times;</button>
                    </div>
                  );
                })}
                {(f.images || []).length < 3 && (
                  <button type="button" onClick={function () { addFoodImage(f); }} className="aspect-square bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-purple-500 hover:text-purple-500 transition-all text-sm">+</button>
                )}
              </div>
              {/* Addons */}
              <div className="pt-3 border-t border-zinc-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Addons</span>
                  <button type="button" onClick={function () { addAddonGroup(f.id); }} className="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Add Group</button>
                </div>
                {(f.addons || []).map(function (addon) {
                  return (
                    <div key={addon.id} className="bg-white rounded-xl border border-zinc-200 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input className={inp + " flex-1 py-2 text-sm"} placeholder="Group name" value={addon.label} onChange={function (e) { updateAddonGroup(f.id, addon.id, 'label', e.target.value); }} />
                        <select className={sel + " w-24 py-2 text-sm"} value={addon.type} onChange={function (e) { updateAddonGroup(f.id, addon.id, 'type', e.target.value); }}>
                          <option value="single">Single</option>
                          <option value="multi">Multi</option>
                        </select>
                        <button type="button" onClick={function () { removeAddonGroup(f.id, addon.id); }} className="text-zinc-300 hover:text-red-500 p-1">&times;</button>
                      </div>
                      {(addon.options || []).map(function (opt) {
                        return (
                          <div key={opt.id} className="flex items-center gap-2">
                            <input className={inp + " flex-1 py-2 text-sm"} placeholder="Option" value={opt.name} onChange={function (e) { updateAddonOption(f.id, addon.id, opt.id, 'name', e.target.value); }} />
                            <div className="relative w-20">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">+&#8358;</span>
                              <input type="number" className={inp + " pl-7 py-2 text-sm"} value={opt.price || ''} onChange={function (e) { updateAddonOption(f.id, addon.id, opt.id, 'price', e.target.value); }} />
                            </div>
                            <button type="button" onClick={function () { removeAddonOption(f.id, addon.id, opt.id); }} className="text-zinc-300 hover:text-red-500 p-1">&times;</button>
                          </div>
                        );
                      })}
                      <button type="button" onClick={function () { addAddonOption(f.id, addon.id); }} className="w-full py-1.5 text-xs text-zinc-400 hover:text-purple-600 font-medium">+ Add Option</button>
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
      case 'gallery': return renderGalleryTab();
      case 'services': return renderServicesTab();
      case 'products': return renderProductsTab();
      case 'cars': return renderCarsTab();
      case 'food': return renderFoodTab();
      default: return null;
    }
  }

  var visibleTabs = getVisibleTabs();

  // ─── MAIN RENDER ───
  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex-shrink-0">
              <img src="/fav-removebg.png" alt="BookNaija" className="h-10 w-auto object-contain" />
            </a>
            <div className="h-6 w-px bg-zinc-200"></div>
            {/* Triple-click the name to show toggles */}
            <div onClick={handleNameClick} className="cursor-default select-none">
              <h1 className="text-sm font-bold text-zinc-900 leading-tight">{biz.name}</h1>
              <p className="text-xs text-zinc-400">booknaija.com/{biz.slug}</p>
            </div>
          </div>
          <a href={'/' + biz.slug} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:text-purple-800 font-semibold transition-colors">
            Preview Page &rarr;
          </a>
        </div>
      </div>

      {/* Tab Bar — only shows enabled tabs */}
      <div className="bg-white border-b border-zinc-100 px-6">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto">
          {visibleTabs.map(function (tab) {
            var isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={function () { setActiveTab(tab.id); }}
                className={"px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all " + (isActive ? 'border-purple-600 text-purple-600' : 'border-transparent text-zinc-400 hover:text-zinc-600')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSave}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {renderTabContent()}
        </div>

        {/* Sticky Save Button */}
        <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
            {saved && <p className="text-xs text-green-600 font-semibold">✓ Changes saved!</p>}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:bg-zinc-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}