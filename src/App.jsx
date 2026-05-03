import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import OnboardingSuccess from './pages/OnboardingSuccess';
import BioPage from './pages/BioPage';
import Legal from './pages/Legal';
import DashboardLogin from './pages/DashboardLogin';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Scroll to top on route change (important for SEO & UX)
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

// Track route changes for analytics
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_search: location.search || undefined,
      });
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RouteTracker />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding-success" element={<OnboardingSuccess />} />
        
        {/* Legal Pages */}
        <Route path="/terms" element={<Legal type="terms" />} />
        <Route path="/privacy" element={<Legal type="privacy" />} />
        
        {/* Dashboard (Protected - noindex) */}
        <Route path="/dashboard" element={<DashboardLogin />} />
        <Route path="/dashboard/:slug" element={<Dashboard />} />
        
        {/* Business Pages - Dynamic Slugs */}
        <Route path="/:slug" element={<BioPage />} />
        
        {/* 404 Page - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}