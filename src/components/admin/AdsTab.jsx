// src/components/admin/AdsTab.jsx
import { useState, useEffect } from 'react';
import { getCsrfToken } from '../../lib/csrf';

const BUSINESS_TYPES = [
  'Lash Artist', 'Hair Stylist', 'Makeup Artist', 'Nail Technician',
  'Skin Care / Facialist', 'Fashion / Boutique', 'Restaurant / Food',
  'Auto Dealer / Rental', 'Real Estate', 'Shortlet', 'Cleaner', 'Tutor', 'Other',
];

const emptyAd = {
  id: null,
  advertiser_id: '',
  title: '',
  body: '',
  image_url: '',
  cta_text: 'Learn More',
  cta_url: '',
  targeting_type: 'all',
  targeting_values: [],
  starts_at: '',
  ends_at: '',
  active: true,
  priority: 0,
};

const emptyAdvertiser = {
  id: null,
  name: '',
  contact_email: '',
  contact_phone: '',
  logo_url: '',
  notes: '',
  active: true,
};

export default function AdsTab() {
  const [advertisers, setAdvertisers] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [showAdForm, setShowAdForm] = useState(false);
  const [showAdvertiserForm, setShowAdvertiserForm] = useState(false);
  const [adForm, setAdForm] = useState(emptyAd);
  const [advertiserForm, setAdvertiserForm] = useState(emptyAdvertiser);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/admin-local-ads', {
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      setAdvertisers(data.advertisers || []);
      setAds(data.ads || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const postAction = async (payload) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/admin-local-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      await fetchAll();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdvertiser = async () => {
    const ok = await postAction({ action: 'save_advertiser', ...advertiserForm });
    if (ok) {
      setShowAdvertiserForm(false);
      setAdvertiserForm(emptyAdvertiser);
    }
  };

  const handleSaveAd = async () => {
    const ok = await postAction({
      action: 'save_ad',
      ...adForm,
      targeting_values: adForm.targeting_type === 'business_type' ? adForm.targeting_values : [],
    });
    if (ok) {
      setShowAdForm(false);
      setAdForm(emptyAd);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    await postAction({ action: 'delete_ad', id });
  };

  const handleToggleAd = async (id, active) => {
    await postAction({ action: 'toggle_ad', id, active });
  };

  const openNewAd = () => {
    setAdForm({ ...emptyAd });
    setShowAdForm(true);
  };

  const openEditAd = (ad) => {
    setAdForm({
      id: ad.id,
      advertiser_id: ad.advertiser_id,
      title: ad.title || '',
      body: ad.body || '',
      image_url: ad.image_url || '',
      cta_text: ad.cta_text || 'Learn More',
      cta_url: ad.cta_url || '',
      targeting_type: ad.targeting_type || 'all',
      targeting_values: Array.isArray(ad.targeting_values) ? ad.targeting_values : [],
      starts_at: ad.starts_at ? ad.starts_at.slice(0, 16) : '',
      ends_at: ad.ends_at ? ad.ends_at.slice(0, 16) : '',
      active: ad.active !== false,
      priority: ad.priority || 0,
    });
    setShowAdForm(true);
  };

  const openNewAdvertiser = () => {
    setAdvertiserForm({ ...emptyAdvertiser });
    setShowAdvertiserForm(true);
  };

  const toggleTargetType = (type) => {
    setAdForm((prev) => {
      const set = new Set(prev.targeting_values);
      if (set.has(type)) set.delete(type);
      else set.add(type);
      return { ...prev, targeting_values: Array.from(set) };
    });
  };

  const inp = 'w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500';
  const lbl = 'text-xs text-zinc-400 font-medium mb-1 block';

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Advertisers section ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Advertisers ({advertisers.length})</h3>
          <button
            onClick={openNewAdvertiser}
            className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-200"
          >
            + New Advertiser
          </button>
        </div>

        {showAdvertiserForm && (
          <div className="mb-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl space-y-3">
            <div>
              <label className={lbl}>Name *</label>
              <input
                className={inp}
                value={advertiserForm.name}
                onChange={(e) => setAdvertiserForm({ ...advertiserForm, name: e.target.value })}
                placeholder="e.g. Ade's Phone Repair"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Contact email</label>
                <input
                  className={inp}
                  value={advertiserForm.contact_email}
                  onChange={(e) => setAdvertiserForm({ ...advertiserForm, contact_email: e.target.value })}
                />
              </div>
              <div>
                <label className={lbl}>Contact phone</label>
                <input
                  className={inp}
                  value={advertiserForm.contact_phone}
                  onChange={(e) => setAdvertiserForm({ ...advertiserForm, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className={lbl}>Logo URL</label>
              <input
                className={inp}
                value={advertiserForm.logo_url}
                onChange={(e) => setAdvertiserForm({ ...advertiserForm, logo_url: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
              />
            </div>
            <div>
              <label className={lbl}>Notes</label>
              <textarea
                className={inp + ' h-20 resize-none'}
                value={advertiserForm.notes}
                onChange={(e) => setAdvertiserForm({ ...advertiserForm, notes: e.target.value })}
                placeholder="Internal notes — payment terms, PO number, etc."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveAdvertiser}
                disabled={saving}
                className="flex-1 bg-white text-zinc-900 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Advertiser'}
              </button>
              <button
                onClick={() => { setShowAdvertiserForm(false); setAdvertiserForm(emptyAdvertiser); }}
                className="flex-1 bg-zinc-700 text-white py-2 rounded-lg text-sm font-bold hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {advertisers.map((adv) => (
            <div key={adv.id} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
              {adv.logo_url ? (
                <img src={adv.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                  {adv.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{adv.name}</p>
                {adv.contact_email && <p className="text-xs text-zinc-500 truncate">{adv.contact_email}</p>}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${adv.active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                {adv.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
          {advertisers.length === 0 && !showAdvertiserForm && (
            <p className="text-sm text-zinc-500 text-center py-4">
              No advertisers yet. Add one to start selling ads.
            </p>
          )}
        </div>
      </div>

      {/* ── Ads section ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Ads ({ads.length})</h3>
          <button
            onClick={openNewAd}
            className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-200"
          >
            + New Ad
          </button>
        </div>

        {showAdForm && (
          <div className="mb-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl space-y-3">
            <div>
              <label className={lbl}>Advertiser *</label>
              <select
                className={inp}
                value={adForm.advertiser_id}
                onChange={(e) => setAdForm({ ...adForm, advertiser_id: e.target.value })}
              >
                <option value="">Select advertiser...</option>
                {advertisers.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Title *</label>
              <input
                className={inp}
                value={adForm.title}
                onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                placeholder="e.g. Cracked phone screen?"
              />
            </div>
            <div>
              <label className={lbl}>Body</label>
              <textarea
                className={inp + ' h-20 resize-none'}
                value={adForm.body}
                onChange={(e) => setAdForm({ ...adForm, body: e.target.value })}
                placeholder="e.g. Same-day repair in Lekki. Walk in or WhatsApp."
              />
            </div>
            <div>
              <label className={lbl}>Image URL (optional)</label>
              <input
                className={inp}
                value={adForm.image_url}
                onChange={(e) => setAdForm({ ...adForm, image_url: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
              />
            </div>

            {/* ─── CTA + TARGETING (previously truncated) ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>CTA Text</label>
                <input
                  className={inp}
                  value={adForm.cta_text}
                  onChange={(e) => setAdForm({ ...adForm, cta_text: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
              <div>
                <label className={lbl}>CTA URL *</label>
                <input
                  className={inp}
                  value={adForm.cta_url}
                  onChange={(e) => setAdForm({ ...adForm, cta_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Targeting</label>
              <select
                className={inp}
                value={adForm.targeting_type}
                onChange={(e) =>
                  setAdForm({ ...adForm, targeting_type: e.target.value, targeting_values: [] })
                }
              >
                <option value="all">All business pages</option>
                <option value="business_type">Specific business types</option>
              </select>
            </div>

            {adForm.targeting_type === 'business_type' && (
              <div>
                <label className={lbl}>Show on these business types</label>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_TYPES.map((type) => {
                    const selected = adForm.targeting_values.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleTargetType(type)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                          selected
                            ? 'bg-white text-zinc-900 border-white'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Starts at</label>
                <input
                  type="datetime-local"
                  className={inp}
                  value={adForm.starts_at}
                  onChange={(e) => setAdForm({ ...adForm, starts_at: e.target.value })}
                />
              </div>
              <div>
                <label className={lbl}>Ends at (optional)</label>
                <input
                  type="datetime-local"
                  className={inp}
                  value={adForm.ends_at}
                  onChange={(e) => setAdForm({ ...adForm, ends_at: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Priority</label>
                <input
                  type="number"
                  className={inp}
                  value={adForm.priority}
                  onChange={(e) =>
                    setAdForm({ ...adForm, priority: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div>
                <label className={lbl}>Status</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adForm.active}
                    onChange={(e) => setAdForm({ ...adForm, active: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-600"
                  />
                  <span className="text-sm text-zinc-300">Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveAd}
                disabled={saving}
                className="flex-1 bg-white text-zinc-900 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : adForm.id ? 'Update Ad' : 'Create Ad'}
              </button>
              <button
                onClick={() => { setShowAdForm(false); setAdForm(emptyAd); }}
                className="flex-1 bg-zinc-700 text-white py-2 rounded-lg text-sm font-bold hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ─── ADS LIST (previously missing) ─── */}
        <div className="space-y-2">
          {ads.map((ad) => (
            <div key={ad.id} className="p-4 bg-zinc-800/30 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{ad.title}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {ad.advertiser_name} ·{' '}
                    {ad.targeting_type === 'all'
                      ? 'All business pages'
                      : `Targets: ${(ad.targeting_values || []).join(', ') || '(none)'}`}
                  </p>
                  {(ad.starts_at || ad.ends_at) && (
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {ad.starts_at ? `From ${new Date(ad.starts_at).toLocaleDateString()}` : 'No start'}
                      {ad.ends_at ? ` · Until ${new Date(ad.ends_at).toLocaleDateString()}` : ' · No end'}
                      {ad.priority ? ` · Priority ${ad.priority}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ad.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {ad.active ? 'Active' : 'Paused'}
                  </span>
                  <button
                    onClick={() => openEditAd(ad)}
                    className="text-zinc-400 hover:text-white transition-colors text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleAd(ad.id, !ad.active)}
                    className="text-zinc-400 hover:text-white transition-colors text-xs font-semibold"
                  >
                    {ad.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => handleDeleteAd(ad.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors text-xs font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ads.length === 0 && !showAdForm && (
            <p className="text-sm text-zinc-500 text-center py-4">
              No ads yet. Add an advertiser first, then create an ad.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}