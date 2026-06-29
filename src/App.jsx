// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// ─── SMALL COMPONENTS (keep as regular imports) ───
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

// ─── LAZY‑LOAD ALL PAGE COMPONENTS ───
const Landing = lazy(() => import('./pages/Landing'));
const Signup = lazy(() => import('./pages/Signup'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const OnboardingSuccess = lazy(() => import('./pages/OnboardingSuccess'));
const BioPage = lazy(() => import('./pages/BioPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const Discover = lazy(() => import('./pages/Discover'));
const Legal = lazy(() => import('./pages/Legal'));
const DashboardLogin = lazy(() => import('./pages/DashboardLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AffiliateSignup = lazy(() => import('./pages/AffiliateSignup'));
const AffiliateDashboard = lazy(() => import('./pages/AffiliateDashboard'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogArticle = lazy(() => import('./pages/BlogArticle'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RouteTracker />
      {/* Wrap Routes in Suspense – shows a minimal fallback while chunks load */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-zinc-400">Loading...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/discover" element={<Discover />} />

          {/* Blog Routes - MUST be before /:slug catch‑all */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding-success" element={<OnboardingSuccess />} />
          <Route path="/affiliate-signup" element={<AffiliateSignup />} />
          <Route path="/affiliate/dashboard/:affiliateId" element={<AffiliateDashboard />} />
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route path="/privacy" element={<Legal type="privacy" />} />
          <Route path="/dashboard" element={<DashboardLogin />} />
          <Route path="/dashboard/:slug" element={<Dashboard />} />
          <Route path="/book/:slug" element={<BookingPage />} />

          {/* Property Details Page - MUST be before /:slug catch‑all */}
          <Route path="/:slug/property/:propertyId" element={<PropertyDetails />} />

          {/* Business Profile Pages */}
          <Route path="/:slug" element={<BioPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}