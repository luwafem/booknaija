// src/components/admin/SettingsTab.jsx
import { useState, useEffect } from 'react';
import { optimizeImage } from '../../lib/utils'; // ✅ Fixed path

const ALL_BUSINESS_TYPES = [
  'Lash Artist', 'Hair Stylist', 'Makeup Artist', 'Nail Technician',
  'Skin Care / Facialist', 'Fashion / Boutique', 'Restaurant / Food',
  'Auto Dealer / Rental', 'Real Estate', 'Shortlet', 'Cleaner', 'Tutor', 'Other'
];

export default function SettingsTab({
  settings,
  toggleSetting,
  manualSlug,
  setManualSlug,
  manualAmount,
  setManualAmount,
  manualNote,
  setManualNote,
  handleManualPayment,
  manualLoading,
}) {
  // ─── Load Cloudinary widget script ───
  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // ─── Local state for disabled business types ───
  const [disabledTypes, setDisabledTypes] = useState(() => {
    try {
      const raw = settings?.disabled_business_types;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // ─── Local state for hero title ───
  const [heroTitle, setHeroTitle] = useState(settings?.hero_title || '');
  const [heroTitleLoading, setHeroTitleLoading] = useState(false);

  // ─── Local state for hero description ───
  const [heroDescription, setHeroDescription] = useState(settings?.hero_description || '');
  const [heroDescLoading, setHeroDescLoading] = useState(false);

  // ─── Local state for hero image ───
  const [heroImage, setHeroImage] = useState(settings?.hero_image || '');
  const [heroImageLoading, setHeroImageLoading] = useState(false);

  // Sync when settings change from outside
  useEffect(() => {
    try {
      const raw = settings?.disabled_business_types;
      setDisabledTypes(raw ? JSON.parse(raw) : []);
    } catch {
      setDisabledTypes([]);
    }
    setHeroTitle(settings?.hero_title || '');
    setHeroDescription(settings?.hero_description || '');
    setHeroImage(settings?.hero_image || '');
  }, [settings]);

  // ─── Toggle a single business type ───
  const toggleBusinessType = (type) => {
    const updated = disabledTypes.includes(type)
      ? disabledTypes.filter(t => t !== type)
      : [...disabledTypes, type];
    setDisabledTypes(updated);
    toggleSetting('disabled_business_types', JSON.stringify(updated));
  };

  // ─── Save hero title on blur ───
  const saveHeroTitle = () => {
    if (heroTitle !== settings?.hero_title) {
      setHeroTitleLoading(true);
      toggleSetting('hero_title', heroTitle);
      setTimeout(() => setHeroTitleLoading(false), 500);
    }
  };

  // ─── Save hero description on blur ───
  const saveHeroDescription = () => {
    if (heroDescription !== settings?.hero_description) {
      setHeroDescLoading(true);
      toggleSetting('hero_description', heroDescription);
      setTimeout(() => setHeroDescLoading(false), 500);
    }
  };

  // ─── Handle hero image upload via Cloudinary ───
  const handleHeroImageUpload = () => {
    if (!window.cloudinary) {
      alert('Image upload widget is still loading, please wait a moment.');
      return;
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'deexaiik4',
        uploadPreset: 'BizUploads',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        transformation: [{ width: 1200, crop: 'limit' }],
      },
      (error, result) => {
        if (!error && result.event === 'success') {
          const url = result.info.secure_url;
          setHeroImage(url);
          setHeroImageLoading(true);
          toggleSetting('hero_image', url);
          setTimeout(() => setHeroImageLoading(false), 500);
        }
      }
    );
    widget.open();
  };

  // ─── Remove hero image ───
  const removeHeroImage = () => {
    setHeroImage('');
    toggleSetting('hero_image', '');
  };

  // Feature flags list (filter out the keys we handle separately)
  const featureKeys = Object.keys(settings).filter(
    key => key !== 'disabled_business_types' && key !== 'hero_title' && key !== 'hero_description' && key !== 'hero_image'
  );

  return (
    <div className="space-y-6">
      {/* ─── FEATURE FLAGS ─── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Feature Flags</h3>
        <div className="space-y-3">
          {featureKeys.map((key) => (
            <div key={key} className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm text-zinc-300 capitalize">{key.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSetting(key, settings[key] === 'true' ? 'false' : 'true')}
                  className={`relative w-10 h-6 rounded-full transition-all ${
                    settings[key] === 'true' ? 'bg-purple-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                      settings[key] === 'true' ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
                <span className="text-xs text-zinc-500 w-20">{settings[key]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BUSINESS TYPES ─── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Enabled Business Types</h3>
        <p className="text-xs text-zinc-400 mb-3">
          Uncheck a type to hide it from signup forms.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_BUSINESS_TYPES.map((type) => {
            const isEnabled = !disabledTypes.includes(type);
            return (
              <label
                key={type}
                className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleBusinessType(type)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                {type}
              </label>
            );
          })}
        </div>
      </div>

      {/* ─── HERO TITLE & DESCRIPTION ─── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Landing Hero Text</h3>
        <div className="space-y-4">
          {/* Hero Title */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Hero Title</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                onBlur={saveHeroTitle}
                placeholder="e.g. Your business, always online"
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
              />
              {heroTitleLoading && (
                <span className="text-xs text-zinc-400">Saving...</span>
              )}
              {!heroTitleLoading && heroTitle === settings?.hero_title && settings?.hero_title && (
                <span className="text-xs text-green-400">Saved</span>
              )}
            </div>
          </div>

          {/* Hero Description */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Hero Description</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                onBlur={saveHeroDescription}
                placeholder="e.g. Stop losing customers to broken DMs..."
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
              />
              {heroDescLoading && (
                <span className="text-xs text-zinc-400">Saving...</span>
              )}
              {!heroDescLoading && heroDescription === settings?.hero_description && settings?.hero_description && (
                <span className="text-xs text-green-400">Saved</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-3">Leave blank to use the default text.</p>
      </div>

      {/* ─── HERO IMAGE ─── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Hero Image</h3>
        <p className="text-xs text-zinc-400 mb-3">
          This image will appear on the right side of the landing page hero.
        </p>
        <div className="flex flex-col gap-3">
          {/* Image preview – optimized for faster loading */}
          {heroImage ? (
            <div className="relative w-full max-w-md rounded-xl overflow-hidden border border-zinc-700">
              <img
                src={optimizeImage(heroImage, 800)}
                alt="Hero"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={removeHeroImage}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white text-xs font-bold px-2 py-1 rounded transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md h-40 bg-zinc-800 border border-dashed border-zinc-700 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
              No hero image set
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleHeroImageUpload}
              className="px-4 py-2 bg-white text-zinc-900 text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              {heroImage ? 'Change Image' : 'Upload Hero Image'}
            </button>
            {heroImageLoading && <span className="text-xs text-zinc-400 self-center">Saving...</span>}
            {!heroImageLoading && heroImage === settings?.hero_image && settings?.hero_image && (
              <span className="text-xs text-green-400 self-center">Saved</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── MANUAL PAYMENT ENTRY ─── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Manual Payment Entry</h3>
        <form onSubmit={handleManualPayment} className="space-y-3">
          <input
            type="text"
            placeholder="Business Slug"
            value={manualSlug}
            onChange={(e) => setManualSlug(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
            required
          />
          <input
            type="number"
            placeholder="Amount (₦)"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
            required
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={manualLoading}
            className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {manualLoading ? 'Processing...' : 'Record Payment & Extend'}
          </button>
        </form>
      </div>
    </div>
  );
}