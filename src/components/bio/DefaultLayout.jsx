// src/components/bio/DefaultLayout.jsx
import HeroSection from './HeroSection';
import Gallery from './Gallery';
import ServiceList from './ServiceList';
import ProductList from './ProductList';
import FoodList from './FoodList';
import CarList from './CarList';
import LocalAdBanner from '../ads/LocalAdBanner';   // 👈 NEW
// Shared ad primitives from src/components/ads/.
import AdSlot from '../ads/AdSlot';
import StickyAd from '../ads/StickyAd';
import {
  AD_SLOT_TOP,
  AD_SLOT_INFEED,
  AD_SLOT_FOOTER,
  AD_SLOT_STICKY_MOBILE,
} from '../ads/adSlots';

const SectionHeading = ({ children, accent, id }) => (
  <div className="flex items-center gap-4 mb-8 md:mb-10">
    <div className="h-px flex-1" style={{ backgroundColor: accent + '15' }} />
    <h2 id={id} className="text-2xl md:text-3xl font-medium tracking-tight whitespace-nowrap text-black">
      {children}
    </h2>
    <div className="h-px flex-1" style={{ backgroundColor: accent + '15' }} />
  </div>
);

export default function DefaultLayout({
  biz,
  accent,
  isDark,
  ui,
  searchQuery,
  localAds,                    // 👈 NEW
  setSearchQuery,
  isSearchActive,
  activeService,
  activeProducts,
  activeFood,
  activeCar,
  handleServiceSelect,
  handleProductSelect,
  handleFoodSelect,
  handleCarSelect,
  showServices,
  showProducts,
  showFood,
  showCars,
  displayServices,
  displayProducts,
  displayFood,
  displayCars,
  servicesHasMore,
  loadMoreServices,
  servicesLoading,
  productsHasMore,
  loadMoreProducts,
  productsLoading,
  foodHasMore,
  loadMoreFood,
  foodLoading,
  carsHasMore,
  loadMoreCars,
  carsLoading,
  showPrimaryAd,
  showSecondaryAd,
  showFooterAd,
  faqs,
  faqQ,
  faqA,
  faqBadge,
  handleSearch,
  clearSearch,
  getCart,
  slug,
}) {
  // Local fallback so this component doesn't crash if a caller forgets to
  // pass setSearchQuery. When BioPage is updated to pass it, typing will
  // update the parent's state as intended.
  const fallbackSetSearchQuery = () => {};
  const updateSearchQuery = setSearchQuery || fallbackSetSearchQuery;

  // ─── AD GATING ─────────────────────────────────────────────────
  //
  // The three `<AdSlot>` gates (showPrimaryAd, showSecondaryAd,
  // showFooterAd) come in as props from BioPage and are the SINGLE
  // SOURCE OF TRUTH for in-page ad visibility. They encode:
  //   • ads enabled for this business (biz.adsEnabled !== false)
  //   • there is content on the page to place ads beside
  //   • the user is not currently searching
  //
  // We deliberately do NOT re-derive `adsEnabled` here. An earlier
  // version did (`const adsEnabled = biz.adsEnabled !== false`) and
  // passed it to <StickyAd>, which meant two gates existed in two
  // files. They agreed today but would drift the moment anyone added
  // a per-slot rule (e.g. "hide TOP on mobile"), and the drift would
  // be silent.
  //
  // The sticky banner is the ONE exception: it should render
  // whenever ads are enabled for the business, regardless of whether
  // the page has content or the user is searching. So we derive its
  // gate locally from the single business-level flag, inline. This
  // is not "a second gate" — it's the SAME business-level check, just
  // consulted directly because it isn't in the prop contract.
  //
  const stickyAdEnabled = biz.adsEnabled !== false;

  return (
    <>
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="flex flex-col xl:flex-row xl:h-screen overflow-hidden">

        <aside className="xl:sticky xl:top-0 h-screen xl:overflow-y-auto xl:overflow-x-hidden scrollbar-hide xl:shrink-0 xl:w-[35%]">
          <HeroSection biz={{
            logo: biz.logo, name: biz.name, slug: biz.slug, tagline: biz.tagline,
            bio: biz.bio, phone: biz.phone, whatsapp: biz.whatsapp, location: biz.location,
            hours: biz.hours, accent: biz.accent, avatar: biz.avatar, hero: biz.hero,
            gallery: biz.gallery, socials: biz.socials, theme: biz.theme
          }} />
        </aside>

        <main className={`flex-1 xl:w-[65%] xl:min-w-0 xl:overflow-y-auto ${ui.bg}`}>
          <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 pb-12 xl:pb-16">

            {biz.gallery && biz.gallery.length > 0 && (
              <div itemScope itemType="https://schema.org/ImageGallery" aria-label="Photo gallery" className="pt-10 lg:pt-14">
                <meta itemProp="name" content={`${biz.name} Gallery`} />
                <Gallery gallery={biz.gallery} accent={accent} location={biz.location} theme={isDark ? 'dark' : 'light'} />
              </div>
            )}

            {/* ── SEARCH BAR ── */}
            <section className="mt-12 lg:mt-16" aria-label="Search">
              <form onSubmit={handleSearch} className="relative" role="search" aria-label="Search services and products">
                <label htmlFor="business-search" className="sr-only">Search by name, code, or description</label>
                <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none" aria-hidden="true">
                  <svg className="w-4 h-4 transition-colors duration-300" style={{ color: searchQuery ? accent : accent + '40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  id="business-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  placeholder="Search by name, code, or description..."
                  className="w-full rounded-xl pl-6 pr-10 py-3 text-sm border focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: accent + '08',
                    borderColor: searchQuery ? accent : accent + '15',
                    color: isDark ? '#fff' : '#000',
                  }}
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="absolute inset-y-0 right-0 pr-4 flex items-center transition-opacity hover:opacity-70" style={{ color: accent }} aria-label="Clear search">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </form>
              {isSearchActive && searchQuery && (
                <div className="mt-3 flex items-center justify-between" role="status" aria-live="polite">
                  <p className="text-xs font-medium" style={{ color: accent }}>Showing results for "{searchQuery}"</p>
                  <button onClick={clearSearch} className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: accent }}>Clear</button>
                </div>
              )}
            </section>

            {/* ── LOCAL PARTNER AD ──
                One new banner position, between search and first content
                section. Only renders when a matching local ad exists for
                this business type. AdSense slots below are untouched.

                Gate: `localAds` comes from BioPage's `useLocalAds` hook,
                which already filters by businessType and active window.
                A truthy non-empty `localAds` is sufficient here — no
                extra `biz.adsEnabled` check needed. */}
            {localAds && localAds.length > 0 && (
              <LocalAdBanner ads={localAds} accent={accent} className="mt-12 lg:mt-16" />
            )}

            {/* ── ACCENT DIVIDER ── */}
            <div className="mt-12 lg:mt-16 flex items-center gap-3" aria-hidden="true">
              <div className="flex-1 h-px" style={{ backgroundColor: accent + '15' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
              <div className="flex-1 h-px" style={{ backgroundColor: accent + '15' }} />
            </div>

            {/* ── TOP AD ── */}
            <AdSlot
              slot={AD_SLOT_TOP}
              accent={accent}
              enabled={showPrimaryAd}
              format="horizontal"
              className="mt-12 lg:mt-16"
            />

            {/* ── ABOUT ── */}
            {biz.bio && (
              <section className="mt-16 lg:mt-24" aria-label="About business">
                <div className="border-l-2 pl-6 md:pl-8" style={{ borderColor: accent }}>
                  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
                    About {biz.name}
                  </h2>
                  <p className={`text-sm leading-[1.9] ${ui.sub}`}>
                    {biz.bio}
                  </p>
                </div>
              </section>
            )}

            {isSearchActive && !(showServices || showProducts || showFood || showCars) && (
              <div className="mt-16 lg:mt-24 text-center" role="status">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: accent + '08', boxShadow: `0 0 0 1px ${accent + '15'}` }}>
                  <svg className="w-6 h-6" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className={`text-sm font-medium ${ui.sub}`}>No results found</p>
                <button onClick={clearSearch} className="mt-4 px-5 py-2 text-xs font-semibold tracking-wide rounded-full transition-all duration-300 hover:opacity-80" style={{ backgroundColor: accent + '08', color: accent }}>
                  View All
                </button>
              </div>
            )}

            {/* ── SERVICES ── */}
            {showServices && (
              <section itemScope itemType="https://schema.org/ItemList" aria-label="Services" className="mt-16 lg:mt-24">
                <meta itemProp="name" content={`${biz.name} Services`} />
                <meta itemProp="numberOfItems" content={displayServices.length} />
                <SectionHeading accent={accent} id="services">Services</SectionHeading>
                <ServiceList services={displayServices} selectedId={activeService} onSelect={handleServiceSelect} accent={accent} location={biz.location} theme={isDark ? 'dark' : 'light'} />
                {!isSearchActive && servicesHasMore && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMoreServices}
                      disabled={servicesLoading}
                      className="px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: accent + '10', color: accent, border: `1px solid ${accent}20` }}
                    >
                      {servicesLoading ? 'Loading...' : 'Load More Services'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── PRODUCTS ── */}
            {showProducts && (
              <section itemScope itemType="https://schema.org/ItemList" aria-label={showServices ? 'Products' : 'Shop'} className="mt-16 lg:mt-24">
                <meta itemProp="name" content={`${biz.name} Products`} />
                <meta itemProp="numberOfItems" content={displayProducts.length} />
                <SectionHeading accent={accent} id="products">{showServices ? 'Products' : 'Shop'}</SectionHeading>
                <ProductList products={displayProducts} selectedProducts={activeProducts} onSelect={handleProductSelect} accent={accent} label={showServices ? 'Products' : 'Shop'} location={biz.location} theme={isDark ? 'dark' : 'light'} />
                {!isSearchActive && productsHasMore && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMoreProducts}
                      disabled={productsLoading}
                      className="px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: accent + '10', color: accent, border: `1px solid ${accent}20` }}
                    >
                      {productsLoading ? 'Loading...' : 'Load More Products'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── FOOD ── */}
            {showFood && (
              <section itemScope itemType="https://schema.org/ItemList" aria-label="Menu" className="mt-16 lg:mt-24">
                <meta itemProp="name" content={`${biz.name} Menu`} />
                <meta itemProp="numberOfItems" content={displayFood.length} />
                <SectionHeading accent={accent} id="menu">Menu</SectionHeading>
                <FoodList food={displayFood} selectedFood={activeFood} foodVariants={getCart().foodVariants || {}} onSelect={handleFoodSelect} accent={accent} location={biz.location} theme={isDark ? 'dark' : 'light'} />
                {!isSearchActive && foodHasMore && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMoreFood}
                      disabled={foodLoading}
                      className="px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: accent + '10', color: accent, border: `1px solid ${accent}20` }}
                    >
                      {foodLoading ? 'Loading...' : 'Load More Menu Items'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── CARS ── */}
            {showCars && (
              <section itemScope itemType="https://schema.org/ItemList" aria-label="Vehicles" className="mt-16 lg:mt-24">
                <meta itemProp="name" content={`${biz.name} Vehicles`} />
                <meta itemProp="numberOfItems" content={displayCars.length} />
                <SectionHeading accent={accent} id="vehicles">Vehicles</SectionHeading>
                <CarList cars={displayCars} selectedCar={activeCar ? biz.cars.find(c => c.id === activeCar) : null} onSelect={handleCarSelect} accent={accent} location={biz.location} theme={isDark ? 'dark' : 'light'} />
                {!isSearchActive && carsHasMore && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMoreCars}
                      disabled={carsLoading}
                      className="px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: accent + '10', color: accent, border: `1px solid ${accent}20` }}
                    >
                      {carsLoading ? 'Loading...' : 'Load More Vehicles'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── INFEED AD ── */}
            <AdSlot
              slot={AD_SLOT_INFEED}
              accent={accent}
              enabled={showSecondaryAd}
              format="fluid"
              className="mt-16 lg:mt-24"
            />

            {/* ── FAQ ── */}
            <section className="mt-16 lg:mt-24" aria-label="Frequently Asked Questions">
              <SectionHeading accent={accent} id="faq">FAQs</SectionHeading>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-2xl transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: accent }}
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex items-start gap-4">
                        <span
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
                          style={{ backgroundColor: faqBadge, color: '#fff' }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold mb-2.5" style={{ color: faqQ }}>
                            {faq.q}
                          </h3>
                          <p className="text-sm leading-relaxed" style={{ color: faqA }}>
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FOOTER AD ── */}
            <div style={{ borderTop: showFooterAd ? `1px solid ${accent + '15'}` : 'none' }} className={showFooterAd ? 'mt-16 lg:mt-24 pt-16' : 'mt-16 lg:mt-24'}>
              <AdSlot
                slot={AD_SLOT_FOOTER}
                accent={accent}
                enabled={showFooterAd}
                format="auto"
                className=""
              />
            </div>

            {/* ── FOOTER ── */}
            <footer className="mt-16 lg:mt-24 pt-10" style={{ borderTop: `1px solid ${accent + '15'}` }}>
              <div className="flex flex-col items-center text-center">
                <nav className="flex items-center gap-2 mb-8" aria-label="Legal links">
                  <a href="/privacy" className="px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 rounded-full" style={{ color: accent, backgroundColor: accent + '08' }}>
                    Privacy
                  </a>
                  <a href="/terms" className="px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 rounded-full" style={{ color: accent, backgroundColor: accent + '08' }}>
                    Terms
                  </a>
                </nav>

                <div className="flex items-center gap-6">
                  <span className="text-[10px] uppercase tracking-widest flex items-center gap-2 font-semibold" style={{ color: accent }}>
                    Secured by Paystack
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: accent }}>
                    Powered by Five9
                  </span>
                </div>
              </div>
            </footer>

          </div>
        </main>
      </div>

      {/* ── STICKY MOBILE AD ──
          Fixed bottom banner on phones only. Self-gates on scroll position
          (20%–85%) and dwell time (5s+), and never renders at lg+. Lives
          OUTSIDE the scroll container so it doesn't get clipped by the
          xl:overflow-y-auto on <main>.

          Gate is `stickyAdEnabled`, derived inline from the single
          business-level flag. Unlike the three <AdSlot> gates above
          (which come from BioPage because they also depend on content
          and search state), sticky visibility only depends on whether
          ads are enabled for this business. */}
      <StickyAd
        slot={AD_SLOT_STICKY_MOBILE}
        enabled={stickyAdEnabled}
        accent={accent}
      />
    </>
  );
}