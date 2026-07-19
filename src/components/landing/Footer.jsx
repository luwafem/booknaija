import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 pt-10 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src="/fav-removebg.png" alt="Five9" className="h-8 w-auto" />
            </Link>
            <p className="text-xs mt-2 max-w-[200px] text-zinc-500">
              Your business. One simple link. Meta-proof.
            </p>
          </div>
          <div className="flex gap-8 sm:gap-12">
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Product</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#pricing" className="text-zinc-600 hover:text-lime-600 transition-colors">Pricing</a></li>
                <li><a href="#features" className="text-zinc-600 hover:text-lime-600 transition-colors">Features</a></li>
                <li><Link to="/signup" className="text-zinc-600 hover:text-lime-600 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Partners</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/affiliate-signup" className="text-zinc-600 hover:text-lime-600 transition-colors">Affiliate</Link></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Company</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/blog" className="text-zinc-600 hover:text-lime-600 transition-colors">Blog</Link></li>
                <li><Link to="/privacy" className="text-zinc-600 hover:text-lime-600 transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-zinc-600 hover:text-lime-600 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between gap-3 items-center">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Five9 Technologies.
          </p>
          <div className="flex gap-4 text-xs text-zinc-400">
            <Link to="/terms" className="hover:text-lime-600 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-lime-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}