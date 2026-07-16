export default function GrowthTab({ growthData }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Business Growth (New Signups)</h3>
      {growthData?.growthData ? (
        <div className="flex items-end gap-2 h-64">
          {growthData.growthData.map(({ month, count }) => {
            const max = Math.max(...growthData.growthData.map(d => d.count), 1);
            const height = (count / max) * 100;
            return (
              <div key={month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-green-500 rounded-t" style={{ height: `${height}%` }} />
                <span className="text-[10px] text-zinc-400 mt-1">{month}</span>
              </div>
            );
          })}
        </div>
      ) : <p className="text-zinc-400">Loading...</p>}
    </div>
  );
}