// src/components/bio/property/havenly/HavenlyProperties.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HAVENLY_BG, HAVENLY_BORDER, HAVENLY_DARK } from './HavenlyLayout';

const TYPE_LABEL = {
  rent: 'For Rent',
  sale: 'For Sale',
  shortlet: 'Shortlet',
};

export default function HavenlyProperties({ biz, accent, onSelectProperty }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const properties = biz.properties || [];
  if (!biz.propertiesEnabled || properties.length === 0) return null;

  // Build available filter tabs from data
  const availableTabs = [
    { key: 'all', label: 'All' },
    ...['rent', 'sale', 'shortlet']
      .filter((t) => properties.some((p) => p.type === t))
      .map((t) => ({ key: t, label: TYPE_LABEL[t] })),
  ];

  const filtered =
    activeFilter === 'all'
      ? properties
      : properties.filter((p) => p.type === activeFilter);

  const display = filtered.slice(0, 6);

  return (
    <section
      id="havenly-properties"
      className="py-20 lg:py-28"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1a1a]">
              Featured Properties
            </h2>
            <p className="text-sm text-[#6b6b6b] mt-3">
              Discover our handpicked selection of premium listings.
            </p>
          </div>

          {/* Filter tabs */}
          {availableTabs.length > 1 && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {availableTabs.map((tab) => {
                const active = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: active ? HAVENLY_DARK : 'transparent',
                      color: active ? '#ffffff' : '#6b6b6b',
                      border: active ? 'none' : `1px solid ${HAVENLY_BORDER}`,
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Grid */}
        {display.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {display.map((property) => (
              <HavenlyPropertyCard
                key={property.id}
                property={property}
                slug={biz.slug}
                accent={accent}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ backgroundColor: HAVENLY_BG }}
          >
            <p className="text-sm text-[#6b6b6b]">
              No properties in this category yet.
            </p>
          </div>
        )}

        {/* View all */}
        {filtered.length > 6 && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => {
                // Simple expand: show all by resetting filter
                setActiveFilter('all');
                // In a real pagination flow you'd load more here
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-[0.1em] uppercase transition-all hover:brightness-110"
              style={{ backgroundColor: HAVENLY_DARK, color: '#ffffff' }}
            >
              View All Properties
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function HavenlyPropertyCard({ property, slug, accent, onSelect }) {
  const image =
    property.images?.[0] ||
    property.image ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';

  const detailLink = `/${slug}/property/${property.id}`;
  const typeLabel = TYPE_LABEL[property.type] || 'Property';

  const formatPrice = (price) => {
    if (!price) return 'POA';
    return `₦${Number(price).toLocaleString()}`;
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col"
      style={{ border: `1px solid ${HAVENLY_BORDER}` }}
    >
      {/* Image */}
      <Link to={detailLink} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          loading="lazy"
        />
        {/* Type pill */}
        <span
          className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] uppercase rounded-full text-white shadow-sm"
          style={{ backgroundColor: HAVENLY_DARK }}
        >
          {typeLabel}
        </span>
      </Link>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={detailLink} className="group/title">
          <h3
            className="text-[17px] font-bold text-[#1a1a1a] leading-snug mb-2 line-clamp-1 group-hover/title:underline decoration-2 underline-offset-4"
            style={{ textDecorationColor: accent }}
          >
            {property.name}
          </h3>
        </Link>

        <p className="text-xs text-[#6b6b6b] flex items-center gap-1.5 mb-4">
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="line-clamp-1">{property.location || 'Lagos, Nigeria'}</span>
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-[11px] text-[#6b6b6b] pb-4 mb-4" style={{ borderBottom: `1px solid ${HAVENLY_BORDER}` }}>
          {property.bedrooms !== undefined && property.bedrooms !== '' && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
              </svg>
              {property.bedrooms} Beds
            </span>
          )}
          {property.bathrooms !== undefined && property.bathrooms !== '' && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15v3.75A4.125 4.125 0 0115.375 20h-6.75A4.125 4.125 0 014.5 15.75V12zm0 0V6a2.25 2.25 0 012.25-2.25h.008a2.25 2.25 0 012.242 2.25M21 12v-.75a2.25 2.25 0 00-2.25-2.25h-.008a2.25 2.25 0 00-2.242 2.25" />
              </svg>
              {property.bathrooms} Baths
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#a3a3a3] uppercase tracking-wider font-semibold mb-0.5">
              {property.type === 'rent' ? 'Per Month' : 'Price'}
            </p>
            <p className="text-lg font-extrabold tracking-tight" style={{ color: HAVENLY_DARK }}>
              {formatPrice(property.price)}
            </p>
          </div>

          <Link
            to={detailLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase transition-all duration-300 hover:brightness-110"
            style={{ backgroundColor: '#f4f2ec', color: '#1a1a1a' }}
          >
            View Details
            <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}