// PropertyListings.jsx
import { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';

export default function PropertyListings({ biz, accent, isDark, onSelectProperty }) {
  const isShortletBusiness = biz.businessType === 'Shortlet';
  const whatsappBase = biz.whatsapp ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}` : null;
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsSortOpen(false);
    if (isSortOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSortOpen]);

  const theme = isDark
    ? {
        bg: 'bg-black',
        text: 'text-white',
        sub: 'text-zinc-400',
        muted: 'text-zinc-500',
        emptyBg: 'bg-white/[0.02]',
        pillInactive: 'hover:bg-white/[0.06]',
        dropdownBg: 'bg-zinc-900 border-white/10 shadow-2xl shadow-black/50',
        activeOpt: 'bg-white/10 text-white',
        inactiveOpt: 'text-zinc-400 hover:bg-white/5 hover:text-white',
      }
    : {
        bg: 'bg-white',
        text: 'text-black',
        sub: 'text-gray-600',
        muted: 'text-gray-500',
        emptyBg: 'bg-white',
        pillInactive: 'hover:bg-gray-100',
        dropdownBg: 'bg-white border-gray-100 shadow-2xl shadow-black/10',
        activeOpt: 'bg-gray-100 text-gray-900',
        inactiveOpt: 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
      };

  const properties = biz.properties || [];

  // Determine which tabs to show based on available data
  const types = [
    { key: 'all', label: 'All' },
    { key: 'rent', label: 'For Rent' },
    { key: 'sale', label: 'For Sale' },
    { key: 'shortlet', label: 'Shortlets' },
  ];

  const availableTabs = types.filter(
    (tab) => tab.key === 'all' || properties.some((p) => p.type === tab.key)
  );

  // Clone array to avoid mutating original data, then filter
  let filteredAndSorted = activeFilter === 'all'
    ? [...properties]
    : properties.filter((p) => p.type === activeFilter);

  // Apply sorting
  if (sortOrder === 'low-to-high') {
    filteredAndSorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortOrder === 'high-to-low') {
    filteredAndSorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }

  const getSortLabel = () => {
    if (sortOrder === 'low-to-high') return 'Low to High';
    if (sortOrder === 'high-to-low') return 'High to Low';
    return 'Sort by Price';
  };

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'low-to-high', label: 'Price: Low to High' },
    { value: 'high-to-low', label: 'Price: High to Low' },
  ];

  return (
    <section id="listings" className={`transition-colors duration-500 ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-24 md:py-32 lg:py-40">

        <div className="text-center mb-12 md:mb-16">
          <h2 className={`text-3xl md:text-5xl font-medium tracking-tight ${theme.text}`}>
            {isShortletBusiness ? 'Available Shortlets' : 'Our Properties'}
          </h2>
        </div>

        {/* ─── FILTER TABS & SORT ─── */}
        {properties.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 md:mb-16">
            
            {/* Filter Tabs */}
            {availableTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 rounded-full ${
                  activeFilter === tab.key
                    ? 'text-white shadow-sm'
                    : `${theme.sub} ${theme.pillInactive}`
                }`}
                style={activeFilter === tab.key ? { backgroundColor: accent } : {}}
              >
                {tab.label}
              </button>
            ))}

            {/* Custom Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsSortOpen(!isSortOpen); }}
                className={`px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 rounded-full inline-flex items-center gap-2 ${theme.sub} ${theme.pillInactive}`}
              >
                {getSortLabel()}
                <svg 
                  className={`w-3 h-3 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div 
                className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl border p-1.5 min-w-[200px] z-50 transition-all duration-200 origin-top ${
                  isSortOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 invisible'
                } ${theme.dropdownBg}`}
                onClick={(e) => e.stopPropagation()}
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortOrder(opt.value); setIsSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[11px] font-semibold tracking-[0.05em] rounded-lg transition-colors duration-200 ${
                      sortOrder === opt.value ? theme.activeOpt : theme.inactiveOpt
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ─── PROPERTY GRID ─── */}
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredAndSorted.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                accent={accent}
                isDark={isDark}
                onSelect={onSelectProperty}
                whatsappBase={whatsappBase}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-24 ${theme.emptyBg}`}>
            <svg className={`w-12 h-12 mx-auto mb-4 opacity-20 ${theme.sub}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className={`text-sm font-medium ${theme.sub}`}>
              No properties listed yet.
            </p>
            <p className={`text-xs mt-1 ${theme.muted}`}>
              Check back soon for new additions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}