import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EGREEN } from './EstateoLayout';

const BADGE_BG = {
  rent: '#2563eb',
  sale: EGREEN,
  shortlet: '#d97706',
};

const BADGE_LABEL = {
  rent: 'For Rent',
  sale: 'For Sale',
  shortlet: 'Shortlet',
};

export default function EstateoProperties({ biz, accent, onSelectProperty }) {
  const properties = (biz.properties || []).slice(0, 6);
  const [activeFilter, setActiveFilter] = useState('all');

  // Available filter tabs
  const types = ['all', 'rent', 'sale', 'shortlet'].filter(
    (t) => t === 'all' || (biz.properties || []).some((p) => p.type === t)
  );

  const filtered =
    activeFilter === 'all'
      ? properties
      : properties.filter((p) => p.type === activeFilter);

  if (!biz.propertiesEnabled || properties.length === 0) return null;

  return (
    <section id="properties" className="bg-[#f8f7f4] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <p
              className="text-[11px] font-bold tracking-[0.22em] uppercase mb-4 flex items-center gap-2"
              style={{ color: accent }}
            >
              <span className="w-8 h-px" style={{ backgroundColor: accent }} />
              Featured Properties
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-gray-900 max-w-2xl">
              Explore The Best Properties For You
            </h2>
          </div>

          {types.length > 2 && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveFilter(t)}
                  className={`px-4 py-2 text-xs font-bold tracking-wide rounded-full transition-all duration-300 ${
                    activeFilter === t
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                  }`}
                  style={activeFilter === t ? { backgroundColor: EGREEN } : {}}
                >
                  {t === 'all' ? 'All' : BADGE_LABEL[t]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {filtered.map((property) => (
              <EstateoPropertyCard
                key={property.id}
                property={property}
                slug={biz.slug}
                accent={accent}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <p className="text-gray-500 text-sm">
              No properties in this category yet.
            </p>
          </div>
        )}

        {/* View all CTA */}
        {biz.properties.length > 6 && (
          <div className="mt-12 text-center">
            <a
              href={`/${biz.slug}#listings`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold border-2 transition-all duration-300 hover:-translate-y-0.5"
              style={{ borderColor: EGREEN, color: EGREEN }}
            >
              View All Properties
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function EstateoPropertyCard({ property, slug, accent, onSelect }) {
  const image =
    property.images?.[0] ||
    property.image ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';

  const detailLink = `/${slug}/property/${property.id}`;
  const badgeBg = BADGE_BG[property.type] || EGREEN;
  const badgeLabel = BADGE_LABEL[property.type] || 'Property';

  const formatPrice = (price) => {
    if (!price) return 'POA';
    return `₦${Number(price).toLocaleString()}`;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <Link to={detailLink} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          loading="lazy"
        />
        {/* Badge */}
        <span
          className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-full text-white shadow-md"
          style={{ backgroundColor: badgeBg }}
        >
          {badgeLabel}
        </span>
        {/* "New" tag - fake for visual appeal */}
        <span className="absolute top-4 right-4 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-white text-gray-900 shadow-md">
          New
        </span>
      </Link>

      {/* Body */}
      <div className="p-5 lg:p-6 flex flex-col flex-1">
        <Link to={detailLink} className="group/title">
          <h3
            className="text-lg font-bold text-gray-900 leading-snug mb-1 group-hover/title:underline decoration-2 underline-offset-4"
            style={{ textDecorationColor: accent }}
          >
            {property.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-5">
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {property.location || 'Lagos, Nigeria'}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pb-4 border-b border-gray-100 mb-4">
          {property.bedrooms && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
              </svg>
              {property.bedrooms} Beds
            </span>
          )}
          {property.bathrooms && (
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
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
              {property.type === 'rent' ? 'Per Month' : 'Price'}
            </p>
            <p className="text-xl font-extrabold tracking-tight" style={{ color: accent }}>
              {formatPrice(property.price)}
            </p>
          </div>

          <Link
            to={detailLink}
            className="text-xs font-bold tracking-wide flex items-center gap-1.5 group/btn transition-colors"
            style={{ color: EGREEN }}
          >
            View Details
            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}