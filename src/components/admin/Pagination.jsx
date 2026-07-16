export default function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
      <button
        disabled={page <= 1}
        onClick={() => setPage(p => p - 1)}
        className="text-xs text-zinc-400 hover:text-white disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-xs text-zinc-400">Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => setPage(p => p + 1)}
        className="text-xs text-zinc-400 hover:text-white disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}