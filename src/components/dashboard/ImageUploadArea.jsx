export default function ImageUploadArea({ currentImage, onUpload, label, aspect = '4/3' }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
        {label}
      </label>
      <div
        className="relative overflow-hidden rounded-xl border border-white/[0.06] cursor-pointer group transition-all duration-300 hover:border-white/[0.12]"
        style={{ aspectRatio: aspect }}
        onClick={onUpload}
      >
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Change Image
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02]">
            <svg className="w-8 h-8 text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <span className="text-[10px] font-semibold text-zinc-500 tracking-[0.15em] uppercase">Upload Image</span>
          </div>
        )}
      </div>
    </div>
  );
}