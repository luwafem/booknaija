import StatCard from './StatCard';

export default function RevenueTab({ revenue, stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₦${revenue?.totalRevenue?.toLocaleString() || 0}`} />
        <StatCard label="MRR (This Month)" value={`₦${revenue?.mrr?.toLocaleString() || 0}`} color="green" />
        <StatCard label="Active Subscriptions" value={revenue?.activeSubscriptions || 0} color="blue" />
        <StatCard label="Avg Revenue / User" value={`₦${revenue?.activeSubscriptions ? Math.round(revenue.totalRevenue / revenue.activeSubscriptions) : 0}`} color="yellow" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Last 12 Months Revenue</h3>
        {revenue?.monthlyRevenue && (
          <div className="flex items-end gap-2 h-48">
            {Object.entries(revenue.monthlyRevenue).map(([month, amount]) => {
              const max = Math.max(...Object.values(revenue.monthlyRevenue), 1);
              const height = (amount / max) * 100;
              return (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-purple-500 rounded-t" style={{ height: `${height}%` }} />
                  <span className="text-[10px] text-zinc-400 mt-1">{month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Churn Rate (Estimate)</h3>
        <p className="text-zinc-300">
          {stats.totalBusinesses > 0
            ? `${Math.round(((stats.totalBusinesses - stats.activeBusinesses) / stats.totalBusinesses) * 100)}%`
            : '0%'}
        </p>
      </div>
    </div>
  );
}