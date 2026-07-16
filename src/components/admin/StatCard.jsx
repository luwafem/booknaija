export default function StatCard({ label, value, color = 'white' }) {
  const colorMap = {
    white: 'text-white',
    green: 'text-green-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-3xl font-black ${colorMap[color] || 'text-white'} mt-1`}>{value}</p>
    </div>
  );
}