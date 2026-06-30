import { useRef } from 'react';

export default function TagInput({ items = [], onAdd, onRemove, placeholder }) {
  const inputRef = useRef(null);

  const handleAdd = () => {
    const val = inputRef.current?.value?.trim();
    if (val) {
      onAdd(val);
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 bg-white/[0.06] text-zinc-300 text-[11px] font-medium px-3 py-1.5 rounded-full"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-zinc-500 hover:text-red-400 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-white/[0.12] focus:ring-1 focus:ring-white/[0.06] transition-all duration-300 flex-1"
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.10] text-white text-[11px] font-semibold tracking-[0.1em] uppercase rounded-xl transition-all duration-300 whitespace-nowrap border border-white/[0.06]"
        >
          Add
        </button>
      </div>
    </div>
  );
}