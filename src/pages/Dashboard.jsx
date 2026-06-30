// src/pages/Dashboard.jsx
import { useDashboard } from '../hooks/useDashboard';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import SaveBar from '../components/dashboard/SaveBar';
import InfoTab from '../components/dashboard/InfoTab';
import SecurityTab from '../components/dashboard/SecurityTab';
import GalleryTab from '../components/dashboard/GalleryTab';
import OfflinePaymentsTab from '../components/dashboard/OfflinePaymentsTab';
import ServicesTab from '../components/dashboard/ServicesTab';
import ProductsTab from '../components/dashboard/ProductsTab';
import CarsTab from '../components/dashboard/CarsTab';
import FoodTab from '../components/dashboard/FoodTab';
import PropertiesTab from '../components/dashboard/PropertiesTab';
import EstatesTab from '../components/dashboard/EstatesTab';
import LocationPicker from '../components/LocationPicker';

export default function Dashboard() {
  const {
    biz,
    loading,
    slug,
    accent,
    activeTab,
    setActiveTab,
    saving,
    saved,
    error,
    showToggles,
    copied,
    urlCopied,
    showMapPicker,
    setShowMapPicker,
    subLoading,
    subMsg,
    bankUpdating,
    bankUpdateError,
    bankUpdateSuccess,
    bankName,
    setBankName,
    bankCode,
    setBankCode,
    bankAcc,
    setBankAcc,
    banks,
    offlineBookings,
    offlineLoading,
    isExpired,
    isWarning,
    daysLeft,
    getMapsReadiness,
    getVisibleTabs,
    resolveBankName,
    resolveBankCode,
    handleNameClick,
    handleCopyReferralLink,
    handleCopyPageUrl,
    handlePaySubscription,
    handleUpdateBank,
    handleVerifyOfflinePayment,
    handleSave,
    setField,
    setNested,
    addItem,
    removeItem,
    uploadImage,
    referralCount,
    freeMonthsEarned,
  } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white font-bold text-lg mb-1">Business not found</p>
          <p className="text-zinc-400 text-sm mb-4">No business with slug "{slug}" exists.</p>
          <a href="/dashboard" className="text-white hover:text-zinc-200 transition-colors duration-300 text-sm font-semibold">
            Try a different slug
          </a>
        </div>
      </div>
    );
  }

  // ─── UI SYSTEM TOKENS ───
  const inp =
    'w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-white/[0.12] focus:ring-1 focus:ring-white/[0.06] transition-all duration-300';
  const sel =
    'w-full appearance-none bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-white/[0.12] focus:ring-1 focus:ring-white/[0.06] transition-all duration-300 cursor-pointer';
  const lbl = 'block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5';
  const card = 'bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6';

  const visibleTabs = getVisibleTabs();
  const mapsReadiness = getMapsReadiness();
  const mapsClaimed = biz.googleMapsClaimed || false;

  // ─── RENDER THE ACTIVE TAB ───
  const renderTabContent = () => {
    const commonTabProps = {
      biz,
      setField,
      setNested,
      addItem,
      removeItem,
      uploadImage,
      accent,
      inp,
      sel,
      lbl,
      card,
    };

    switch (activeTab) {
      case 'info':
        return (
          <InfoTab
            {...commonTabProps}
            banks={banks}
            resolveBankCode={resolveBankCode}
            resolveBankName={resolveBankName}
            isExpired={isExpired}
            isWarning={isWarning}
            daysLeft={daysLeft}
            subLoading={subLoading}
            subMsg={subMsg}
            handlePaySubscription={handlePaySubscription}
            bankUpdating={bankUpdating}
            bankUpdateError={bankUpdateError}
            bankUpdateSuccess={bankUpdateSuccess}
            bankName={bankName}
            setBankName={setBankName}
            bankCode={bankCode}
            setBankCode={setBankCode}
            bankAcc={bankAcc}
            setBankAcc={setBankAcc}
            handleUpdateBank={handleUpdateBank}
            handleCopyReferralLink={handleCopyReferralLink}
            copied={copied}
            handleCopyPageUrl={handleCopyPageUrl}
            urlCopied={urlCopied}
            handleNameClick={handleNameClick}
            referralCount={referralCount}
            freeMonthsEarned={freeMonthsEarned}
            setShowMapPicker={setShowMapPicker}
            mapsClaimed={mapsClaimed}
            mapsReadiness={mapsReadiness}
            handleLogoUpload={() => uploadImage((url) => setField('logo', url), false, 1)}
          />
        );
      case 'security':
        return <SecurityTab accent={accent} inp={inp} lbl={lbl} card={card} />;
      case 'gallery':
        return (
          <GalleryTab
            {...commonTabProps}
            addGalleryGroup={() => addItem('gallery', { id: 'g-' + Date.now(), group: '', images: [] })}
            removeGalleryGroup={(id) => removeItem('gallery', id)}
            updateGalleryGroup={(id, field, val) => setNested('gallery', id, { [field]: val })}
            addGalleryImage={(gid, url) => {
              const group = biz.gallery.find((g) => g.id === gid);
              if (group) {
                setNested('gallery', gid, { images: [...group.images, url] });
              }
            }}
            removeGalleryImage={(gid, idx) => {
              const group = biz.gallery.find((g) => g.id === gid);
              if (group) {
                const newImages = group.images.filter((_, i) => i !== idx);
                setNested('gallery', gid, { images: newImages });
              }
            }}
            addHeroSlide={() => {
              const existingHero = biz.hero || '';
              setField('hero_slides', [...(biz.hero_slides || []), { id: 'hs-' + Date.now(), image: existingHero, mobileImage: '' }]);
              setField('hero', '');
            }}
            removeHeroSlide={(id) => setField('hero_slides', biz.hero_slides.filter((s) => s.id !== id))}
            uploadHeroSlideImage={(slideId, field) =>
              uploadImage((url) => {
                setField(
                  'hero_slides',
                  biz.hero_slides.map((s) => (s.id === slideId ? { ...s, [field]: url } : s))
                );
              }, false, 1)
            }
            revertToSingleHero={() => {
              const first = (biz.hero_slides || [])[0];
              setField('hero', first ? first.image || first.mobileImage || '' : '');
              setField('hero_slides', []);
            }}
          />
        );
      case 'offline-payments':
        return (
          <OfflinePaymentsTab
            offlineBookings={offlineBookings}
            offlineLoading={offlineLoading}
            handleVerifyOfflinePayment={handleVerifyOfflinePayment}
            accent={accent}
            card={card}
          />
        );
      case 'services':
        return <ServicesTab {...commonTabProps} />;
      case 'products':
        return <ProductsTab {...commonTabProps} />;
      case 'cars':
        return <CarsTab {...commonTabProps} />;
      case 'food':
        return <FoodTab {...commonTabProps} />;
      case 'properties':
        return <PropertiesTab {...commonTabProps} />;
      case 'estates':
        return <EstatesTab {...commonTabProps} />;
      default:
        return null;
    }
  };

  // ─── RENDER ───
  return (
    <>
      {/* Font load (same as before) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap"
        rel="stylesheet"
      />
      <style>{`body, body * { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }`}</style>

      <div className="min-h-screen bg-black text-white">
        <DashboardLayout
          biz={biz}
          accent={accent}
          visibleTabs={visibleTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          offlineBookings={offlineBookings}
          showToggles={showToggles}
          setField={setField}
        >
          {renderTabContent()}

          {/* SaveBar – always visible at bottom */}
          <SaveBar
            error={error}
            saved={saved}
            saving={saving}
            handleSave={handleSave}
            accent={accent}
          />
        </DashboardLayout>

        {/* Location Picker Modal */}
        {showMapPicker && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowMapPicker(false)}
          >
            <div
              className="w-full max-w-2xl bg-zinc-900 border border-white/[0.06] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white tracking-tight">Pick Location</h3>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(false)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-[400px]">
                <LocationPicker
                  lat={biz.lat || 6.5244}
                  lng={biz.lng || 3.3792}
                  onLocationSelect={(lat, lng) => {
                    setField('lat', lat);
                    setField('lng', lng);
                  }}
                />
              </div>
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">
                  {biz.lat && biz.lng ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {biz.lat.toFixed(4)}, {biz.lng.toFixed(4)}
                    </span>
                  ) : (
                    'Click the map to set location'
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(false)}
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