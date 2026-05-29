export default function PropertyFooter({ biz, accent, isDark }) {
  const whatsappLink = biz.whatsapp ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}` : null;
  const socials = biz.socials || {};

  // Dynamic classes based on theme
  const themeClasses = isDark 
    ? {
        bg: 'bg-black',
        border: 'border-white/[0.06]',
        text: 'text-white',
        sub: 'text-zinc-500',
        hover: 'hover:text-white',
        linkHover: 'hover:border-white',
      }
    : {
        bg: 'bg-white',
        border: 'border-stone-200',
        text: 'text-stone-900',
        sub: 'text-stone-400',
        hover: 'hover:text-stone-900',
        linkHover: 'hover:border-stone-900',
      };

  return (
    <footer id="contact" className={`${themeClasses.bg} border-t ${themeClasses.border}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-20 md:py-24">
        
        {/* Top Section: Brand Statement */}
        <div className="mb-16 md:mb-20 max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            {biz.logo ? (
              <img src={biz.logo} alt={biz.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200/50" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white font-semibold text-sm">
                {biz.name?.charAt(0)}
              </div>
            )}
            <span className={`text-xl font-light tracking-wide ${themeClasses.text}`}>{biz.name}</span>
          </div>
          <p className={`text-sm leading-relaxed ${themeClasses.sub}`}>
            {biz.bio || `Discover premium properties and exceptional service with ${biz.name}.`}
          </p>
        </div>

        {/* Middle Section: Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
          
          {/* Navigation */}
          <div className="md:col-span-3">
            <h4 className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-6 ${themeClasses.sub}`}>
              Navigation
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#listings" className={`text-sm font-medium ${themeClasses.sub} ${themeClasses.hover} transition-colors duration-300`}>
                  Properties
                </a>
              </li>
              <li>
                <a href="#about" className={`text-sm font-medium ${themeClasses.sub} ${themeClasses.hover} transition-colors duration-300`}>
                  About Us
                </a>
              </li>
              {whatsappLink && (
                <li>
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className={`text-sm font-medium ${themeClasses.sub} ${themeClasses.hover} transition-colors duration-300`}>
                    Schedule Visit
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-5">
            <h4 className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-6 ${themeClasses.sub}`}>
              Get in Touch
            </h4>
            <ul className="space-y-4">
              {biz.phone && (
                <li>
                  <a href={`tel:${biz.phone}`} className={`flex items-center gap-3 text-sm ${themeClasses.sub} ${themeClasses.hover} transition-colors duration-300 group`}>
                    <svg className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    {biz.phone}
                  </a>
                </li>
              )}
              {biz.email && (
                <li>
                  <a href={`mailto:${biz.email}`} className={`flex items-center gap-3 text-sm ${themeClasses.sub} ${themeClasses.hover} transition-colors duration-300 group`}>
                    <svg className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    {biz.email}
                  </a>
                </li>
              )}
              {biz.location && (
                <li className={`flex items-start gap-3 text-sm ${themeClasses.sub}`}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {biz.location}
                </li>
              )}
            </ul>
          </div>

          {/* Socials & CTA */}
          <div className="md:col-span-4 md:text-right">
            <h4 className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-6 ${themeClasses.sub}`}>
              Connect
            </h4>
            <div className="flex items-center gap-3 md:justify-end mb-8">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full border ${themeClasses.border} flex items-center justify-center ${themeClasses.sub} ${themeClasses.hover} ${themeClasses.linkHover} transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full border ${themeClasses.border} flex items-center justify-center ${themeClasses.sub} ${themeClasses.hover} ${themeClasses.linkHover} transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full border ${themeClasses.border} flex items-center justify-center ${themeClasses.sub} ${themeClasses.hover} ${themeClasses.linkHover} transition-all duration-300`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              )}
            </div>

            {whatsappLink && (
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 border text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e7e5e4', color: isDark ? 'white' : '#1c1917' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = accent}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#e7e5e4'}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Book Inspection
              </a>
            )}
          </div>
        </div>

        {/* Bottom Section: Fine Print */}
        <div className={`pt-8 border-t ${themeClasses.border} flex flex-col md:flex-row items-center justify-between gap-4`}>
          <p className={`text-[10px] uppercase tracking-widest font-semibold ${themeClasses.sub}`}>
            © {new Date().getFullYear()} {biz.name}
          </p>
          <div className="flex items-center gap-6">
            <span className={`text-[10px] uppercase tracking-widest flex items-center gap-2 ${themeClasses.sub}`}>
              <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              Secured by Paystack
            </span>
            <span className={`text-[10px] uppercase tracking-widest ${themeClasses.sub}`}>
              Powered by BookNaija
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}