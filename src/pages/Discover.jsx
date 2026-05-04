import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEO from '../hooks/useSEO';

export default function Discover() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');

  useEffect(() => {
    const fetchBiz = async () => {
      const { data } = await supabase
        .from('businesses')
        .select('slug, name, tagline, location, logo, accent')
        .eq('active', true)
        .order('name');
      
      if (data) setBusinesses(data);
    };
    fetchBiz();
  }, []);

  // Get unique locations for filter
  const locations = ['All', ...new Set(businesses.map(b => b.location).filter(Boolean))];

  const filtered = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                         b.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === 'All' || b.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  return (
    <>
      <SEO 
        title="Discover Local Businesses in Nigeria"
        description="Browse the best service providers, product stores, and restaurants in Nigeria. Book securely on BookNaija."
      />

      <div className="min-h-screen bg-white text-zinc-900">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Discover Businesses</h1>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Browse our directory of verified Nigerian businesses. Book services and buy products securely.</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border border-zinc-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {/* Business Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(biz => (
              <Link 
                key={biz.slug} 
                to={`/${biz.slug}`}
                // THIS ANCHOR TEXT IS CRITICAL FOR SEO: "Lashes in Yaba" tells Google exactly what the linked page is about
                className="group block border border-zinc-100 rounded-2xl p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {biz.logo ? (
                    <img src={biz.logo} alt={`${biz.name} logo`} className="w-14 h-14 rounded-xl object-contain border border-zinc-50 p-1" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-400">
                      {biz.name?.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 group-hover:text-purple-600 transition-colors truncate">
                      {biz.name}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-0.5">{biz.tagline}</p>
                    {biz.location && (
                      <span className="inline-block mt-2 text-xs font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">
                        📍 {biz.location}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-zinc-400 mt-12">No businesses found.</p>
          )}
        </div>
      </div>
    </>
  );
}