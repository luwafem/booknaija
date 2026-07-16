import StatCard from './StatCard';

export default function OverviewTab({ stats, revenue, growthData, logs, setActiveTab }) {
  const monthly = revenue?.monthlyRevenue || {};

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Businesses" value={stats.totalBusinesses || 0} />
        <StatCard label="Active" value={stats.activeBusinesses || 0} color="green" />
        <StatCard label="MRR (This Month)" value={`₦${revenue?.mrr?.toLocaleString() || 0}`} color="blue" />
        <StatCard label="Failed Payouts" value={stats.pendingFailedPayouts || 0} color="red" />
        <StatCard label="Total Affiliates" value={stats.totalAffiliates || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Revenue Overview</h3>
          {Object.keys(monthly).length > 0 && (
            <div className="flex items-end gap-2 h-32">
              {Object.entries(monthly).slice(-6).map(([month, amount]) => {
                const max = Math.max(...Object.values(monthly), 1);
                const height = (amount / max) * 100;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-purple-500 rounded-t" style={{ height: `${height}%` }} />
                    <span className="text-[10px] text-zinc-400 mt-1">{month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-zinc-400 mt-3">Total: ₦{revenue?.totalRevenue?.toLocaleString() || 0}</p>
        </div>

        {/* Growth preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Growth (Last 6 Months)</h3>
          {growthData?.growthData && (
            <div className="flex items-end gap-2 h-32">
              {growthData.growthData.slice(-6).map(({ month, count }) => {
                const max = Math.max(...growthData.growthData.map(d => d.count), 1);
                const height = (count / max) * 100;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-green-500 rounded-t" style={{ height: `${height}%` }} />
                    <span className="text-[10px] text-zinc-400 mt-1">{month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white">Recent System Logs</h3>
            <button onClick={() => setActiveTab('logs')} className="text-xs text-zinc-400 hover:text-white">
              View All →
            </button>
          </div>
          {logs.length === 0 ? (
            <p className="text-zinc-400 text-sm">No logs available.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-xs border-b border-zinc-800 pb-2">
                  <span className={`font-bold uppercase px-2 py-0.5 rounded ${
                    log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                    log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-zinc-300 flex-1 break-all truncate">{log.message}</span>
                  <span className="text-zinc-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}