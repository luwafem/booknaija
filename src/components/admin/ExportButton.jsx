export default function ExportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-xl transition-all"
    >
      Export CSV
    </button>
  );
}