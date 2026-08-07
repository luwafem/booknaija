// src/pages/Landing.jsx
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLandingTheme } from '../hooks/useLandingTheme';
import { optimizeImage } from '../lib/utils';

// Components
import AnnouncementBar from '../components/landing/AnnouncementBar';
import NavBar from '../components/landing/NavBar';
import HeroSection from '../components/landing/HeroSection';
import TrustBar from '../components/landing/TrustBar';
import StepsSection from '../components/landing/StepsSection';
import Categories from '../components/landing/Categories';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import Testimonials from '../components/landing/Testimonials';
import PricingSection from '../components/landing/PricingSection';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Landing() {
  const { T, d, toggleTheme } = useLandingTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef(null);

  // ─── Hero data from admin settings ───
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroLoading, setHeroLoading] = useState(true);

  // ─── Fetch hero text and image from public settings endpoint ───
  useEffect(() => {
    const fetchHeroData = async () => {
      setHeroLoading(true);
      try {
        const res = await fetch('/.netlify/functions/public-settings');
        if (!res.ok) throw new Error('Failed to fetch hero settings');
        const data = await res.json();
        if (data.hero_title) setHeroTitle(data.hero_title);
        if (data.hero_description) setHeroDescription(data.hero_description);
        if (data.hero_image) setHeroImage(data.hero_image);
      } catch (err) {
        // Silently fail – hero data will use default fallbacks in HeroSection
        console.warn('Hero settings not available, using defaults.');
      } finally {
        setHeroLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  // Animation Observer
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

  // Search debounce
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-lime-400/30 selection:text-black overflow-x-hidden">
      <style>{`
        [data-animate]{opacity:1;transform:translateY(0)}
        .bn-anim-ready [data-animate]{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
        .bn-anim-ready [data-animate].bn-visible{opacity:1;transform:translateY(0)}
        .bn-anim-ready [data-delay-1]{transition-delay:.1s}
        .bn-anim-ready [data-delay-2]{transition-delay:.2s}
        .bn-anim-ready [data-delay-3]{transition-delay:.3s}
        .font-display { font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
      `}</style>

      <AnnouncementBar />
      <NavBar T={T} d={d} toggleTheme={toggleTheme} />

      <main>
        <HeroSection
          T={T}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
          hasSearched={hasSearched}
          heroTitle={heroTitle}
          heroDescription={heroDescription}
          heroImage={heroImage ? optimizeImage(heroImage, 1200) : ''}
          heroLoading={heroLoading}
        />
        <TrustBar T={T} />
        <StepsSection T={T} />
        <Categories T={T} />
        <PricingSection T={T} />
        <FeaturesGrid T={T} />
        <Testimonials T={T} />
        <FinalCTA T={T} />
      </main>

      <Footer />
    </div>
  );
}