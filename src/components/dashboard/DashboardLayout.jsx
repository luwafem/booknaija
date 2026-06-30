// src/components/dashboard/DashboardLayout.jsx
import Toggle from './Toggle';

export default function DashboardLayout({
  children,
  biz,
  accent,
  visibleTabs,
  activeTab,
  setActiveTab,
  offlineBookings,
  showToggles,
  setField,
}) {
  return (
    <>
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a href={`/${biz.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 group">
                {biz.logo ? (
                  <img src={biz.logo} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/[0.06] transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium" style={{ backgroundColor: `${accent}15`, color: accent }}>
                    {biz.name ? biz.name.charAt(0) : '?'}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-300 hidden sm:block tracking-wide">{biz.name}</span>
              </a>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-2 py-0.5 bg-white/[0.03] rounded-full hidden sm:block">Dashboard</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/${biz.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-300"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                View Page
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-300"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Exit
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN LAYOUT ─── */}
      <div className="pt-16 flex min-h-screen">
        {/* ─── SIDEBAR ─── */}
        <aside className="fixed top-16 left-0 bottom-0 w-56 bg-black border-r border-white/[0.06] overflow-y-auto hidden lg:block">
          <nav className="p-3 space-y-0.5">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 text-[11px] font-semibold tracking-[0.05em] rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-white/[0.06]'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'offline-payments' && offlineBookings.filter(b => b.status === 'pending').length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full">
                      {offlineBookings.filter(b => b.status === 'pending').length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {showToggles && (
            <div className="p-4 mt-2 border-t border-white/[0.06]">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3">Features</p>
              <div className="space-y-3">
                {[
                  { key: 'servicesEnabled', label: 'Services' },
                  { key: 'productsEnabled', label: 'Products' },
                  { key: 'carsEnabled', label: 'Cars' },
                  { key: 'foodEnabled', label: 'Food' },
                  { key: 'propertiesEnabled', label: 'Properties' },
                  { key: 'estatesEnabled', label: 'Estates' },
                ].map((t) => (
                  <label key={t.key} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                      {t.label}
                    </span>
                    <Toggle
                      checked={biz[t.key] || false}
                      onChange={() => setField(t.key, !biz[t.key])}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ─── MOBILE TABS ─── */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex overflow-x-auto no-scrollbar px-3 py-2 gap-1">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase rounded-full transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={isActive ? { backgroundColor: accent } : {}}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── CONTENT AREA ─── */}
        <main className="flex-1 lg:ml-56">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-8 lg:py-10 pt-20 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}