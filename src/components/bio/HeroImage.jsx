export default function HeroImage({ src, accent }) {
  const fallback = (
    <div
      className="h-52 w-full"
      style={{ background: `linear-gradient(145deg, ${accent}40 0%, ${accent}05 60%, transparent 100%)` }}
    />
  );

  if (!src) return fallback;

  return (
    <div className="h-60 w-full overflow-hidden bg-[#111] relative">
      <img
        src={src}
        alt="Business cover"
        className="w-full h-full object-cover scale-105"
        loading="eager"
      />
      {/* Gradient fade into the dark background */}
      <div 
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, #0a0a0a 5%, transparent 60%)` }}
      />
    </div>
  );
}