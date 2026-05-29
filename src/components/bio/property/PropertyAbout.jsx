export default function PropertyAbout({ biz, accent, isDark }) {
  const team = biz.team || [];

  // Don't render if there's no bio AND no team
  if (!biz.bio && team.length === 0) return null;

  const themeClasses = isDark 
    ? {
        bg: 'bg-black',
        text: 'text-white',
        sub: 'text-zinc-500',
      }
    : {
        bg: 'bg-white',
        text: 'text-stone-900',
        sub: 'text-stone-400',
      };

  return (
    <section id="about" className={`py-24 md:py-32 ${themeClasses.bg}`}>
      <div className="max-w-5xl mx-auto px-6 sm:px-10">

        {/* ─── ABOUT BIO ─── */}
        {biz.bio && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className="block w-8 h-[1px] opacity-40" style={{ backgroundColor: accent }}></span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: accent }}>
                About Us
              </span>
              <span className="block w-8 h-[1px] opacity-40" style={{ backgroundColor: accent }}></span>
            </div>

            <h2 className={`text-3xl md:text-5xl font-light tracking-tight mb-8 ${themeClasses.text}`}>
              {biz.name}
            </h2>

            <p className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto ${themeClasses.sub}`}>
              {biz.bio}
            </p>
          </div>
        )}

        {/* ─── TEAM MEMBERS ─── */}
        {team.length > 0 && (
          <div className={biz.bio ? 'mt-20 md:mt-28' : ''}>
            <div className="flex items-center justify-center gap-4 mb-12 md:mb-16">
              <span className="block w-8 h-[1px] opacity-40" style={{ backgroundColor: accent }}></span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: accent }}>
                Meet The Team
              </span>
              <span className="block w-8 h-[1px] opacity-40" style={{ backgroundColor: accent }}></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
              {team.map((member, idx) => (
                <div key={member.id || idx} className="text-center group">
                  {/* Headshot with accent gradient ring */}
                  <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-6">
                    {member.headshot ? (
                      <div 
                        className="w-full h-full rounded-full overflow-hidden p-[3px]" 
                        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}40)` }}
                      >
                        <div className={`w-full h-full rounded-full overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
                          <img 
                            src={member.headshot} 
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full rounded-full flex items-center justify-center text-2xl md:text-3xl font-light"
                        style={{ backgroundColor: accent + '15', color: accent }}
                      >
                        {member.name 
                          ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                          : '?'}
                      </div>
                    )}
                  </div>

                  <h3 className={`text-base md:text-lg font-medium mb-1 ${themeClasses.text}`}>
                    {member.name}
                  </h3>
                  
                  <p 
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" 
                    style={{ color: accent }}
                  >
                    {member.position}
                  </p>

                  {member.bio && (
                    <p className={`text-sm leading-relaxed max-w-[280px] mx-auto ${themeClasses.sub}`}>
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}