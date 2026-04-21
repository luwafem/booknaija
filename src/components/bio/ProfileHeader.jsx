export default function ProfileHeader({ biz }) {
  const accent = biz.accent || '#c8a97e';
  const initials = biz.name.split(' ').map((w) => w[0]).join('').substring(0, 2);

  return (
    <div className="-mt-16 px-6 flex items-end gap-4 relative z-10">
      <div
        className="w-[5.5rem] h-[5.5rem] rounded-2xl border-4 border-[#0a0a0a] overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-bold bg-[#111]"
        style={{ 
          color: accent,
          boxShadow: `0 8px 24px -6px ${accent}40` 
        }}
      >
        {biz.avatar ? (
          <img src={biz.avatar} alt={biz.name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="pb-2 min-w-0">
        <h1 className="text-xl font-bold tracking-tight truncate">{biz.name}</h1>
        <p className="text-stone-400 text-sm mt-0.5 truncate">{biz.tagline}</p>
      </div>
    </div>
  );
}