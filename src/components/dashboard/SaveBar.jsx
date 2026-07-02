// src/components/dashboard/SaveBar.jsx
export default function SaveBar({ error, saved, saving, handleSave, accent }) {
  return (
    <div className="sticky bottom-0 -mx-6 sm:-mx-10 px-6 sm:px-10 py-4 mt-10 bg-gradient-to-t from-black via-black to-transparent">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        {error && (
          <div className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-[11px] text-zinc-300 truncate">{error}</p>
          </div>
        )}
        {saved && !error && (
          <div className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[11px] text-zinc-300">Changes saved</p>
          </div>
        )}
        {!error && !saved && <div className="flex-1" />}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-shrink-0 inline-flex items-center gap-2.5 px-8 py-3 text-white text-[11px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: accent }}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}