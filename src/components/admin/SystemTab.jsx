export default function SystemTab({ health, loading, logs }) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Health Check</h3>
        {health ? (
          <div className="space-y-2">
            {Object.entries(health).map(([service, status]) => (
              <div key={service} className="flex items-center gap-3 border-b border-zinc-800 pb-2">
                <span className="text-sm text-zinc-300 capitalize">{service}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  status.status === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {status.status === 'ok' ? '✓ Operational' : '✗ Error'}
                </span>
                {status.message && <span className="text-xs text-zinc-400">{status.message}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">Loading health status...</p>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Backup</h3>
        <button
          onClick={() => window.open('/.netlify/functions/admin-backup', '_blank')}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
        >
          Download Database Backup
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">System Logs (Last 20)</h3>
        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-zinc-400">No logs.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.slice(0, 20).map(log => (
              <div key={log.id} className="flex items-start gap-2 text-xs border-b border-zinc-800 pb-2">
                <span className={`font-bold uppercase px-2 py-0.5 rounded ${
                  log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                  log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {log.level}
                </span>
                <span className="text-zinc-300 flex-1 break-all">{log.message}</span>
                <span className="text-zinc-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Environment Variables (Non‑secret)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="text-xs text-zinc-400">NODE_ENV: {process.env.NODE_ENV || 'not set'}</div>
          <div className="text-xs text-zinc-400">VITE_ENVIRONMENT: {import.meta.env.VITE_ENVIRONMENT || 'not set'}</div>
        </div>
      </div>
    </div>
  );
}