// PropertyAbout.jsx
export default function PropertyAbout({ biz, accent, isDark }) {
  const team = biz.team || [];

  if (!biz.bio && team.length === 0) return null;

  const theme = isDark
    ? {
        bg: 'bg-black',
        text: 'text-white',
        sub: 'text-zinc-300',
        muted: 'text-zinc-400',
        card: 'bg-white/[0.03]',
        pill: 'bg-white/[0.06]',
      }
    : {
        bg: 'bg-white',
        text: 'text-black',
        sub: 'text-gray-600',
        muted: 'text-gray-500',
        card: 'bg-white',
        pill: 'bg-gray-100',
      };

  const stats = [
    { value: biz.referralCount || '10+', label: 'Happy Clients' },
    { value: team.length > 0 ? `${team.length}+` : '5+', label: 'Team Members' },
    { value: '8+', label: 'Years Experience' },
    { value: '50+', label: 'Projects Completed' },
  ];

  const whatsappLink = biz.whatsapp
    ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}`
    : null;

  return (
    <section id="about" className={`relative ${theme.bg} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-24 md:py-32 lg:py-40">

        {/* ─── SECTION HEADER ─── */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className={`text-3xl md:text-5xl font-medium tracking-tight ${theme.text}`}>
            About Us
          </h2>
        </div>

        {/* ─── BIO ─── */}
        {biz.bio && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24 md:mb-36">
            <div className="lg:col-span-4 flex items-end">
              <p className={`text-2xl md:text-3xl lg:text-[2.5rem] font-medium leading-[1.25] tracking-tight ${theme.text}`}>
                {biz.bio.split('.').slice(0, 2).join('.').trim()}
                {biz.bio.split('.').length > 2 ? '.' : ''}
              </p>
            </div>

            <div className="lg:col-span-8 flex flex-col justify-end">
              <div className="border-l-2 pl-8 md:pl-10" style={{ borderColor: accent + '50' }}>
                <p className={`text-sm md:text-base leading-[1.9] ${theme.sub} mb-8`}>
                  {biz.bio}
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {biz.phone && (
                    <a
                      href={`tel:${biz.phone}`}
                      className={`inline-flex items-center gap-2.5 px-4 py-2 text-xs font-medium tracking-wide transition-colors duration-300 ${theme.sub} ${theme.pill} rounded-full hover:opacity-70`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      {biz.phone}
                    </a>
                  )}
                  {biz.email && (
                    <a
                      href={`mailto:${biz.email}`}
                      className={`inline-flex items-center gap-2.5 px-4 py-2 text-xs font-medium tracking-wide transition-colors duration-300 ${theme.sub} ${theme.pill} rounded-full hover:opacity-70`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      {biz.email}
                    </a>
                  )}
                  {biz.location && (
                    <span className={`inline-flex items-center gap-2.5 px-4 py-2 text-xs font-medium tracking-wide ${theme.sub} ${theme.pill} rounded-full`}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      {biz.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STATS ─── */}
        <div className="mb-24 md:mb-36">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center py-6 md:py-10">
                <p className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-2 md:mb-3" style={{ color: accent }}>
                  {stat.value}
                </p>
                <p className={`text-[10px] md:text-[11px] font-semibold tracking-[0.25em] uppercase ${theme.muted}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── TEAM ─── */}
        {team.length > 0 && (
          <div>
            <div className="text-center mb-12 md:mb-16">
              <h2 className={`text-3xl md:text-5xl font-medium tracking-tight ${theme.text}`}>
                The Team
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {team.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className={`group text-center p-6 md:p-8 transition-all duration-500 ${isDark ? 'hover:bg-white/[0.03] border border-white/[0.06]' : 'hover:bg-gray-50 border border-gray-100'} rounded-2xl`}
                >
                  <div className="w-14 h-14 mb-6 mx-auto overflow-hidden rounded-xl" style={{ boxShadow: `0 0 0 1px ${accent}40` }}>
                    {member.headshot ? (
                      <img
                        src={member.headshot}
                        alt={member.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-base font-light"
                        style={{ backgroundColor: accent + '15', color: accent }}
                      >
                        {member.name
                          ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                          : '?'}
                      </div>
                    )}
                  </div>

                  <h3 className={`text-base font-medium mb-1 ${theme.text}`}>
                    {member.name}
                  </h3>

                  <p
                    className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4"
                    style={{ color: accent }}
                  >
                    {member.position}
                  </p>

                  <div
                    className="w-6 h-px mb-4 mx-auto transition-all duration-500 group-hover:w-12 rounded-full"
                    style={{ backgroundColor: accent + '40' }}
                  />

                  {member.bio && (
                    <p className={`text-sm leading-relaxed ${theme.sub}`}>
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CLOSING LINE ─── */}
        {biz.bio && whatsappLink && (
          <div className="mt-24 md:mt-36 text-center">
            <p className={`text-sm md:text-base font-medium tracking-wide ${theme.sub}`}>
              Ready to find your dream property?{' '}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold px-4 py-1.5 rounded-full transition-all duration-300 hover:opacity-80"
                style={{ backgroundColor: accent + '15', color: accent }}
              >
                Let's talk
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </p>
          </div>
        )}

      </div>
    </section>
  );
}