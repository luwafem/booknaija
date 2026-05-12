import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import OnboardingSuccess from './pages/OnboardingSuccess';
import BioPage from './pages/BioPage';
import BookingPage from './pages/BookingPage'; // NEW
import Discover from './pages/Discover';
import Legal from './pages/Legal';
import DashboardLogin from './pages/DashboardLogin';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import AffiliateSignup from './pages/AffiliateSignup';
import AffiliateDashboard from './pages/AffiliateDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', { page_path: pathname });
    }
  }, [pathname]);
  return null;
}

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
        <Route path="/" element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding-success" element={<OnboardingSuccess />} />
        <Route path="/affiliate-signup" element={<AffiliateSignup />} />
        <Route path="/affiliate/dashboard/:affiliateId" element={<AffiliateDashboard />} />
        <Route path="/terms" element={<Legal type="terms" />} />
        <Route path="/privacy" element={<Legal type="privacy" />} />
        <Route path="/dashboard" element={<DashboardLogin />} />
        <Route path="/dashboard/:slug" element={<Dashboard />} />
        
        {/* NEW: Booking page route — MUST be before /:slug */}
        <Route path="/book/:slug" element={<BookingPage />} />
        
        {/* Business Profile Pages (No Booking Form) */}
        <Route path="/:slug" element={<BioPage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}