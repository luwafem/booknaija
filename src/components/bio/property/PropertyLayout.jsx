// PropertyLayout.jsx — adds DM Sans font globally
import PropertyHeader from './PropertyHeader';
import PropertyHero from './PropertyHero';
import PropertyEstates from './PropertyEstates';
import PropertyListings from './PropertyListings';
import PropertyAbout from './PropertyAbout';
import PropertyFooter from './PropertyFooter';

export default function PropertyLayout({ biz, accent, isDark, onSelectProperty }) {
  const estatesEnabled = biz.estatesEnabled === true;
  const propertiesEnabled = biz.propertiesEnabled === true;

  const rawEstates = biz.estates || [];
  const estates = rawEstates.slice().sort(function (a, b) {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  const showEstates = estatesEnabled && estates.length > 0;
  const showProperties = propertiesEnabled && (biz.properties || []).length > 0;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
      <style>{`body, body * { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }`}</style>
      <div className="min-h-screen scroll-smooth">
        <PropertyHeader biz={biz} accent={accent} isDark={isDark} />
        <PropertyHero biz={biz} accent={accent} isDark={isDark} />

        {showProperties && (
          <PropertyListings
            biz={biz}
            accent={accent}
            isDark={isDark}
            onSelectProperty={onSelectProperty}
          />
        )}

        {showEstates && (
          <PropertyEstates
            biz={{ ...biz, estates }}
            accent={accent}
            isDark={isDark}
            onSelectProperty={onSelectProperty}
          />
        )}

        <PropertyAbout biz={biz} accent={accent} isDark={isDark} />
        <PropertyFooter biz={biz} accent={accent} isDark={isDark} />
      </div>
    </>
  );
}