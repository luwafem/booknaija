import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import OnboardingSuccess from './pages/OnboardingSuccess';
import BioPage from './pages/BioPage';
import Legal from './pages/Legal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
  <Route path="/onboarding" element={<Onboarding />} /> {/* ✅ NEW */}
  <Route path="/onboarding-success" element={<OnboardingSuccess />} /> {/* ✅ NEW */}
        <Route path="/terms" element={<Legal type="terms" />} />
        <Route path="/privacy" element={<Legal type="privacy" />} />
        <Route path="/:slug" element={<BioPage />} />
      </Routes>
    </BrowserRouter>
  );
}