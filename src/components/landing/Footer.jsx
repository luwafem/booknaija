// src/components/landing/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-12 sm:gap-16">
          <div className="text-center sm:text-left">
            <Link to="/" className="flex items-center justify-center sm:justify-start gap-2">
              <img src="/fav-removebg.png" alt="Five9" className="h-8 w-auto" />
            </Link>
            <p className="text-xs text-zinc-500 mt-3 max-w-[200px] mx-auto sm:mx-0">
              Your business, always online.
            </p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-12 sm:gap-16">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Product</p>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm">
                <li><a href="#pricing" className="text-zinc-500 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/signup" className="text-zinc-500 hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Partners</p>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm">
                <li><Link to="/affiliate-signup" className="text-zinc-500 hover:text-white transition-colors">Affiliate</Link></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Company</p>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm">
                <li><Link to="/blog" className="text-zinc-500 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/privacy" className="text-zinc-500 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-6 items-center">
          <p className="text-xs text-zinc-500 text-center sm:text-left">© {new Date().getFullYear()} Five9 Technologies.</p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}