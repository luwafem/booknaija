export default function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full transition-all duration-300 ${
        checked ? 'bg-white' : 'bg-white/[0.06]'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-black rounded-full shadow-sm transition-all duration-300 ${
          checked ? 'translate-x-[18px]' : ''
        }`}
      />
    </button>
  );
}