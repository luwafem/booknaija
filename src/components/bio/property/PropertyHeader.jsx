// PropertyHeader.jsx — unchanged, no background to fix
import { useState, useEffect } from 'react';

export default function PropertyHeader({ biz, accent, isDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappLink = biz.whatsapp
    ? `https://wa.me/234${biz.whatsapp.replace(/^0/, '')}`
    : '#';

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent backdrop-blur-xl border-b-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="flex items-center gap-3.5 group">
              {biz.logo ? (
                <img
                  src={biz.logo}
                  alt={biz.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs backdrop-blur-sm"
                  style={{ backgroundColor: accent || '#333333' }}
                >
                  {biz.name?.charAt(0)}
                </div>
              )}
              <span className="font-semibold text-[15px] tracking-wide hidden sm:block text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition-colors duration-300">
                {biz.name}
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-10">
              {['Listings', 'About', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative group transition-colors duration-300 text-white/80 hover:text-white py-2"
                >
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {item}
                  </span>
                  <span
                    className="absolute -bottom-0.5 left-0 w-0 h-[1px] transition-all duration-300 ease-out group-hover:w-full"
                    style={{ backgroundColor: accent || '#ffffff' }}
                  />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-2.5 px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase border border-white/25 text-white hover:border-white/60 hover:bg-white/5 transition-all duration-300 rounded-full"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Inquire
              </a>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors duration-300"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div 
        className={`md:hidden fixed inset-0 z-[60] transition-all duration-500 ${
          mobileOpen ? 'visible' : 'invisible'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/95 transition-opacity duration-500 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <div 
          className={`relative flex flex-col items-center justify-center h-full px-8 transition-all duration-500 ease-out ${
            mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200 rounded-xl"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <nav className="flex flex-col items-center gap-2">
            {['Listings', 'About', 'Contact'].map((item, i) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="group relative block py-3 text-center transition-all duration-300"
                style={{
                  transitionDelay: mobileOpen ? `${80 + i * 70}ms` : '0ms',
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <span className="text-3xl font-light tracking-[0.04em] text-white/90 group-hover:text-white transition-colors duration-200">
                  {item}
                </span>
                <span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[1px] transition-all duration-300 ease-out group-hover:w-full"
                  style={{ backgroundColor: accent || '#ffffff' }}
                />
              </a>
            ))}
          </nav>

          <div
            className="mt-12 w-full max-w-xs transition-all duration-500"
            style={{
              transitionDelay: mobileOpen ? '300ms' : '0ms',
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full px-6 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border border-white/25 text-white hover:border-white/60 hover:bg-white/5 transition-all duration-300 rounded-full"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Inquire via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}