import { EGREEN, buildWhatsAppLink } from './EstateoLayout';

export default function EstateoAgents({ biz, accent }) {
  const team = (biz.team || []).slice(0, 3);
  if (team.length === 0) return null;

  const waLink = buildWhatsAppLink(biz.whatsapp, `Hi ${biz.name}, I'd like to speak with an agent.`);

  return (
    <section id="agents" className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="text-[11px] font-bold tracking-[0.22em] uppercase mb-4 inline-flex items-center gap-2"
            style={{ color: accent }}
          >
            <span className="w-8 h-px" style={{ backgroundColor: accent }} />
            Our Team
            <span className="w-8 h-px" style={{ backgroundColor: accent }} />
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-gray-900 max-w-2xl mx-auto mb-4">
            Meet Our Agents
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Get to know the professionals who will guide you through every step of your
            property journey.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {team.map((member, idx) => {
            const initials = member.name
              ? member.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : '?';

            return (
              <div
                key={member.id || idx}
                className="group bg-[#f8f7f4] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  {member.headshot ? (
                    <img
                      src={member.headshot}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                      style={{ backgroundColor: EGREEN }}
                    >
                      {initials}
                    </div>
                  )}

                  {/* Hover overlay with contact */}
                  {waLink && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-full"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contact {member.name?.split(' ')[0]}
                      </a>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p
                    className="text-xs font-bold tracking-[0.15em] uppercase mb-3"
                    style={{ color: accent }}
                  >
                    {member.position || 'Agent'}
                  </p>
                  {member.bio && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}