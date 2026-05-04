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
  
  // Dynamic SEO based on location filter
  const activeLocation = locationFilter !== 'All' ? locationFilter : null;
  const seoTitle = activeLocation 
    ? `Discover Businesses in ${activeLocation}` 
    : "Discover Local Businesses in Nigeria";
  const seoDesc = activeLocation
    ? `Browse verified service providers, product stores, and restaurants in ${activeLocation}. Find barbers, lash techs, food vendors, and more. Book securely via Paystack on BookNaija.`
    : "Browse the best service providers, product stores, and restaurants in Nigeria. Book services and buy products securely via Paystack on BookNaija.";

  const filtered = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                         b.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === 'All' || b.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDesc}
      />

      <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100 selection:text-zinc-900">
        
        {/* Header */}
        <nav className="bg-white sticky top-0 z-50 px-4 sm:px-6 border-b border-zinc-100">
          <div className="max-w-7xl mx-auto py-2.5 sm:py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img 
                src="/fav-removebg.png" 
                alt="BookNaija Logo" 
                className="h-12 sm:h-16 w-auto object-contain transition-transform hover:scale-105" 
              />
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link 
                to="/dashboard"
                className="text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 px-3 sm:px-4 py-2.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all active:scale-95 whitespace-nowrap"
              >
                Manage Business
              </Link>
              <Link 
                to="/signup" 
                className="text-xs sm:text-sm font-semibold text-white bg-zinc-900 px-3 sm:px-6 py-2.5 rounded-lg hover:bg-zinc-700 transition-all active:scale-95 whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-24">
          
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6">
              Find your next <span className="text-purple-600">favorite business</span>
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed max-w-2xl mx-auto">
              Browse our directory of verified Nigerian businesses. Book services, buy products, and pay securely all from their bio link.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 max-w-2xl mx-auto">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-300 rounded-xl leading-5 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 sm:text-sm shadow-sm transition-all"
              />
            </div>
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border border-zinc-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 sm:text-sm shadow-sm transition-all"
            >
              {locations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>)}
            </select>
          </div>

          {/* Business Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(biz => (
              <Link 
                key={biz.slug} 
                to={`/${biz.slug}`}
                className="group block border border-zinc-100 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {biz.logo ? (
                    <img 
                      src={biz.logo} 
                      alt={`${biz.name} logo`} 
                      className="w-14 h-14 rounded-xl object-contain border border-zinc-100 p-1 bg-zinc-50" 
                    />
                  ) : (
                    <div 
                      className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: biz.accent || '#c8a97e' }}
                    >
                      {biz.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '??'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold mb-1 text-zinc-900 tracking-tight group-hover:text-purple-600 transition-colors truncate">
                      {biz.name}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{biz.tagline}</p>
                    {biz.location && (
                      <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-md">
                        
                        {biz.location}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center mt-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-zinc-500 text-lg font-medium mb-2">No businesses found</p>
              <p className="text-zinc-400 text-sm mb-6">Try adjusting your search or location filters.</p>
              <button 
                onClick={() => { setSearch(''); setLocationFilter('All'); }}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white pt-20 pb-12 px-6 border-t border-zinc-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
              <div>
                <Link to="/" className="flex items-center">
                  <img 
                    src="/fav-removebg.png" 
                    alt="BookNaija Logo" 
                    className="h-20 w-auto object-contain" 
                  />
                </Link>
              </div>
              
              <div className="flex gap-16">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Directory</p>
                  <ul className="space-y-3 text-sm font-medium text-zinc-600">
                    <li><Link to="/discover" className="hover:text-zinc-900 transition-colors text-purple-600">All Businesses</Link></li>
                    <li><Link to="/signup" className="hover:text-zinc-900 transition-colors">List Your Business</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Company</p>
                  <ul className="space-y-3 text-sm font-medium text-zinc-600">
                    <li><Link to="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between gap-6 items-center">
              <p className="text-zinc-400 text-xs font-medium">
                © {new Date().getFullYear()} BookNaija Technologies.
              </p>
              <div className="flex gap-6 text-xs font-medium text-zinc-400">
                <Link to="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
                <Link to="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}