// src/components/bio/property/havenly/HavenlyHeader.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HAVENLY_BG, HAVENLY_BORDER } from './HavenlyLayout';

const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Properties', href: '#havenly-properties' },
  { label: 'About', href: '#havenly-about' },
  { label: 'Contact', href: '#havenly-contact' },
];

export default function HavenlyHeader({ biz, accent }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        id="top"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
        style={{ borderBottom: scrolled ? `1px solid ${HAVENLY_BORDER}` : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            {/* Logo */}
            <Link to={`/${biz.slug}`} className="flex items-center gap-2.5 shrink-0">
              {biz.logo ? (
                <img
                  src={biz.logo}
                  alt={biz.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: accent }}
                >
                  {biz.name?.charAt(0) || 'H'}
                </div>
              )}
              <span className="font-bold text-[15px] tracking-tight text-[#1a1a1a] hidden sm:block">
                {biz.name}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-[13px] font-medium text-[#6b6b6b] hover:text-[#1a1a1a] rounded-full transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${HAVENLY_BORDER}` }}>
              <span className="font-bold text-[#1a1a1a]">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4f2ec]"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offset for fixed header */}
      <div className="h-16 lg:h-[68px]" />
    </>
  );
}