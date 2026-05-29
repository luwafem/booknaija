import PropertyHeader from './PropertyHeader';
import PropertyHero from './PropertyHero';
import PropertyAbout from './PropertyAbout'; // <-- NEW IMPORT
import PropertyListings from './PropertyListings';
import PropertyFooter from './PropertyFooter';

export default function PropertyLayout({ biz, accent, isDark, onSelectProperty }) {
  return (
    // Added scroll-smooth for elegant anchor navigation from the header
    <div className="min-h-screen scroll-smooth">
      <PropertyHeader biz={biz} accent={accent} isDark={isDark} />
      <PropertyHero biz={biz} accent={accent} isDark={isDark} />
      <PropertyListings biz={biz} accent={accent} isDark={isDark} onSelectProperty={onSelectProperty} />
      
      {/* Extracted About Section */}
      <PropertyAbout biz={biz} accent={accent} isDark={isDark} />

      <PropertyFooter biz={biz} accent={accent} isDark={isDark} />
    </div>
  );
}