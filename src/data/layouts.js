// src/data/layouts.js
import PropertyLayout from '../components/bio/property/PropertyLayout';
import DefaultLayout from '../components/bio/DefaultLayout';
// import ModernPropertyLayout from '../components/bio/property/ModernPropertyLayout'; // future

export const LAYOUT_MAP = {
  // For property‑oriented businesses (Real Estate, Shortlet)
  property: {
    default: PropertyLayout,
    // modern: ModernPropertyLayout,
  },
  // For all other business types (fallback)
  default: {
    default: DefaultLayout,
  },
};

/**
 * Returns the layout component for a given business type and template.
 * If the template is not found, falls back to the default template for that category.
 */
export function getLayoutComponent(businessType, template = 'default') {
  const category = (businessType === 'Real Estate' || businessType === 'Shortlet')
    ? 'property'
    : 'default';
  const layoutMap = LAYOUT_MAP[category] || LAYOUT_MAP.default;
  const Component = layoutMap[template] || layoutMap.default;
  return Component;
}