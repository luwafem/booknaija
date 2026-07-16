const colorMap = {
  green: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
  red: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
  blue: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30',
  pink: 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30',
};

export default function ActionButton({ onClick, label, color = 'blue', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all ${colorMap[color] || colorMap.blue} disabled:opacity-50`}
    >
      {disabled ? '...' : label}
    </button>
  );
}