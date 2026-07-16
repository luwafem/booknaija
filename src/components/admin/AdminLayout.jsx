import React from 'react';

const TABS = [
  'overview', 'revenue', 'growth', 'geo', 'churn',
  'businesses', 'affiliates', 'payouts', 'transactions',
  'settings', 'system', 'reports'
];

export default function AdminLayout({ activeTab, setActiveTab, children, stats, onLogout }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Nav */}
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight">⚙️ Super Admin</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 font-bold uppercase">Beta</span>
          </div>
          <div className="flex items-center gap-4">
            {(stats?.expiringSoon > 0 || stats?.pendingFailedPayouts > 0) && (
              <div className="flex gap-2">
                {stats.expiringSoon > 0 && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {stats.expiringSoon} expiring
                  </span>
                )}
                {stats.pendingFailedPayouts > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {stats.pendingFailedPayouts} failed payouts
                  </span>
                )}
              </div>
            )}
            <button onClick={onLogout} className="text-xs text-zinc-400 hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-zinc-800 px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}