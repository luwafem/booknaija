export default function GeoTab({ geoData }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Business Distribution by State</h3>
      {geoData?.geoData ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {geoData.geoData.map(({ state, count }) => (
            <div key={state} className="flex items-center gap-3">
              <span className="text-sm text-zinc-300 w-32 truncate">{state}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-purple-500 rounded-full h-2"
                  style={{ width: `${(count / geoData.geoData[0].count) * 100}%` }}
                />
              </div>
              <span className="text-sm text-zinc-400">{count}</span>
            </div>
          ))}
        </div>
      ) : <p className="text-zinc-400">Loading...</p>}
    </div>
  );
}