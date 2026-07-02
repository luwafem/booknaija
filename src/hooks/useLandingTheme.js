import { useState, useCallback, useMemo } from 'react';

export function useLandingTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bn-theme') || 'dark';
    return 'dark';
  });

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('bn-theme', next);
  }, [theme]);

  const d = theme === 'dark';

  const T = useMemo(() => ({
    page: d ? 'bg-[#050505]' : 'bg-white',
    pageText: d ? 'text-white' : 'text-zinc-900',
    nav: d ? 'bg-[#050505]/90 border-white/[0.08]' : 'bg-white/90 border-zinc-300',
    text: d ? 'text-white' : 'text-zinc-900',
    textSub: d ? 'text-zinc-300' : 'text-zinc-700',
    textMuted: d ? 'text-zinc-400' : 'text-zinc-600',
    textFaint: d ? 'text-zinc-600' : 'text-zinc-400',
    textAccent: d ? 'text-lime-400' : 'text-lime-700',
    border: d ? 'border-white/[0.08]' : 'border-zinc-300',
    borderHover: d ? 'hover:border-white/15' : 'hover:border-zinc-400',
    borderSub: d ? 'border-white/[0.05]' : 'border-zinc-200',
    sectionBorder: d ? 'border-white/[0.06]' : 'border-zinc-200',
    card: d ? 'bg-white/[0.04]' : 'bg-zinc-100',
    cardAlt: d ? 'bg-white/[0.06]' : 'bg-zinc-200/70',
    input: d
      ? 'bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:ring-lime-500/50 focus:border-lime-500/50'
      : 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:ring-lime-500/30 focus:border-lime-500/30',
    searchDrop: d ? 'bg-zinc-900 border-white/10 shadow-black/40' : 'bg-white border-zinc-300 shadow-lg',
    searchItem: d ? 'hover:bg-white/5 border-white/5' : 'hover:bg-zinc-50 border-zinc-200',
    footer: d ? 'bg-[#0A0A0A] border-white/[0.06]' : 'bg-zinc-100 border-zinc-200',
    accentBg: d ? 'bg-lime-500/10' : 'bg-lime-100',
    accentBg2: d ? 'bg-lime-500/15' : 'bg-lime-200',
    accentBorder: d ? 'border-lime-400/20' : 'border-lime-500/30',
    accentBgSub: d ? 'bg-lime-400/5' : 'bg-lime-50',
    dot: d ? 'bg-zinc-700' : 'bg-zinc-400',
    mockFrame: d ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-300 border-zinc-400',
    mockScreen: d ? 'bg-[#0A0A0A]' : 'bg-zinc-100',
    mockBar: d ? 'bg-zinc-800' : 'bg-zinc-300',
    mockCard: d ? 'bg-white/[0.06] border-white/[0.08]' : 'bg-white border-zinc-300',
    mockCardDim: d ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-zinc-50 border-zinc-200',
    mockDisabled: d ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-400',
    badge: d ? 'bg-[#0A0A0A] border-white/[0.1]' : 'bg-white border-zinc-300 shadow-sm',
    badgeIcon: d ? 'bg-white/[0.06]' : 'bg-zinc-200',
    linkColor: d ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900',
    catInactive: d
      ? 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:border-white/15 hover:text-white'
      : 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:text-zinc-900',
    urlBar: d ? 'bg-[#0A0A0A]' : 'bg-zinc-100',
    redIcon: d ? 'text-red-400' : 'text-red-500',
    redIconSub: d ? 'text-red-400/60' : 'text-red-400',
    analyticsBg: d ? 'bg-black/10' : 'bg-white/30',
    analyticsBorder: d ? 'border-black/5' : 'border-white/20',
    accentDot: d ? 'bg-lime-400/10' : 'bg-lime-200',
    accentDotBorder: d ? 'border-lime-400/20' : 'border-lime-400/40',
  }), [d]);

  return { theme, setTheme, toggleTheme, d, T };
}