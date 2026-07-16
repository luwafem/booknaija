export default function ChurnTab({ churnData }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Monthly Churn Rate</h3>
      {churnData?.churnData ? (
        <div>
          <div className="flex items-end gap-2 h-48">
            {churnData.churnData.slice(-12).map(({ month, churnRate }) => {
              const max = Math.max(...churnData.churnData.map(d => d.churnRate), 1);
              const height = (churnRate / max) * 100;
              return (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-red-500 rounded-t" style={{ height: `${height}%` }} />
                  <span className="text-[10px] text-zinc-400 mt-1">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-zinc-400">
            Average Churn: {Math.round(churnData.churnData.reduce((sum, d) => sum + d.churnRate, 0) / churnData.churnData.length * 100) / 100}%
          </div>
        </div>
      ) : <p className="text-zinc-400">Loading...</p>}
    </div>
  );
}