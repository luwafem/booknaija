import { useState, useRef, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useLandingTheme } from '../hooks/useLandingTheme';
import { businessCategories } from '../data/landingData.jsx';

// Import all landing components
import AnnouncementBar from '../components/landing/AnnouncementBar';
import NavBar from '../components/landing/NavBar';
import HeroSection from '../components/landing/HeroSection';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import MetaProofSection from '../components/landing/MetaProofSection';
import GetPaidSection from '../components/landing/GetPaidSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import PricingSection from '../components/landing/PricingSection';
import StepsSection from '../components/landing/StepsSection';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Landing() {
  const { T, d, toggleTheme } = useLandingTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const debounceTimer = useRef(null);

  const active = useMemo(() => businessCategories[activeCategory], [activeCategory]);

  // ─── Animation Observer ───
  useEffect(() => {
    document.documentElement.classList.add('bn-anim-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bn-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('bn-anim-ready');
    };
  }, []);

  // ─── Auto-rotate categories ───
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev === businessCategories.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── Search debounce ───
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const q = searchQuery.trim().toLowerCase();
        const { data, error } = await supabase
          .from('businesses')
          .select('slug, name, tagline, logo, accent')
          .eq('active', true)
          .or('name.ilike.%' + q + '%,slug.ilike.%' + q + '%')
          .limit(8);
        if (error) {
          setSearchResults([]);
        } else {
          setSearchResults(data || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  return (
    <div className={`min-h-screen ${T.page} ${T.pageText} font-sans selection:bg-lime-500/30 selection:text-white overflow-x-hidden transition-colors duration-300`}>
      <style>{`
        [data-animate]{opacity:1;transform:translateY(0)}
        .bn-anim-ready [data-animate]{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
        .bn-anim-ready [data-animate].bn-visible{opacity:1;transform:translateY(0)}
        .bn-anim-ready [data-delay-1]{transition-delay:.1s}
        .bn-anim-ready [data-delay-2]{transition-delay:.2s}
        .bn-anim-ready [data-delay-3]{transition-delay:.3s}
        @keyframes bn-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .bn-float{animation:bn-float 3s ease-in-out infinite}
        @keyframes bn-float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .bn-float2{animation:bn-float2 3.5s ease-in-out infinite;animation-delay:.6s}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <AnnouncementBar />
      <NavBar T={T} d={d} toggleTheme={toggleTheme} />

      <main>
        <HeroSection
          T={T}
          d={d}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
          hasSearched={hasSearched}
        />

        <ShowcaseSection
          T={T}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          active={active}
        />

        <MetaProofSection T={T} />
        <GetPaidSection T={T} d={d} />
        <FeaturesGrid T={T} />
        <PricingSection T={T} />
        <StepsSection T={T} />
        <FinalCTA T={T} />
      </main>

      <Footer T={T} />
    </div>
  );
}