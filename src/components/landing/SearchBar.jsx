import { Link } from 'react-router-dom';

export default function SearchBar({
  T,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  hasSearched,
}) {
  return (
    <div className="max-w-sm mt-8">
      <label className={`block text-sm font-medium ${T.textMuted} mb-2`}>
        Find a registered business
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className={`h-4 w-4 ${T.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className={`block w-full pl-9 pr-3 py-2.5 ${T.input} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="animate-spin h-4 w-4 text-lime-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>
      {searchQuery.trim() && (
        <div className={`mt-2 ${T.searchDrop} rounded-lg overflow-hidden shadow-xl`}>
          {isSearching ? (
            <div className="px-3 py-4 text-center">
              <p className={`text-sm ${T.textMuted}`}>Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-56 overflow-y-auto">
              {searchResults.map((b) => (
                <Link
                  key={b.slug}
                  to={'/' + b.slug}
                  className={`block px-3 py-2.5 transition-colors border-b last:border-0 ${T.searchItem}`}
                  onClick={() => setSearchQuery('')}
                >
                  <div className="flex items-center gap-2.5">
                    {b.logo ? (
                      <div className="bg-white rounded p-0.5">
                        <img src={b.logo} alt="" className="w-6 h-6 object-contain" />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: b.accent || '#52525b' }}
                      >
                        {b.name ? b.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() : '??'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${T.text} truncate`}>{b.name}</p>
                      <p className={`text-xs ${T.textMuted} truncate`}>{b.tagline}</p>
                    </div>
                    <div className={`text-[9px] font-semibold ${T.textAccent} ${T.accentBg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                      Visit
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="px-3 py-4 text-center">
              <p className={`text-sm ${T.textMuted}`}>No businesses found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}