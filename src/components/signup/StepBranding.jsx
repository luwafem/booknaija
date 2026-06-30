// src/components/signup/StepBranding.jsx
export default function StepBranding({
  logoUrl,
  openUploadWidget,
  brandColor,
  setBrandColor,
  sectionTitle,
  sectionDesc,
  inputBase,
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className={sectionTitle}>Logo</p>
        <p className={sectionDesc}>Upload a square image for best results.</p>
        <div
          onClick={openUploadWidget}
          className="w-full aspect-square bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 hover:bg-zinc-700/50 transition-all relative overflow-hidden group"
        >
          {logoUrl ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img src={logoUrl} className="max-w-full max-h-full object-contain" alt="Logo Preview" />
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-zinc-400 font-medium">Tap to upload</span>
            </>
          )}
        </div>
        {logoUrl && (
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }}
              className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div>
        <p className={sectionTitle}>Brand color</p>
        <p className={sectionDesc}>Pick a color or enter a hex code.</p>
        <div className="flex items-center border rounded-xl p-1.5 transition-all bg-zinc-800" style={{ borderColor: brandColor }}>
          <div className="relative w-12 h-10 rounded-lg overflow-hidden cursor-pointer shrink-0 shadow-sm border border-zinc-700">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
            />
            <div className="w-full h-full pointer-events-none" style={{ backgroundColor: brandColor }}></div>
          </div>
          <div className="relative flex-1 mx-2">
            <input
              type="text"
              value={brandColor}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                if (/^#([0-9A-F]{0,6})$/i.test(val)) setBrandColor(val);
              }}
              maxLength="7"
              placeholder="RRGGBB"
              className="w-full h-10 bg-transparent text-sm font-mono font-bold text-white focus:outline-none uppercase placeholder-zinc-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}