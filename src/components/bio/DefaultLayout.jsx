// src/components/bio/DefaultLayout.jsx
import { useEffect } from 'react';
import HeroSection from './HeroSection';
import Gallery from './Gallery';
import ServiceList from './ServiceList';
import ProductList from './ProductList';
import FoodList from './FoodList';
import CarList from './CarList';

// GoogleAd and ReferralLink components are reused from BioPage – we can import them or duplicate.
// For simplicity, we'll import them from BioPage or define them locally.

// Assuming we have a shared GoogleAd component – we'll import from BioPage or define a shared file.
// For brevity, we'll keep them here; in a real project, move to a shared file.

const GoogleAd = ({ slot, className = '' }) => {
  // (same implementation as in BioPage – can be imported from a shared file)
  // For now, we'll assume it's defined globally or we'll copy it.
  return <div>Ad placeholder</div>;
};

const ReferralLink = ({ slug, accent }) => {
  // (same)
  return <div>Referral link</div>;
};

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
  // Optional: scroll to top on mount, etc.

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
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search by name, code, or description..." 
                  className="w-full rounded-xl pl-6 pr-10 py-3 text-sm border focus:outline-none transition-all duration-300"
                  style={{ 
                    backgroundColor: accent + '08',
                    borderColor: searchQuery ? accent : accent + '15',
                    color: isDark ? '#fff' : '#000',
                  }}
                  onFocus={(e) => { if (!searchQuery) e.target.style.borderColor = accent; }}
                  onBlur={(e) => { if (!searchQuery) e.target.style.borderColor = accent + '15'; }}
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

            {/* ── ACCENT DIVIDER ── */}
            <div className="mt-12 lg:mt-16 flex items-center gap-3" aria-hidden="true">
              <div className="flex-1 h-px" style={{ backgroundColor: accent + '15' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
              <div className="flex-1 h-px" style={{ backgroundColor: accent + '15' }} />
            </div>

            {showPrimaryAd && (
              <div className="mt-12 lg:mt-16">
                <div className="rounded-2xl p-6 lg:p-8 flex flex-col items-center" style={{ backgroundColor: accent + '08', borderColor: accent + '15', borderWidth: '1px' }}>
                  <span className="text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold text-center block" style={{ color: accent }}>Sponsored</span>
                  <GoogleAd slot="1234567890" className="w-full max-w-md" />
                </div>
              </div>
            )}

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

            {showSecondaryAd && (
              <div className="mt-16 lg:mt-24">
                <div className="rounded-2xl p-6 lg:p-8 flex flex-col items-center" style={{ backgroundColor: accent + '08', borderColor: accent + '15', borderWidth: '1px' }}>
                  <span className="text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold text-center block" style={{ color: accent }}>Sponsored</span>
                  <GoogleAd slot="1111111111" className="w-full max-w-md" />
                </div>
              </div>
            )}

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

            {showFooterAd && (
              <div className="mt-16 lg:mt-24 pt-16" style={{ borderTop: `1px solid ${accent + '15'}` }}>
                <div className="rounded-2xl p-6 lg:p-8 flex flex-col items-center" style={{ backgroundColor: accent + '08', borderColor: accent + '15', borderWidth: '1px' }}>
                  <span className="text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold text-center block" style={{ color: accent }}>Sponsored</span>
                  <GoogleAd slot="0987654321" className="w-full max-w-md mx-auto" />
                </div>
              </div>
            )}

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
    </>
  );
}