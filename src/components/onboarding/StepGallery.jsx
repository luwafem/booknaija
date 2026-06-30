// src/components/onboarding/StepGallery.jsx
export default function StepGallery({
  gallery,
  addGroup,
  removeGroup,
  updateGroupName,
  addGalleryImage,
  removeGalleryImage,
  handleGalleryUpload,
  sectionTitle,
  sectionDesc,
  inputBase,
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className={sectionTitle}>Photo Gallery</p>
        <p className={sectionDesc}>Organize your photos into groups. Add at least one group.</p>
      </div>

      <div className="space-y-4">
        {gallery.map(group => (
          <div key={group.id} className="border border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/50">
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
              <input
                type="text"
                value={group.group}
                onChange={e => updateGroupName(group.id, e.target.value)}
                placeholder="Group name (e.g. Our Work)"
                className="flex-1 text-sm font-semibold text-white bg-transparent border-0 focus:outline-none placeholder-zinc-500"
              />
              {group.images.length > 0 && (
                <span className="text-[10px] text-zinc-400 bg-zinc-700 px-2 py-0.5 rounded-full">
                  {group.images.length}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeGroup(group.id)}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {group.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-700 border border-zinc-700 group">
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(group.id, imgIdx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleGalleryUpload(group.id)}
                  className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all"
                >
                  <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px]">Add</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-zinc-700 text-zinc-400 text-xs font-semibold hover:border-zinc-500 hover:text-zinc-300 transition-all flex items-center justify-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add New Group
      </button>
    </div>
  );
}