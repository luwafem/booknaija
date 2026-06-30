// src/components/dashboard/GalleryTab.jsx
import ImageUploadArea from './ImageUploadArea';

export default function GalleryTab({
  biz,
  setField,
  addItem,
  removeItem,
  setNested,
  uploadImage,
  inp,
  lbl,
  card,
  addGalleryGroup,
  removeGalleryGroup,
  updateGalleryGroup,
  addGalleryImage,
  removeGalleryImage,
  addHeroSlide,
  removeHeroSlide,
  uploadHeroSlideImage,
  revertToSingleHero,
}) {
  const heroSlides = biz.hero_slides || [];
  const hasMultipleSlides = heroSlides.length > 0;
  const hasSingleHero = biz.hero && !hasMultipleSlides;

  return (
    <div className="space-y-6">
      {/* ─── HERO IMAGE ─── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white tracking-tight">Hero Image</h3>
          {!hasMultipleSlides && (
            <button
              type="button"
              onClick={addHeroSlide}
              className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
            >
              + Add Slides
            </button>
          )}
          {hasMultipleSlides && (
            <button
              type="button"
              onClick={revertToSingleHero}
              className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
            >
              Single Image Mode
            </button>
          )}
        </div>

        {hasSingleHero && (
          <ImageUploadArea
            currentImage={biz.hero}
            onUpload={() => uploadImage((url) => setField('hero', url), false, 1)}
            label="Hero Image"
            aspect="21/9"
          />
        )}

        {hasMultipleSlides && (
          <div className="space-y-4">
            {heroSlides.map((slide, idx) => (
              <div key={slide.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Slide {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeHeroSlide(slide.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors duration-200 text-xs"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ImageUploadArea
                    currentImage={slide.image}
                    onUpload={() => uploadHeroSlideImage(slide.id, 'image')}
                    label="Desktop Image"
                    aspect="21/9"
                  />
                  <ImageUploadArea
                    currentImage={slide.mobileImage}
                    onUpload={() => uploadHeroSlideImage(slide.id, 'mobileImage')}
                    label="Mobile Image"
                    aspect="9/16"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addHeroSlide}
              className="w-full py-3 border border-dashed border-white/[0.06] rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-300"
            >
              + Add Another Slide
            </button>
          </div>
        )}
      </div>

      {/* ─── GALLERY GROUPS ─── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white tracking-tight">Gallery Groups</h3>
          <button
            type="button"
            onClick={addGalleryGroup}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all duration-300 border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300"
          >
            + Add Group
          </button>
        </div>

        {(biz.gallery || []).length === 0 && (
          <div className="text-center py-12 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.02]">
            <p className="text-zinc-500 text-sm">No gallery groups yet.</p>
          </div>
        )}

        <div className="space-y-6">
          {(biz.gallery || []).map((group) => (
            <div key={group.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  className={inp + " text-sm font-medium"}
                  placeholder="Group name (e.g. Interior, Exterior)"
                  value={group.group || ''}
                  onChange={(e) => updateGalleryGroup(group.id, 'group', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryGroup(group.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors duration-200 ml-3"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {(group.images || []).map((img, imgIdx) => (
                  <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(group.id, imgIdx)}
                        className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => uploadImage((url) => addGalleryImage(group.id, url), true, 10)}
                className="w-full py-2.5 border border-dashed border-white/[0.06] rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-all duration-300"
              >
                + Add Images
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}