export default function SettingsTab({
  settings, toggleSetting,
  manualSlug, setManualSlug,
  manualAmount, setManualAmount,
  manualNote, setManualNote,
  handleManualPayment, manualLoading,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Feature Flags</h3>
        <div className="space-y-3">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm text-zinc-300 capitalize">{key.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSetting(key, value === 'true' ? 'false' : 'true')}
                  className={`relative w-10 h-6 rounded-full transition-all ${
                    value === 'true' ? 'bg-purple-500' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                    value === 'true' ? 'translate-x-4' : ''
                  }`} />
                </button>
                <span className="text-xs text-zinc-500 w-20">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Manual Payment Entry</h3>
        <form onSubmit={handleManualPayment} className="space-y-3">
          <input
            type="text"
            placeholder="Business Slug"
            value={manualSlug}
            onChange={(e) => setManualSlug(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
            required
          />
          <input
            type="number"
            placeholder="Amount (₦)"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
            required
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={manualLoading}
            className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {manualLoading ? 'Processing...' : 'Record Payment & Extend'}
          </button>
        </form>
      </div>
    </div>
  );
}